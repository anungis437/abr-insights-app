Write-Host "Monitoring npm installation..." -ForegroundColor Cyan

$maxWaitMinutes = 10
$checkIntervalSeconds = 5
$elapsed = 0

while ($elapsed -lt ($maxWaitMinutes * 60)) {
    if (Test-Path "node_modules\next\dist\bin\next.js") {
        Write-Host ""
        Write-Host "Installation complete!" -ForegroundColor Green
        Write-Host "Next.js found at: node_modules\next" -ForegroundColor Gray
        
        Start-Sleep -Seconds 2
        
        Write-Host ""
        Write-Host "Starting dev server..." -ForegroundColor Cyan
        Write-Host "========================================" -ForegroundColor Gray
        
        # Start the dev server
        pnpm run dev
        
        exit 0
    }
    
    $dots = "." * (($elapsed / $checkIntervalSeconds) % 4)
    $status = "Waiting for installation" + $dots + "    "
    Write-Host $status -NoNewline
    Write-Host "`r" -NoNewline
    
    Start-Sleep -Seconds $checkIntervalSeconds
    $elapsed += $checkIntervalSeconds
}

Write-Host ""
Write-Host ""
Write-Host "Installation timeout after $maxWaitMinutes minutes" -ForegroundColor Red
Write-Host "Try running manually: pnpm install" -ForegroundColor Yellow
exit 1
