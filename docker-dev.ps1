# ABR Insights - Docker Development Helper Script
# This script simplifies Docker-based development on Windows
# where Next.js 16 Turbopack has compatibility issues

Write-Host "ABR Insights - Docker Development" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Function to show usage
function Show-Usage {
    Write-Host "Usage: .\docker-dev.ps1 [command]" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Commands:"
    Write-Host "  build     - Build the Docker image with Supabase config"
    Write-Host "  start     - Start the application container"
    Write-Host "  stop      - Stop the application container"
    Write-Host "  restart   - Restart the application container"
    Write-Host "  logs      - Show container logs (follow mode)"
    Write-Host "  status    - Show container status"
    Write-Host "  clean     - Stop and remove container"
    Write-Host "  rebuild   - Clean, rebuild, and start"
    Write-Host ""
}

# Get command from args
$command = $args[0]

# Container name
$containerName = "abr-dev"
$imageName = "abr-insights-app:dev"

# Load environment variables from .env.docker
if (-not (Test-Path ".env.docker")) {
    Write-Host "Error: .env.docker not found!" -ForegroundColor Red
    Write-Host "Please create .env.docker with required environment variables." -ForegroundColor Yellow
    exit 1
}

# Parse .env.docker for build args
$envVars = Get-Content .env.docker | Where-Object { $_ -notmatch '^\s*#' -and $_ -match '=' }
$supabaseUrl = ($envVars | Where-Object { $_ -match 'NEXT_PUBLIC_SUPABASE_URL=' }) -replace 'NEXT_PUBLIC_SUPABASE_URL=', ''
$supabaseAnonKey = ($envVars | Where-Object { $_ -match 'NEXT_PUBLIC_SUPABASE_ANON_KEY=' }) -replace 'NEXT_PUBLIC_SUPABASE_ANON_KEY=', ''
$supabaseServiceKey = ($envVars | Where-Object { $_ -match 'SUPABASE_SERVICE_ROLE_KEY=' }) -replace 'SUPABASE_SERVICE_ROLE_KEY=', ''

switch ($command) {
    "build" {
        Write-Host "Building Docker image with Supabase configuration..." -ForegroundColor Green
        docker build `
            --build-arg NEXT_PUBLIC_SUPABASE_URL="$supabaseUrl" `
            --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="$supabaseAnonKey" `
            --build-arg SUPABASE_SERVICE_ROLE_KEY="$supabaseServiceKey" `
            -t $imageName `
            -f Dockerfile .
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Build completed successfully!" -ForegroundColor Green
        } else {
            Write-Host "✗ Build failed!" -ForegroundColor Red
            exit 1
        }
    }
    
    "start" {
        Write-Host "Starting application container..." -ForegroundColor Green
        docker run --rm -d -p 3000:3000 --env-file .env.docker --name $containerName $imageName
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Container started!" -ForegroundColor Green
            Write-Host ""
            Write-Host "Application running at: http://localhost:3000" -ForegroundColor Cyan
            Write-Host "View logs with: .\docker-dev.ps1 logs" -ForegroundColor Yellow
        } else {
            Write-Host "✗ Failed to start container!" -ForegroundColor Red
            exit 1
        }
    }
    
    "stop" {
        Write-Host "Stopping container..." -ForegroundColor Yellow
        docker stop $containerName
        Write-Host "✓ Container stopped" -ForegroundColor Green
    }
    
    "restart" {
        Write-Host "Restarting container..." -ForegroundColor Yellow
        docker stop $containerName 2>$null
        Start-Sleep -Seconds 2
        docker run --rm -d -p 3000:3000 --env-file .env.docker --name $containerName $imageName
        Write-Host "✓ Container restarted!" -ForegroundColor Green
    }
    
    "logs" {
        Write-Host "Showing container logs (Ctrl+C to exit)..." -ForegroundColor Yellow
        docker logs -f $containerName
    }
    
    "status" {
        Write-Host "Container status:" -ForegroundColor Cyan
        docker ps -a --filter name=$containerName
    }
    
    "clean" {
        Write-Host "Cleaning up..." -ForegroundColor Yellow
        docker stop $containerName 2>$null
        docker rm $containerName 2>$null
        Write-Host "✓ Cleanup complete" -ForegroundColor Green
    }
    
    "rebuild" {
        Write-Host "Rebuilding from scratch..." -ForegroundColor Cyan
        docker stop $containerName 2>$null
        docker rm $containerName 2>$null
        
        Write-Host "Building..." -ForegroundColor Green
        docker build `
            --build-arg NEXT_PUBLIC_SUPABASE_URL="$supabaseUrl" `
            --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="$supabaseAnonKey" `
            --build-arg SUPABASE_SERVICE_ROLE_KEY="$supabaseServiceKey" `
            -t $imageName `
            -f Dockerfile .
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Starting..." -ForegroundColor Green
            docker run --rm -d -p 3000:3000 --env-file .env.docker --name $containerName $imageName
            Write-Host "✓ Rebuild complete!" -ForegroundColor Green
            Write-Host ""
            Write-Host "Application running at: http://localhost:3000" -ForegroundColor Cyan
        } else {
            Write-Host "✗ Rebuild failed!" -ForegroundColor Red
            exit 1
        }
    }
    
    default {
        Show-Usage
        exit 0
    }
}
