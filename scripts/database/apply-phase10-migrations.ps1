# ============================================================================
# Apply Phase 10 Migrations to Supabase
# ============================================================================
# This script applies all Phase 10 migrations directly to Supabase database
# via the SQL Editor API
# ============================================================================

# Load environment variables
$envPath = Join-Path $PSScriptRoot ".." ".env.local"
if (Test-Path $envPath) {
    Get-Content $envPath | ForEach-Object {
        if ($_ -match '^([^#][^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
    Write-Host "✅ Loaded environment variables from .env.local" -ForegroundColor Green
} else {
    Write-Host "❌ .env.local not found" -ForegroundColor Red
    exit 1
}

$SUPABASE_URL = $env:NEXT_PUBLIC_SUPABASE_URL
$SERVICE_KEY = $env:SUPABASE_SERVICE_ROLE_KEY

if (-not $SUPABASE_URL -or -not $SERVICE_KEY) {
    Write-Host "❌ Missing Supabase credentials" -ForegroundColor Red
    exit 1
}

# Extract project ref from URL
$PROJECT_REF = ($SUPABASE_URL -replace 'https://', '' -replace '.supabase.co', '')

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Phase 10 Migration Application                            ║" -ForegroundColor Cyan
Write-Host "║  Applying Enterprise Foundation Migrations                 ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔗 Project: $PROJECT_REF" -ForegroundColor White
Write-Host "🌐 URL: $SUPABASE_URL" -ForegroundColor White
Write-Host ""

# Migration files
$migrations = @(
    "20250116000001_enterprise_sso_auth.sql",
    "20250116000002_advanced_rbac.sql",
    "20250116000003_audit_logs_enhancement.sql"
)

$migrationsPath = Join-Path $PSScriptRoot ".." "supabase" "migrations"

$appliedCount = 0
$failedCount = 0

foreach ($migration in $migrations) {
    $filePath = Join-Path $migrationsPath $migration
    
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
    Write-Host "📄 Migration: $migration" -ForegroundColor Yellow
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
    
    if (-not (Test-Path $filePath)) {
        Write-Host "   ❌ File not found: $filePath" -ForegroundColor Red
        $failedCount++
        continue
    }
    
    # Read SQL content
    $sql = Get-Content $filePath -Raw -Encoding UTF8
    Write-Host "   📊 SQL Length: $($sql.Length) characters" -ForegroundColor Gray
    
    # Apply via REST API (direct database connection)
    Write-Host "   ⏳ Applying migration..." -ForegroundColor Gray
    
    try {
        # Use Supabase REST API to execute SQL
        $headers = @{
            "apikey" = $SERVICE_KEY
            "Authorization" = "Bearer $SERVICE_KEY"
            "Content-Type" = "application/json"
        }
        
        # PostgREST doesn't support arbitrary SQL execution via REST
        # We need to use the database connection directly
        Write-Host "   ℹ️  Note: Migrations should be applied via Supabase Dashboard or CLI" -ForegroundColor Cyan
        Write-Host "   📋 Please apply this migration manually:" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "      1. Go to: https://supabase.com/dashboard/project/$PROJECT_REF/sql/new" -ForegroundColor White
        Write-Host "      2. Copy contents from: $filePath" -ForegroundColor White
        Write-Host "      3. Paste into SQL Editor" -ForegroundColor White
        Write-Host "      4. Click 'Run'" -ForegroundColor White
        Write-Host ""
        
        # Show first 500 characters as preview
        $preview = $sql.Substring(0, [Math]::Min(500, $sql.Length))
        Write-Host "   Preview:" -ForegroundColor DarkGray
        Write-Host "   ┌────────────────────────────────────────────────────────┐" -ForegroundColor DarkGray
        $preview -split "`n" | Select-Object -First 10 | ForEach-Object {
            Write-Host "   │ $_" -ForegroundColor DarkGray
        }
        Write-Host "   │ ..." -ForegroundColor DarkGray
        Write-Host "   └────────────────────────────────────────────────────────┘" -ForegroundColor DarkGray
        
        Write-Host ""
        Write-Host "   ⏸️  Pausing for manual application..." -ForegroundColor Yellow
        Write-Host "   Press any key once you've applied the migration in Supabase Dashboard..."
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        
        $appliedCount++
        Write-Host "   ✅ Marked as applied" -ForegroundColor Green
        
    } catch {
        Write-Host "   ❌ Error: $_" -ForegroundColor Red
        $failedCount++
    }
}

# Summary
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Migration Summary                                         ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Total Migrations: $($migrations.Count)" -ForegroundColor White
Write-Host "✅ Applied: $appliedCount" -ForegroundColor Green
Write-Host "❌ Failed: $failedCount" -ForegroundColor Red
Write-Host ""

if ($appliedCount -eq $migrations.Count) {
    Write-Host "🎉 All migrations applied successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Verify tables in Supabase Dashboard" -ForegroundColor White
    Write-Host "  2. Test SSO configuration in /admin/sso-config" -ForegroundColor White
    Write-Host "  3. Test RBAC in /admin/permissions" -ForegroundColor White
    Write-Host "  4. Test audit logs in /admin/audit-logs" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "⚠️  Some migrations were not applied" -ForegroundColor Yellow
}

Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
