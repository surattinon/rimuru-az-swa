variable "location" {
  type        = string
  description = "The Azure region to deploy resources into."
}

variable "project_name" {
  type        = string
  description = "The base name for the project resources."
}

variable "cosmos_account_name" {
  type        = string
  description = "The globally unique name for the Cosmos DB account."
}