# Docker Build Script for Windows PowerShell
# Builds Next.js app inside Docker to avoid exFAT filesystem issues

param(
    [switch]$Clean,
    [switch]$Extract,
    [switch]$Run,
    [switch]$Help
)

$ErrorActionPreference = "Stop"

function Show-Help {
    Write-Host "ABR Insights App - Docker Build Script" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage: .\docker-build.ps1 [options]" -ForegroundColor White
    Write-Host ""
    Write-Host "Options:" -ForegroundColor Yellow
    Write-Host "  -Clean    Clean .next folder before building"
    Write-Host "  -Extract  Extract build artifacts from container to local .next folder"
    Write-Host "  -Run      Run production server after building"
    Write-Host "  -Help     Show this help message"
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Yellow
    Write-Host "  .\docker-build.ps1                    # Build only"
    Write-Host "  .\docker-build.ps1 -Clean             # Clean and build"
    Write-Host "  .\docker-build.ps1 -Extract           # Build and extract artifacts"
    Write-Host "  .\docker-build.ps1 -Clean -Extract    # Clean, build, and extract"
    Write-Host "  .\docker-build.ps1 -Run               # Build and run production server"
    Write-Host ""
}

if ($Help) {
    Show-Help
    exit 0
}

Write-Host ""
Write-Host "=== ABR Insights App - Docker Build ===" -ForegroundColor Green
$timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
Write-Host "Date: $timestamp" -ForegroundColor Gray
Write-Host ""

# Clean .next folder if requested
if ($Clean) {
    Write-Host "[1/4] Cleaning .next folder..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
    Write-Host "Successfully cleaned" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "[1/4] Skipping clean (use -Clean to clean)" -ForegroundColor Gray
    Write-Host ""
}

# Build Docker image
Write-Host "[2/4] Building Docker image..." -ForegroundColor Yellow
docker build -f Dockerfile.build -t abr-insights-app:build --target builder .

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "Build complete" -ForegroundColor Green
Write-Host ""

# Extract artifacts if requested
if ($Extract) {
    Write-Host "[3/4] Extracting build artifacts..." -ForegroundColor Yellow
    
    # Create container
    $containerId = docker create abr-insights-app:build
    
    # Copy .next folder from container
    docker cp "${containerId}:/app/.next" .
    
    # Remove container
    docker rm $containerId | Out-Null
    
    Write-Host "Artifacts extracted to .next folder" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "[3/4] Skipping artifact extraction (use -Extract to extract)" -ForegroundColor Gray
    Write-Host ""
}

# Run production server if requested
if ($Run) {
    Write-Host "[4/4] Starting production server..." -ForegroundColor Yellow
    docker-compose up app
} else {
    Write-Host "[4/4] Skipping server start (use -Run to start)" -ForegroundColor Gray
    Write-Host ""
}

Write-Host ""
Write-Host "=== Build Complete ===" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  Extract artifacts: .\docker-build.ps1 -Extract"
Write-Host "  Run production:    .\docker-build.ps1 -Run"
Write-Host "  Deploy to Azure:   Use extracted .next folder"
Write-Host ""
