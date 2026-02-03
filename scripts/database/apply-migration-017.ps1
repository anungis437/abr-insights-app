# Apply migration 017_courses_enhancement_phase1.sql
# This script reads the migration file and executes it against the Supabase database

Write-Host "Applying Migration 017: Courses Enhancement Phase 1" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

# Load environment variables
if (Test-Path ".env.local") {
    Get-Content ".env.local" | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            $key = $matches[1]
            $value = $matches[2]
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
    Write-Host "✓ Loaded .env.local" -ForegroundColor Green
} else {
    Write-Host "✗ .env.local not found" -ForegroundColor Red
    exit 1
}

# Get database connection details
$dbUrl = $env:DATABASE_URL
if (-not $dbUrl) {
    Write-Host "✗ DATABASE_URL not found in environment" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Database URL loaded" -ForegroundColor Green

# Read migration file
$migrationFile = "supabase\migrations\017_courses_enhancement_phase1.sql"
if (-not (Test-Path $migrationFile)) {
    Write-Host "✗ Migration file not found: $migrationFile" -ForegroundColor Red
    exit 1
}

$migrationSql = Get-Content $migrationFile -Raw
Write-Host "✓ Migration file loaded ($($migrationSql.Length) characters)" -ForegroundColor Green

# Apply migration using psql (if available) or node script
if (Get-Command psql -ErrorAction SilentlyContinue) {
    Write-Host "`nApplying migration via psql..." -ForegroundColor Cyan
    $migrationSql | psql $dbUrl
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✓ Migration applied successfully!" -ForegroundColor Green
    } else {
        Write-Host "`n✗ Migration failed with exit code $LASTEXITCODE" -ForegroundColor Red
        exit $LASTEXITCODE
    }
} else {
    Write-Host "`npsql not found. Using Node.js to apply migration..." -ForegroundColor Yellow
    
    # Create temporary Node script
    $nodeScript = @"
import pg from 'pg';
import fs from 'fs';

const { Client } = pg;
const client = new Client({
    connectionString: process.env.DATABASE_URL
});

async function applyMigration() {
    try {
        await client.connect();
        console.log('✓ Connected to database');
        
        const sql = fs.readFileSync('$($migrationFile.Replace('\', '/'))','utf8');
        await client.query(sql);
        
        console.log('✓ Migration applied successfully!');
        process.exit(0);
    } catch (error) {
        console.error('✗ Migration failed:', error.message);
        process.exit(1);
    } finally {
        await client.end();
    }
}

applyMigration();
"@

    $nodeScript | Out-File -FilePath "scripts\temp-migration.mjs" -Encoding utf8
    
    # Check if pg module is available
    if (-not (Test-Path "node_modules\pg")) {
        Write-Host "Installing pg module..." -ForegroundColor Yellow
        npm install pg --save-dev
    }
    
    node --env-file=.env.local scripts\temp-migration.mjs
    $exitCode = $LASTEXITCODE
    
    # Clean up
    Remove-Item "scripts\temp-migration.mjs" -ErrorAction SilentlyContinue
    
    if ($exitCode -eq 0) {
        Write-Host "`n✓ Migration completed!" -ForegroundColor Green
    } else {
        Write-Host "`n✗ Migration failed" -ForegroundColor Red
        exit $exitCode
    }
}

Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Test the migration by querying the new tables" -ForegroundColor White
Write-Host "2. Run migration 018 for RLS policies" -ForegroundColor White
Write-Host "3. Create service layer functions" -ForegroundColor White
