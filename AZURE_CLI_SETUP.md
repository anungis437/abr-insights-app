# Azure OpenAI Setup via Azure CLI

This script will help you retrieve your Azure OpenAI credentials using Azure CLI.

## Prerequisites

- Azure CLI installed
- Azure account with OpenAI access

## Step 1: Login to Azure

```powershell
az login
```

## Step 2: List your Azure OpenAI resources

```powershell
# List all Cognitive Services (OpenAI) resources
az cognitiveservices account list --query "[?kind=='OpenAI'].{Name:name, ResourceGroup:resourceGroup, Location:location}" -o table
```

## Step 3: Get the Endpoint

Replace `<resource-name>` and `<resource-group>` with your values:

```powershell
az cognitiveservices account show `
  --name <resource-name> `
  --resource-group <resource-group> `
  --query "properties.endpoint" -o tsv
```

## Step 4: Get the API Key

```powershell
az cognitiveservices account keys list `
  --name <resource-name> `
  --resource-group <resource-group> `
  --query "key1" -o tsv
```

## Step 5: List Deployments

```powershell
az cognitiveservices account deployment list `
  --name <resource-name> `
  --resource-group <resource-group> `
  --query "[].{Name:name, Model:properties.model.name, Version:properties.model.version}" -o table
```

## All-in-One Script

Save your resource details and run this:

```powershell
# Set your resource details
$RESOURCE_NAME = "your-openai-resource-name"
$RESOURCE_GROUP = "your-resource-group"

# Get endpoint
$ENDPOINT = az cognitiveservices account show `
  --name $RESOURCE_NAME `
  --resource-group $RESOURCE_GROUP `
  --query "properties.endpoint" -o tsv

# Get API key
$API_KEY = az cognitiveservices account keys list `
  --name $RESOURCE_NAME `
  --resource-group $RESOURCE_GROUP `
  --query "key1" -o tsv

# Get deployments
Write-Host "`nAvailable Deployments:" -ForegroundColor Cyan
az cognitiveservices account deployment list `
  --name $RESOURCE_NAME `
  --resource-group $RESOURCE_GROUP `
  --query "[].{Name:name, Model:properties.model.name}" -o table

# Display credentials
Write-Host "`n==============================================================" -ForegroundColor Green
Write-Host "Azure OpenAI Credentials" -ForegroundColor Green
Write-Host "==============================================================" -ForegroundColor Green
Write-Host "AZURE_OPENAI_ENDPOINT=$ENDPOINT"
Write-Host "AZURE_OPENAI_API_KEY=$API_KEY"
Write-Host "AZURE_OPENAI_DEPLOYMENT_NAME=<deployment-name-from-list-above>"
Write-Host "==============================================================" -ForegroundColor Green
Write-Host "`nAdd these to your .env.local file" -ForegroundColor Yellow
```

## Quick Commands

I'll run these commands for you to find your Azure OpenAI resources.
