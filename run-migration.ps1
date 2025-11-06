Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  ABR Insights - Database Migration Helper" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Due to Supabase security restrictions, DDL statements" -ForegroundColor Yellow
Write-Host "(CREATE TABLE) cannot be executed via API or CLI." -ForegroundColor Yellow
Write-Host ""
Write-Host "Please follow these steps:" -ForegroundColor White
Write-Host ""
Write-Host "1. Opening Supabase SQL Editor in browser..." -ForegroundColor Green
Start-Process "https://app.supabase.com/project/nuywgvbkgdvngrysqdul/sql/new"
Write-Host ""
Write-Host "2. Open this file in your editor:" -ForegroundColor Green
Write-Host "   $PSScriptRoot\create_tables.sql" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Copy ALL the SQL (Ctrl+A, Ctrl+C)" -ForegroundColor Green
Write-Host ""
Write-Host "4. Paste into SQL Editor and click 'Run'" -ForegroundColor Green
Write-Host ""
Write-Host "5. Return here and press any key to verify..." -ForegroundColor Yellow
Write-Host ""
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Write-Host ""
Write-Host "Verifying tables..." -ForegroundColor Cyan
npx tsx --env-file=.env.local ingestion\src\debug\setup-tables.ts

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Green
    Write-Host "  SUCCESS! Running storage integration test..." -ForegroundColor Green
    Write-Host "============================================================" -ForegroundColor Green
    Write-Host ""
    npx tsx --env-file=.env.local ingestion\src\debug\test-storage-integration.ts
} else {
    Write-Host ""
    Write-Host "Tables not found. Please try the steps again." -ForegroundColor Red
    Write-Host ""
    Write-Host "Tip: Make sure you clicked 'Run' in the SQL Editor" -ForegroundColor Yellow
    Write-Host ""
}
