# Apply All Supabase Migrations
# This script applies all migrations in order to set up the database

Write-Host "🚀 ABR Insights - Database Migration Script" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "❌ Error: .env.local file not found" -ForegroundColor Red
    Write-Host "Please create .env.local with your Supabase credentials" -ForegroundColor Yellow
    exit 1
}

# Load environment variables from .env.local
Write-Host "📋 Loading environment variables from .env.local..." -ForegroundColor Yellow
Get-Content .env.local | ForEach-Object {
    if ($_ -match '^([^=]+)=(.*)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        if ($key -and -not $key.StartsWith('#')) {
            [Environment]::SetEnvironmentVariable($key, $value, 'Process')
        }
    }
}

# Verify required environment variables
$supabaseUrl = $env:NEXT_PUBLIC_SUPABASE_URL
$serviceRoleKey = $env:SUPABASE_SERVICE_ROLE_KEY

if (-not $supabaseUrl) {
    Write-Host "❌ Error: NEXT_PUBLIC_SUPABASE_URL not found in .env.local" -ForegroundColor Red
    exit 1
}

if (-not $serviceRoleKey) {
    Write-Host "❌ Error: SUPABASE_SERVICE_ROLE_KEY not found in .env.local" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Environment variables loaded" -ForegroundColor Green
Write-Host "   Supabase URL: $supabaseUrl" -ForegroundColor Gray
Write-Host ""

# Define migration files in order
$migrationGroups = @{
    "Core Schema" = @(
        "001_initial_schema.sql",
        "002_create_courses_table.sql",
        "003_create_lessons_table.sql",
        "004_create_user_progress_table.sql"
    )
    "RBAC Setup" = @(
        "014_add_role_to_profiles.sql",
        "015_profiles_rbac_policies.sql",
        "016_rbac_test_accounts.sql"
    )
    "Advanced Features" = @(
        "20250115000001_lesson_notes.sql",
        "20250115000002_watch_history.sql",
        "20250115000003_quiz_system.sql",
        "20250115000004_certificates.sql",
        "20250115000005_ce_credit_tracking.sql",
        "20250115000006_skills_validation.sql",
        "20250115000007_course_workflow.sql",
        "20250115000008_instructor_portal.sql",
        "20250115000009_gamification_achievements.sql"
    )
    "Enterprise Features" = @(
        "20250116000001_enterprise_sso_auth.sql",
        "20250116000002_advanced_rbac.sql",
        "20250116000003_audit_logs_enhancement.sql",
        "20250116000004_ingestion_pipeline.sql",
        "20250116000005_migrate_gamification_schema.sql",
        "20250116000006_gamification_social.sql",
        "20250116000007_comprehensive_demo_seed.sql"
    )
    "ML Features" = @(
        "20250108000001_enable_pgvector.sql",
        "20250108000002_create_embeddings_tables.sql",
        "20250108000003_create_similarity_functions.sql",
        "20250108000004_create_outcome_prediction.sql"
    )
}

$totalMigrations = 0
$appliedMigrations = 0
$skippedMigrations = 0
$failedMigrations = 0

foreach ($group in $migrationGroups.Keys) {
    Write-Host "📦 Migration Group: $group" -ForegroundColor Cyan
    Write-Host "   Files: $($migrationGroups[$group].Count)" -ForegroundColor Gray
    Write-Host ""
    
    foreach ($migrationFile in $migrationGroups[$group]) {
        $totalMigrations++
        $migrationPath = Join-Path "supabase" "migrations" $migrationFile
        
        if (-not (Test-Path $migrationPath)) {
            Write-Host "   ⚠️  Skipping: $migrationFile (file not found)" -ForegroundColor Yellow
            $skippedMigrations++
            continue
        }
        
        Write-Host "   🔄 Applying: $migrationFile" -ForegroundColor White
        
        try {
            # Read migration file
            $sql = Get-Content $migrationPath -Raw
            
            # Create a temporary file for the SQL
            $tempFile = [System.IO.Path]::GetTempFileName()
            $sql | Out-File -FilePath $tempFile -Encoding UTF8
            
            # Execute migration using curl (PowerShell equivalent)
            $headers = @{
                "apikey" = $serviceRoleKey
                "Authorization" = "Bearer $serviceRoleKey"
                "Content-Type" = "text/plain"
            }
            
            # Use Supabase REST API to execute SQL
            $apiUrl = "$supabaseUrl/rest/v1/rpc/exec_sql"
            
            # Try direct SQL execution via PostgREST
            $response = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/rpc/query" `
                -Method Post `
                -Headers $headers `
                -Body (@{ query = $sql } | ConvertTo-Json) `
                -ErrorAction Stop
            
            Write-Host "   ✅ Applied successfully" -ForegroundColor Green
            $appliedMigrations++
            
            # Clean up temp file
            Remove-Item $tempFile -ErrorAction SilentlyContinue
            
        } catch {
            Write-Host "   ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
            $failedMigrations++
            
            # Check if it's a "already exists" error (acceptable)
            if ($_.Exception.Message -match "already exists|duplicate") {
                Write-Host "      (Resource already exists - may be safe to continue)" -ForegroundColor Yellow
            }
        }
        
        Start-Sleep -Milliseconds 500
    }
    
    Write-Host ""
}

# Summary
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "📊 Migration Summary" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   Total migrations: $totalMigrations" -ForegroundColor White
Write-Host "   ✅ Applied: $appliedMigrations" -ForegroundColor Green
Write-Host "   ⚠️  Skipped: $skippedMigrations" -ForegroundColor Yellow
Write-Host "   ❌ Failed: $failedMigrations" -ForegroundColor Red
Write-Host ""

if ($failedMigrations -gt 0) {
    Write-Host "   Some migrations failed. Please check the errors above." -ForegroundColor Yellow
    Write-Host "   You may need to apply them manually via Supabase Dashboard:" -ForegroundColor Yellow
    Write-Host "   https://supabase.com/dashboard - SQL Editor" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host "All migrations applied successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Cyan
    Write-Host "   1. Test login with: super_admin@abr-insights.com / TestPass123!" -ForegroundColor White
    Write-Host "   2. Navigate to: http://localhost:3000/admin/ml" -ForegroundColor White
    Write-Host "   3. Generate embeddings: npx tsx --env-file=.env.local scripts/generate-initial-embeddings.ts" -ForegroundColor White
    Write-Host ""
}
