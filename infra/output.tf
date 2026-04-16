output "swa_default_hostname" {
  description = "The auto-generated URL for your Vue frontend."
  value       = azurerm_static_web_app.swa.default_host_name
}

output "cosmosdb_endpoint" {
  description = "The endpoint URL for the Cosmos DB account."
  value       = azurerm_cosmosdb_account.db.endpoint
}

output "cosmosdb_connection_string" {
  description = "The primary connection string for the backend API."
  value       = azurerm_cosmosdb_account.db.primary_sql_connection_string
  sensitive   = true
}