# Azure Container Apps Setup Script
# Run this script to create the Azure resources needed for deployment

param(
    [Parameter(Mandatory=$false)]
    [string]$ResourceGroup = "abr-insights-rg",
    
    [Parameter(Mandatory=$false)]
    [string]$Location = "eastus",
    
    [Parameter(Mandatory=$false)]
    [string]$ContainerRegistry = "abrinsightsacr",
    
    [Parameter(Mandatory=$false)]
    [string]$ContainerApp = "abr-insights-app",
    
    [Parameter(Mandatory=$false)]
    [string]$Environment = "abr-insights-env"
)

Write-Host "🚀 Azure Container Apps Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if Azure CLI is installed
try {
    $azVersion = az version --query '\"azure-cli\"' -o tsv
    Write-Host "✅ Azure CLI version: $azVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Azure CLI not found. Please install: https://aka.ms/installazurecliwindows" -ForegroundColor Red
    exit 1
}

# Check if logged in
Write-Host "`nChecking Azure login status..." -ForegroundColor Yellow
$account = az account show 2>$null
if (-not $account) {
    Write-Host "❌ Not logged in to Azure. Running login..." -ForegroundColor Yellow
    az login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Azure login failed" -ForegroundColor Red
        exit 1
    }
}

$accountInfo = az account show | ConvertFrom-Json
Write-Host "✅ Logged in as: $($accountInfo.user.name)" -ForegroundColor Green
Write-Host "   Subscription: $($accountInfo.name) ($($accountInfo.id))" -ForegroundColor Gray

# Create Resource Group
Write-Host "`n📦 Creating Resource Group..." -ForegroundColor Yellow
az group create `
    --name $ResourceGroup `
    --location $Location `
    --output table

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to create resource group" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Resource Group created: $ResourceGroup" -ForegroundColor Green

# Create Azure Container Registry
Write-Host "`n🐳 Creating Azure Container Registry..." -ForegroundColor Yellow
az acr create `
    --resource-group $ResourceGroup `
    --name $ContainerRegistry `
    --sku Basic `
    --admin-enabled true `
    --output table

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Container Registry may already exist or error occurred" -ForegroundColor Yellow
}

# Get ACR credentials
Write-Host "`n🔑 Getting ACR credentials..." -ForegroundColor Yellow
$acrUsername = az acr credential show --name $ContainerRegistry --resource-group $ResourceGroup --query username -o tsv
$acrPassword = az acr credential show --name $ContainerRegistry --resource-group $ResourceGroup --query 'passwords[0].value' -o tsv

Write-Host "✅ ACR Username: $acrUsername" -ForegroundColor Green
Write-Host "✅ ACR Password: [REDACTED]" -ForegroundColor Green

# Create Container Apps Environment
Write-Host "`n🌍 Creating Container Apps Environment..." -ForegroundColor Yellow
az containerapp env create `
    --name $Environment `
    --resource-group $ResourceGroup `
    --location $Location `
    --output table

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Container Apps Environment may already exist or error occurred" -ForegroundColor Yellow
}
Write-Host "✅ Container Apps Environment created: $Environment" -ForegroundColor Green

# Create Container App
Write-Host "`n📱 Creating Container App..." -ForegroundColor Yellow
Write-Host "   Note: Initial image will be a placeholder. Push your app image to deploy." -ForegroundColor Gray

az containerapp create `
    --name $ContainerApp `
    --resource-group $ResourceGroup `
    --environment $Environment `
    --image mcr.microsoft.com/azuredocs/containerapps-helloworld:latest `
    --target-port 3000 `
    --ingress external `
    --registry-server "$ContainerRegistry.azurecr.io" `
    --registry-username $acrUsername `
    --registry-password $acrPassword `
    --min-replicas 0 `
    --max-replicas 10 `
    --cpu 1.0 `
    --memory 2.0Gi `
    --output table

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to create container app" -ForegroundColor Red
    exit 1
}

# Get Container App URL
$appUrl = az containerapp show `
    --name $ContainerApp `
    --resource-group $ResourceGroup `
    --query properties.configuration.ingress.fqdn `
    -o tsv

Write-Host "`n✅ Container App created: $ContainerApp" -ForegroundColor Green
Write-Host "   URL: https://$appUrl" -ForegroundColor Cyan

# Create Service Principal for GitHub Actions
Write-Host "`n🔐 Creating Service Principal for GitHub Actions..." -ForegroundColor Yellow
$subscriptionId = $accountInfo.id

$sp = az ad sp create-for-rbac `
    --name "github-actions-$ContainerApp" `
    --role contributor `
    --scopes "/subscriptions/$subscriptionId/resourceGroups/$ResourceGroup" `
    --sdk-auth | ConvertFrom-Json

Write-Host "✅ Service Principal created" -ForegroundColor Green

# Summary
Write-Host "`n================================" -ForegroundColor Cyan
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 GitHub Secrets to Add:" -ForegroundColor Yellow
Write-Host ""
Write-Host "AZURE_CREDENTIALS:" -ForegroundColor White
$sp | ConvertTo-Json -Depth 10
Write-Host ""
Write-Host "ACR_USERNAME: $acrUsername" -ForegroundColor White
Write-Host "ACR_PASSWORD: $acrPassword" -ForegroundColor White
Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Add the above secrets to your GitHub repository" -ForegroundColor White
Write-Host "   Settings → Secrets and variables → Actions → New repository secret" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Also add these existing secrets (from your current deployment):" -ForegroundColor White
Write-Host "   - NEXT_PUBLIC_SUPABASE_URL" -ForegroundColor Gray
Write-Host "   - NEXT_PUBLIC_SUPABASE_ANON_KEY" -ForegroundColor Gray
Write-Host "   - NEXT_PUBLIC_APP_URL (set to https://$appUrl)" -ForegroundColor Gray
Write-Host "   - SUPABASE_SERVICE_ROLE_KEY" -ForegroundColor Gray
Write-Host "   - STRIPE_SECRET_KEY" -ForegroundColor Gray
Write-Host "   - REDIS_URL" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Push to main branch to trigger deployment" -ForegroundColor White
Write-Host "   git push origin main" -ForegroundColor Gray
Write-Host ""
Write-Host "4. After deployment, validate CSP headers:" -ForegroundColor White
Write-Host "   .\scripts\validate-csp-headers.ps1 -BaseUrl `"https://$appUrl`"" -ForegroundColor Gray
Write-Host ""
Write-Host "🌐 Container App URL: https://$appUrl" -ForegroundColor Cyan
Write-Host ""
