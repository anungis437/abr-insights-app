$maxWaitMinutes = 15
$checkIntervalSeconds = 5
$startTime = Get-Date

Write-Host "Monitoring npm install progress..." -ForegroundColor Cyan
Write-Host "Will auto-start server when Next.js is detected..." -ForegroundColor Yellow
Write-Host ""

while ($true) {
    $elapsed = (Get-Date) - $startTime
    
    if ($elapsed.TotalMinutes -ge $maxWaitMinutes) {
        Write-Host "Timeout after $maxWaitMinutes minutes" -ForegroundColor Red
        exit 1
    }
    
    if (Test-Path "node_modules\\next\\dist\\bin\\next.js") {
        Write-Host ""
        Write-Host "Next.js detected! Starting dev server..." -ForegroundColor Green
        Write-Host ""
        Start-Sleep -Seconds 2
        pnpm run dev
        exit 0
    }
    
    Write-Host "." -NoNewline
    Start-Sleep -Seconds $checkIntervalSeconds
}
