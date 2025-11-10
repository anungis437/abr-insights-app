<#
.SYNOPSIS
    Phase 12 Repository Cleanup Script - Safely archives legacy and unused files
    
.DESCRIPTION
    This script identifies candidate files and folders for archival during Phase 12 cleanup.
    By default, it runs in DRY-RUN mode (safe) and only lists what would be archived.
    Use -Run switch to actually perform the archival operation.
    
.PARAMETER Run
    Execute the archival operation. Without this flag, script runs in dry-run mode.
    
.PARAMETER ArchivePath
    Custom archive directory path. Defaults to .\archive\phase12_cleanup_TIMESTAMP\
    
.EXAMPLE
    .\scripts\phase12_cleanup.ps1
    # Dry-run mode: Lists files that would be archived
    
.EXAMPLE
    .\scripts\phase12_cleanup.ps1 -Run
    # Actually archives the identified files
    
.EXAMPLE
    .\scripts\phase12_cleanup.ps1 -Run -ArchivePath ".\custom_archive"
    # Archives to a custom location
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [switch]$Run = $false,
    
    [Parameter(Mandatory=$false)]
    [string]$ArchivePath = ""
)

# Set strict mode for better error handling
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# Color output functions
function Write-InfoMsg { param([string]$Message) Write-Host "ℹ️  $Message" -ForegroundColor Cyan }
function Write-SuccessMsg { param([string]$Message) Write-Host "✅ $Message" -ForegroundColor Green }
function Write-WarningMsg { param([string]$Message) Write-Host "⚠️  $Message" -ForegroundColor Yellow }
function Write-ErrorMsg { param([string]$Message) Write-Host "❌ $Message" -ForegroundColor Red }
function Write-ActionMsg { param([string]$Message) Write-Host "🔧 $Message" -ForegroundColor Magenta }

# Repository root (assuming script is in scripts/ folder)
$RepoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $RepoRoot

Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Blue
Write-Host "║       Phase 12 Repository Cleanup Script v1.0             ║" -ForegroundColor Blue
Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Blue

if (-not $Run) {
    Write-WarningMsg "Running in DRY-RUN mode (safe). Use -Run to actually archive files."
    Write-Host ""
}

# Define archive timestamp and path
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
if ([string]::IsNullOrEmpty($ArchivePath)) {
    $ArchivePath = Join-Path $RepoRoot "archive\phase12_cleanup_$Timestamp"
}

Write-InfoMsg "Archive destination: $ArchivePath"
Write-Host ""

# ============================================================================
# CANDIDATE FILES AND FOLDERS FOR ARCHIVAL
# ============================================================================
# These are legacy files, outdated scripts, or redundant content that can be 
# safely archived during Phase 12 cleanup.

$CandidatePatterns = @(
    # Legacy write-* scripts (appear to be code generation artifacts)
    "write-admin-analytics.js",
    "write-admin-cases-create.js",
    "write-admin-cases.js",
    "write-admin-courses-create.js",
    "write-admin-courses.js",
    "write-admin-dashboard.js",
    "write-admin-users.js",
    "write-ai-api.js",
    "write-ai-assistant.js",
    "write-ai-coach-api.js",
    "write-ai-coach.js",
    "write-course-player.js",
    "write-leaderboard.js",
    "write-training-page.js",
    
    # Legacy folder (already archived content)
    "legacy",
    
    # Old migration-related files (if migrations are complete)
    "MIGRATION_PLAN.md",
    "APPLY_MIGRATIONS_NOW.md",
    
    # Phase completion markers from previous phases (keep recent ones)
    "PHASE_5_COMPLETE.md",
    "PHASE_6_COMPLETE.md",
    "PHASE_7_COMPLETE.md",
    "PHASE_7.5_COMPLETE.md",
    
    # Old script files that might be superseded
    "scripts\migrate-quizzes-fixed.js",
    "scripts\migrate-quizzes-to-new-architecture.js",
    "scripts\populate-black-history.js",
    "scripts\populate-course-2.js",
    "scripts\populate-course-3-4.js",
    "scripts\populate-course-5-6.js",
    "scripts\populate-course-content.js",
    
    # Temporary or diagnostic files
    "schema-check.sql"
)

# Additional patterns to check (but be more careful)
$CandidateDirectories = @(
    "legacy",
    "docs\archive"
)

# ============================================================================
# PROTECTED FILES (NEVER ARCHIVE THESE)
# ============================================================================
$ProtectedPatterns = @(
    ".git",
    ".github",
    "node_modules",
    ".next",
    "out",
    ".env*",
    "package*.json",
    "PHASE_12_PLAN.md",
    "PHASE_11_PLAN.md",
    "PHASE_11_COMPLETE.md",
    "README.md",
    "tsconfig.json",
    "next.config.js",
    "middleware.ts",
    "supabase\migrations",
    "app\*",
    "components\*",
    "lib\*",
    "public\*",
    "scripts\phase12_*.ps1"
)

# ============================================================================
# SCAN AND IDENTIFY FILES
# ============================================================================
Write-ActionMsg "Scanning repository for archival candidates..."
Write-Host ""

$FilesToArchive = @()
$TotalSize = 0

foreach ($pattern in $CandidatePatterns) {
    $fullPath = Join-Path $RepoRoot $pattern
    
    if (Test-Path $fullPath) {
        $item = Get-Item $fullPath
        
        # Calculate size
        $itemSize = 0
        if ($item.PSIsContainer) {
            $itemSize = (Get-ChildItem -Path $fullPath -Recurse -File -ErrorAction SilentlyContinue | 
                         Measure-Object -Property Length -Sum).Sum
        } else {
            $itemSize = $item.Length
        }
        
        $TotalSize += $itemSize
        $sizeStr = if ($itemSize -gt 1MB) { "{0:N2} MB" -f ($itemSize / 1MB) } 
                   elseif ($itemSize -gt 1KB) { "{0:N2} KB" -f ($itemSize / 1KB) }
                   else { "$itemSize bytes" }
        
        $FilesToArchive += [PSCustomObject]@{
            Path = $pattern
            FullPath = $fullPath
            Type = if ($item.PSIsContainer) { "Directory" } else { "File" }
            Size = $itemSize
            SizeStr = $sizeStr
        }
        
        Write-Host "  📄 $pattern" -NoNewline
        Write-Host " ($sizeStr)" -ForegroundColor DarkGray
    }
}

Write-Host ""

# ============================================================================
# SUMMARY
# ============================================================================
if ($FilesToArchive.Count -eq 0) {
    Write-SuccessMsg "No files found for archival. Repository is already clean!"
    exit 0
}

$totalSizeStr = if ($TotalSize -gt 1MB) { "{0:N2} MB" -f ($TotalSize / 1MB) }
                elseif ($TotalSize -gt 1KB) { "{0:N2} KB" -f ($TotalSize / 1KB) }
                else { "$TotalSize bytes" }

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Yellow
Write-Host "║                    ARCHIVAL SUMMARY                        ║" -ForegroundColor Yellow
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Yellow
Write-Host ""
Write-InfoMsg "Total items to archive: $($FilesToArchive.Count)"
Write-InfoMsg "Total size: $totalSizeStr"
Write-Host ""

# Display breakdown
$fileCount = ($FilesToArchive | Where-Object { $_.Type -eq "File" }).Count
$dirCount = ($FilesToArchive | Where-Object { $_.Type -eq "Directory" }).Count

if ($fileCount -gt 0) { Write-Host "  📄 Files: $fileCount" -ForegroundColor Cyan }
if ($dirCount -gt 0) { Write-Host "  📁 Directories: $dirCount" -ForegroundColor Cyan }
Write-Host ""

# ============================================================================
# EXECUTE ARCHIVAL (IF -Run SPECIFIED)
# ============================================================================
if ($Run) {
    Write-WarningMsg "ARCHIVAL MODE ACTIVE - Files will be moved to: $ArchivePath"
    Write-Host ""
    
    # Confirmation prompt
    $confirmation = Read-Host "Are you sure you want to proceed? Type 'YES' to confirm"
    
    if ($confirmation -ne "YES") {
        Write-WarningMsg "Archival cancelled by user."
        exit 0
    }
    
    Write-Host ""
    Write-ActionMsg "Creating archive directory..."
    
    # Create archive directory
    if (-not (Test-Path $ArchivePath)) {
        New-Item -Path $ArchivePath -ItemType Directory -Force | Out-Null
        Write-SuccessMsg "Created: $ArchivePath"
    }
    
    # Create manifest file
    $manifestPath = Join-Path $ArchivePath "MANIFEST.txt"
    $manifestContent = @"
Phase 12 Cleanup Archive
========================
Date: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Total Items: $($FilesToArchive.Count)
Total Size: $totalSizeStr

Archived Files:
---------------

"@
    
    foreach ($file in $FilesToArchive) {
        $manifestContent += "$($file.Path) ($($file.SizeStr))`n"
    }
    
    $manifestContent | Out-File -FilePath $manifestPath -Encoding UTF8
    Write-SuccessMsg "Created manifest: $manifestPath"
    Write-Host ""
    
    # Move files
    Write-ActionMsg "Archiving files..."
    $successCount = 0
    $errorCount = 0
    
    foreach ($file in $FilesToArchive) {
        try {
            $relativePath = $file.Path
            $destPath = Join-Path $ArchivePath $relativePath
            $destDir = Split-Path -Parent $destPath
            
            # Create destination directory if needed
            if (-not (Test-Path $destDir)) {
                New-Item -Path $destDir -ItemType Directory -Force | Out-Null
            }
            
            # Move the item
            Move-Item -Path $file.FullPath -Destination $destPath -Force
            Write-Host "  ✓ Archived: $relativePath" -ForegroundColor Green
            $successCount++
        }
        catch {
            Write-ErrorMsg "Failed to archive: $($file.Path)"
            Write-Host "    Error: $($_.Exception.Message)" -ForegroundColor Red
            $errorCount++
        }
    }
    
    Write-Host ""
    Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║                  ARCHIVAL COMPLETE                         ║" -ForegroundColor Green
    Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
    Write-SuccessMsg "Successfully archived: $successCount items"
    
    if ($errorCount -gt 0) {
        Write-WarningMsg "Failed to archive: $errorCount items"
    }
    
    Write-InfoMsg "Archive location: $ArchivePath"
    Write-InfoMsg "Manifest: $manifestPath"
    Write-Host ""
    Write-Host "🎉 Repository cleanup complete! You can now commit the cleaned repo." -ForegroundColor Green
    Write-Host ""
    
} else {
    # Dry-run mode
    Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║                    DRY-RUN MODE                            ║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
    Write-InfoMsg "The files listed above WOULD be archived to:"
    Write-Host "  $ArchivePath" -ForegroundColor White
    Write-Host ""
    Write-Host "To actually perform the archival, run:" -ForegroundColor Yellow
    Write-Host "  .\scripts\phase12_cleanup.ps1 -Run" -ForegroundColor White
    Write-Host ""
}

Write-Host "Script execution complete.`n" -ForegroundColor Blue
