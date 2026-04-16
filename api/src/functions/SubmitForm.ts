import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { CosmosClient } from "@azure/cosmos";

// CRITICAL ARCHITECTURE NOTE:
// We initialize the CosmosClient OUTSIDE the main function handler.
// This keeps the connection "warm" across multiple function executions.
const endpoint = process.env.COSMOS_DB_CONNECTION_STRING;
if (!endpoint) {
    throw new Error("Missing COSMOS_DB_CONNECTION_STRING in environment variables.");
}
const client = new CosmosClient(endpoint);

export async function SubmitForm(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    try {
        // 1. Extract the payload from the incoming request
        // In the v4 model, request.json() is an asynchronous promise.
        const body = await request.json() as any;
        const { name, email, message } = body || {};

        // 2. Validate against our LLD API Contract
        if (!name || !email || !message) {
            return {
                status: 400,
                jsonBody: { error: "Bad Request: Missing required fields (name, email, message)." }
            };
        }

        // 3. Connect to the Database and Container
        const databaseName = "VueAppDB";
        const containerName = "Submissions";
        
        const { database } = await client.databases.createIfNotExists({ id: databaseName });
        const { container } = await database.containers.createIfNotExists({ 
            id: containerName,
            partitionKey: { paths: ["/email"] } 
        });

        // 4. Construct the final document
        const newSubmission = {
            name: name,
            email: email,
            message: message,
            createdAt: new Date().toISOString()
        };

        // 5. Write to Cosmos DB
        const { resource: createdItem } = await container.items.create(newSubmission);

        // 6. Return the Success Response
        return {
            status: 201, // HTTP 201 means "Created"
            jsonBody: { 
                status: "success", 
                id: createdItem.id 
            }
        };

    } catch (error) {
        // 7. Graceful Error Handling
        context.log("Database transaction failed:", error);
        return {
            status: 500,
            jsonBody: { error: "Internal Server Error while saving submission." }
        };
    }
};

// 8. The v4 Registration (Replaces function.json)
app.http('SubmitForm', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: SubmitForm
});