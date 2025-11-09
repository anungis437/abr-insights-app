# ============================================================================
# Apply Phase 10 Migrations via Supabase CLI
# ============================================================================
# This script applies Phase 10 migrations using the Supabase CLI
# Prerequisites: supabase CLI installed and project linked
# ============================================================================

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Phase 10 Migration Application (CLI)                     ║" -ForegroundColor Cyan
Write-Host "║  Applying Enterprise Foundation Migrations                 ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check if Supabase CLI is installed
$supabaseVersion = supabase --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Supabase CLI not found. Please install it first:" -ForegroundColor Red
    Write-Host "   npm install -g supabase" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Supabase CLI installed: $supabaseVersion" -ForegroundColor Green
Write-Host ""

# Migration files
$migrations = @(
    "20250116000001_enterprise_sso_auth.sql",
    "20250116000002_advanced_rbac.sql",
    "20250116000003_audit_logs_enhancement.sql"
)

$projectRoot = Split-Path $PSScriptRoot -Parent
$migrationsPath = Join-Path $projectRoot "supabase" "migrations"

# Verify migration files exist
Write-Host "📋 Checking migration files..." -ForegroundColor Cyan
$allFilesExist = $true
foreach ($migration in $migrations) {
    $filePath = Join-Path $migrationsPath $migration
    if (Test-Path $filePath) {
        $fileSize = (Get-Item $filePath).Length
        Write-Host "   ✅ $migration ($fileSize bytes)" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $migration (NOT FOUND)" -ForegroundColor Red
        $allFilesExist = $false
    }
}

if (-not $allFilesExist) {
    Write-Host ""
    Write-Host "❌ Some migration files are missing. Aborting." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""

# Display instructions
Write-Host "📖 How to apply these migrations:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Option 1: Using Supabase CLI (Recommended)" -ForegroundColor Cyan
Write-Host "   1. Link your project (if not already linked):" -ForegroundColor White
Write-Host "      supabase link --project-ref <your-project-ref>" -ForegroundColor Gray
Write-Host ""
Write-Host "   2. Apply migrations to remote database:" -ForegroundColor White
Write-Host "      supabase db push" -ForegroundColor Gray
Write-Host ""
Write-Host "   This will apply all pending migrations in the supabase/migrations folder." -ForegroundColor DarkGray
Write-Host ""

Write-Host "Option 2: Using SQL Editor (Manual)" -ForegroundColor Cyan
Write-Host "   1. Go to Supabase Dashboard > SQL Editor" -ForegroundColor White
Write-Host "   2. Copy each migration file's contents" -ForegroundColor White
Write-Host "   3. Paste and execute in order:" -ForegroundColor White
foreach ($migration in $migrations) {
    Write-Host "      • $migration" -ForegroundColor Gray
}
Write-Host ""

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""

# Prompt user
Write-Host "Would you like to apply migrations now using CLI? (Y/N): " -ForegroundColor Yellow -NoNewline
$response = Read-Host

if ($response -eq 'Y' -or $response -eq 'y') {
    Write-Host ""
    Write-Host "🚀 Applying migrations..." -ForegroundColor Green
    Write-Host ""
    
    # Change to project directory
    Set-Location $projectRoot
    
    # Run supabase db push
    Write-Host "Executing: supabase db push" -ForegroundColor Gray
    Write-Host ""
    supabase db push
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Migrations applied successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Cyan
        Write-Host "  • Verify tables in Supabase Dashboard" -ForegroundColor White
        Write-Host "  • Test SSO configuration (/admin/sso-config)" -ForegroundColor White
        Write-Host "  • Test RBAC permissions (/admin/permissions)" -ForegroundColor White
        Write-Host "  • Test audit logs (/admin/audit-logs)" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "❌ Migration failed. Check the output above for errors." -ForegroundColor Red
        Write-Host ""
        Write-Host "Troubleshooting:" -ForegroundColor Yellow
        Write-Host "  • Make sure your project is linked: supabase link" -ForegroundColor White
        Write-Host "  • Check your database connection" -ForegroundColor White
        Write-Host "  • Review migration SQL for syntax errors" -ForegroundColor White
        Write-Host ""
    }
} else {
    Write-Host ""
    Write-Host "ℹ️  Skipping automatic application." -ForegroundColor Cyan
    Write-Host "   You can apply migrations manually using one of the options above." -ForegroundColor White
    Write-Host ""
}

Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
