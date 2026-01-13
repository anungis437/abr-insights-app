# Apply All Supabase Migrations - Simple Version
# This script applies all migrations using psql directly

Write-Host "ABR Insights - Database Migration Script"
Write-Host "========================================"
Write-Host ""

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "ERROR: .env.local file not found"
    Write-Host "Please create .env.local with your Supabase credentials"
    exit 1
}

# Load environment variables from .env.local
Write-Host "Loading environment variables from .env.local..."
Get-Content .env.local | ForEach-Object {
    if ($_ -match '^([^=]+)=(.*)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        if ($key -and -not $key.StartsWith('#')) {
            [Environment]::SetEnvironmentVariable($key, $value, 'Process')
        }
    }
}

$databaseUrl = $env:DATABASE_URL

if (-not $databaseUrl) {
    Write-Host "ERROR: DATABASE_URL not found in .env.local"
    exit 1
}

Write-Host "Environment variables loaded"
Write-Host ""

# Define migration files in order
$migrations = @(
    "001_initial_schema.sql",
    "002_create_courses_table.sql",
    "003_create_lessons_table.sql",
    "004_create_user_progress_table.sql",
    "005_create_tribunal_cases.sql",
    "006_create_quiz_system.sql",
    "007_create_certificates.sql",
    "008_create_achievements.sql",
    "009_create_rbac_tables.sql",
    "010_create_audit_logs.sql",
    "011_create_ml_tables.sql",
    "012_add_missing_columns.sql",
    "013_add_security_policies.sql",
    "014_add_role_to_profiles.sql",
    "015_profiles_rbac_policies.sql",
    "016_rbac_test_accounts.sql",
    "017_gamification_schema.sql",
    "018_social_features.sql",
    "019_advanced_analytics.sql",
    "20250108000001_enable_pgvector.sql",
    "20250108000002_create_embeddings_tables.sql",
    "20250108000003_create_similarity_functions.sql",
    "20250108000004_create_outcome_prediction.sql",
    "20250115000001_lesson_notes.sql",
    "20250115000002_watch_history.sql",
    "20250115000003_quiz_system.sql",
    "20250115000004_certificates.sql",
    "20250115000005_ce_credit_tracking.sql",
    "20250115000006_skills_validation.sql",
    "20250115000007_course_workflow.sql",
    "20250115000008_instructor_portal.sql",
    "20250115000009_gamification_achievements.sql",
    "20250116000001_enterprise_sso_auth.sql",
    "20250116000002_advanced_rbac.sql",
    "20250116000003_audit_logs_enhancement.sql",
    "20250116000004_ingestion_pipeline.sql",
    "20250116000005_migrate_gamification_schema.sql",
    "20250116000006_gamification_social.sql",
    "20250116000007_comprehensive_demo_seed.sql",
    "20250124_safe_ml_features.sql",
    "20250124_case_verdicts_fix.sql"
)

$totalMigrations = 0
$appliedMigrations = 0
$skippedMigrations = 0
$failedMigrations = 0

foreach ($migrationFile in $migrations) {
    $totalMigrations++
    $migrationPath = Join-Path "supabase" "migrations" $migrationFile
    
    if (-not (Test-Path $migrationPath)) {
        Write-Host "SKIPPING: $migrationFile (file not found)"
        $skippedMigrations++
        continue
    }
    
    Write-Host "Applying: $migrationFile"
    
    try {
        # Use psql if available, otherwise skip
        $psqlPath = Get-Command psql -ErrorAction SilentlyContinue
        
        if ($psqlPath) {
            # Use psql directly
            $output = & psql $databaseUrl -f $migrationPath 2>&1
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  SUCCESS: Applied $migrationFile"
                $appliedMigrations++
            } else {
                Write-Host "  FAILED: $migrationFile"
                Write-Host "  Output: $output"
                $failedMigrations++
            }
        } else {
            Write-Host "  SKIPPED: psql not found (install PostgreSQL client)"
            $skippedMigrations++
        }
        
    } catch {
        Write-Host "  ERROR: $($_.Exception.Message)"
        $failedMigrations++
    }
    
    Start-Sleep -Milliseconds 100
}

# Summary
Write-Host ""
Write-Host "========================================"
Write-Host "Migration Summary"
Write-Host "========================================"
Write-Host "Total migrations: $totalMigrations"
Write-Host "Applied: $appliedMigrations"
Write-Host "Skipped: $skippedMigrations"
Write-Host "Failed: $failedMigrations"
Write-Host ""

if ($failedMigrations -gt 0) {
    Write-Host "Some migrations failed. Check errors above."
    Write-Host "You may need to apply them manually via Supabase Dashboard"
} else {
    Write-Host "All migrations completed!"
}
