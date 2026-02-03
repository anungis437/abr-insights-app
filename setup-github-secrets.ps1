# GitHub Secrets Setup Script
# Run this in PowerShell to configure all critical secrets

Write-Host "🔐 Setting up GitHub Secrets for ABR Insights App..." -ForegroundColor Cyan
Write-Host ""

# Supabase Configuration
Write-Host "📦 Setting Supabase secrets..." -ForegroundColor Yellow
$env:GH_TOKEN | Out-Null  # Ensure gh is authenticated

# Set secrets using heredoc to avoid interactive prompts
$secrets = @{
    "NEXT_PUBLIC_SUPABASE_URL" = "https://zdcmugkafbczvxcyofiz.supabase.co"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkY211Z2thZmJjenZ4Y3lvZml6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxOTczMDksImV4cCI6MjA4Mzc3MzMwOX0.Q_oAL1mrscvxqTH86vcnHdDZFFm9y-Wckxsiv68-_ZM"
    "SUPABASE_SERVICE_ROLE_KEY" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkY211Z2thZmJjenZ4Y3lvZml6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODE5NzMwOSwiZXhwIjoyMDgzNzczMzA5fQ.sS8oTvZoRtnGUi5TUZshHKtM7fxkTLbDAHEu14iul_4"
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" = "pk_test_51S9nzK3z6DvwO4gqo089V50ZJJKkJ5CoMAk0OMQMtx0KF4nAb7fHOvOIo7BSyOTzPasOgYhvUnYMC2W1mjQb4pGC00oSOb01yL"
    "STRIPE_SECRET_KEY" = "sk_test_51S9nzK3z6DvwO4gqNZR4UlxDbin5uTnQMy9IMjxV09eQqyafOmZpXz7rL1BWxsxQJvevqNl0SkGnSHPQHYkKoBG100ixoX1O0t"
    "STRIPE_WEBHOOK_SECRET" = "whsec_6ed2b62c7c702347ef54d9d9e7ab1e797ec89f873df714483119e92224cdcde3"
    "NEXT_PUBLIC_APP_URL" = "https://purple-ground-03d2b380f.5.azurestaticapps.net"
}

$successCount = 0
$failCount = 0

foreach ($key in $secrets.Keys) {
    try {
        Write-Host "  Setting: $key" -NoNewline
        
        # Use temp file to avoid interactive prompts
        $tempFile = [System.IO.Path]::GetTempFileName()
        $secrets[$key] | Out-File -FilePath $tempFile -NoNewline -Encoding UTF8
        
        $result = & gh secret set $key --body-file $tempFile 2>&1
        Remove-Item $tempFile -Force
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host " ✅" -ForegroundColor Green
            $successCount++
        } else {
            Write-Host " ❌ Failed: $result" -ForegroundColor Red
            $failCount++
        }
    } catch {
        Write-Host " ❌ Error: $_" -ForegroundColor Red
        $failCount++
    }
}

Write-Host ""
Write-Host "📊 Summary:" -ForegroundColor Cyan
Write-Host "  ✅ Success: $successCount" -ForegroundColor Green
Write-Host "  ❌ Failed: $failCount" -ForegroundColor Red
Write-Host ""

if ($failCount -eq 0) {
    Write-Host "🎉 All secrets configured successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Trigger a new deployment: git commit --allow-empty -m 'Trigger deployment' && git push"
    Write-Host "  2. Watch deployment: gh run watch"
    Write-Host "  3. Test at: https://purple-ground-03d2b380f.5.azurestaticapps.net"
} else {
    Write-Host "⚠️  Some secrets failed to set. You may need to set them manually at:" -ForegroundColor Yellow
    Write-Host "   https://github.com/anungis437/abr-insights-app/settings/secrets/actions"
}

Write-Host ""
