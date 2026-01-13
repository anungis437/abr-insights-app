# Update RLS Policy Migrations to use public schema instead of auth schema
# Run this after applying 021_permission_based_rls_functions_v2.sql

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Updating Migrations 022 & 023" -ForegroundColor Cyan
Write-Host "From: auth.function_name" -ForegroundColor Yellow
Write-Host "To:   public.function_name" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$migrations = @(
    "supabase\migrations\022_migrate_critical_table_rls.sql",
    "supabase\migrations\023_migrate_feature_table_rls.sql"
)

$replacements = @{
    'auth\.has_permission' = 'public.has_permission'
    'auth\.has_any_permission' = 'public.has_any_permission'
    'auth\.has_all_permissions' = 'public.has_all_permissions'
    'auth\.has_resource_permission' = 'public.has_resource_permission'
    'auth\.has_role' = 'public.has_role'
    'auth\.has_any_role' = 'public.has_any_role'
    'auth\.is_admin' = 'public.is_admin'
    'auth\.is_super_admin' = 'public.is_super_admin'
    'auth\.user_organization_id' = 'public.user_organization_id'
    'auth\.belongs_to_organization' = 'public.belongs_to_organization'
    'auth\.resource_in_user_org' = 'public.resource_in_user_org'
}

foreach ($migrationFile in $migrations) {
    if (Test-Path $migrationFile) {
        Write-Host "Processing: $migrationFile" -ForegroundColor Cyan
        
        $content = Get-Content $migrationFile -Raw
        $originalContent = $content
        $replaceCount = 0
        
        foreach ($pattern in $replacements.Keys) {
            $replacement = $replacements[$pattern]
            $matches = [regex]::Matches($content, $pattern)
            if ($matches.Count -gt 0) {
                $content = $content -replace $pattern, $replacement
                $replaceCount += $matches.Count
                Write-Host "  ✓ Replaced $($matches.Count)x: $pattern -> $replacement" -ForegroundColor Green
            }
        }
        
        if ($replaceCount -gt 0) {
            # Create backup
            $backupFile = "$migrationFile.backup"
            $originalContent | Set-Content $backupFile -NoNewline
            Write-Host "  ✓ Created backup: $backupFile" -ForegroundColor Yellow
            
            # Save updated file
            $content | Set-Content $migrationFile -NoNewline
            Write-Host "  ✓ Updated with $replaceCount replacements" -ForegroundColor Green
        } else {
            Write-Host "  - No changes needed" -ForegroundColor Gray
        }
        
        Write-Host ""
    } else {
        Write-Host "  ✗ File not found: $migrationFile" -ForegroundColor Red
    }
}

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Update Complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Apply 021_permission_based_rls_functions_v2.sql in Supabase Dashboard" -ForegroundColor White
Write-Host "2. Apply updated 022_migrate_critical_table_rls.sql" -ForegroundColor White
Write-Host "3. Apply updated 023_migrate_feature_table_rls.sql" -ForegroundColor White
Write-Host ""
