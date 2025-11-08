# Script to remove individual Navigation and Footer imports/usage from pages
# Since they are now provided globally in root layout

Write-Host "Removing individual Navigation/Footer imports from pages..." -ForegroundColor Cyan

$filesToUpdate = @(
    "app\page.tsx",
    "app\about\page.tsx",
    "app\accessibility\page.tsx",
    "app\achievements\page.tsx",
    "app\admin\page.tsx",
    "app\admin\ai-models\page.tsx",
    "app\admin\analytics\page.tsx",
    "app\admin\cases\page.tsx",
    "app\admin\cases\create\page.tsx",
    "app\admin\cases\[id]\edit\page.tsx",
    "app\admin\courses\page.tsx",
    "app\admin\courses\create\page.tsx",
    "app\admin\courses\[id]\edit\page.tsx",
    "app\admin\ingestion\page.tsx",
    "app\admin\org-settings\page.tsx",
    "app\admin\team\page.tsx",
    "app\admin\users\page.tsx",
    "app\ai-assistant\page.tsx",
    "app\ai-coach\page.tsx",
    "app\analytics\page.tsx",
    "app\blog\page.tsx",
    "app\careers\page.tsx",
    "app\cases\page.tsx",
    "app\cases\browse\page.tsx",
    "app\cases\explore\page.tsx",
    "app\cases\[id]\page.tsx",
    "app\contact\page.tsx",
    "app\cookies\page.tsx",
    "app\courses\page.tsx",
    "app\courses\[slug]\page.tsx",
    "app\courses\[slug]\player\page.tsx",
    "app\dashboard\page.tsx",
    "app\faq\page.tsx",
    "app\leaderboard\page.tsx",
    "app\org\dashboard\page.tsx",
    "app\pricing\page.tsx",
    "app\privacy\page.tsx",
    "app\profile\page.tsx",
    "app\resources\page.tsx",
    "app\security\page.tsx",
    "app\team\page.tsx",
    "app\terms\page.tsx",
    "app\training\page.tsx",
    "app\tribunal-cases\[id]\page.tsx"
)

$count = 0
foreach ($file in $filesToUpdate) {
    $fullPath = Join-Path $PSScriptRoot "..\$file"
    if (Test-Path $fullPath) {
        $content = Get-Content $fullPath -Raw
        $originalContent = $content
        
        # Remove import statements
        $content = $content -replace "import Navigation from ['`"]@/components/shared/Navigation['`"];?\r?\n?", ""
        $content = $content -replace "import Footer from ['`"]@/components/shared/Footer['`"];?\r?\n?", ""
        
        # Remove JSX usage
        $content = $content -replace "\s*<Navigation\s*/>[\r\n]*", ""
        $content = $content -replace "\s*<Footer\s*/>[\r\n]*", ""
        
        if ($content -ne $originalContent) {
            Set-Content $fullPath -Value $content -NoNewline
            Write-Host "Updated: $file" -ForegroundColor Green
            $count++
        } else {
            Write-Host "Skipped: $file" -ForegroundColor Gray
        }
    } else {
        Write-Host "Not found: $file" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Completed: Updated $count files" -ForegroundColor Cyan
