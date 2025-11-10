<#
.SYNOPSIS
    Phase 12 Branch Creation Helper Script
    
.DESCRIPTION
    This script helps create and set up the phase-12 branch for Phase 12 work.
    By default, it runs in DRY-RUN mode. Use -Run to execute.
    
.PARAMETER Run
    Execute the branch creation. Without this flag, script runs in dry-run mode.
    
.EXAMPLE
    .\scripts\create_phase12_branch.ps1
    # Dry-run mode: Shows what would be done
    
.EXAMPLE
    .\scripts\create_phase12_branch.ps1 -Run
    # Actually creates the branch and commits changes
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [switch]$Run = $false
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# Color output functions
function Write-InfoMsg { param([string]$Message) Write-Host "ℹ️  $Message" -ForegroundColor Cyan }
function Write-SuccessMsg { param([string]$Message) Write-Host "✅ $Message" -ForegroundColor Green }
function Write-WarningMsg { param([string]$Message) Write-Host "⚠️  $Message" -ForegroundColor Yellow }
function Write-ErrorMsg { param([string]$Message) Write-Host "❌ $Message" -ForegroundColor Red }
function Write-ActionMsg { param([string]$Message) Write-Host "🔧 $Message" -ForegroundColor Magenta }

# Repository root
$RepoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $RepoRoot

Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Blue
Write-Host "║       Phase 12 Branch Creation Helper v1.0                ║" -ForegroundColor Blue
Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Blue

if (-not $Run) {
    Write-WarningMsg "Running in DRY-RUN mode (safe). Use -Run to actually create branch."
    Write-Host ""
}

# ============================================================================
# PRE-FLIGHT CHECKS
# ============================================================================
Write-ActionMsg "Running pre-flight checks..."
Write-Host ""

# Check if git is available
try {
    $gitVersion = git --version 2>&1
    Write-SuccessMsg "Git found: $gitVersion"
}
catch {
    Write-ErrorMsg "Git is not installed or not in PATH."
    exit 1
}

# Check if we're in a git repository
try {
    $isGitRepo = git rev-parse --is-inside-work-tree 2>&1
    if ($isGitRepo -ne "true") {
        Write-ErrorMsg "Not inside a git repository."
        exit 1
    }
    Write-SuccessMsg "Inside git repository"
}
catch {
    Write-ErrorMsg "Not inside a git repository."
    exit 1
}

# Check current branch
$currentBranch = git branch --show-current
Write-InfoMsg "Current branch: $currentBranch"

# Check if phase-12 branch already exists
$branchExists = git branch --list "phase-12" 2>&1
if ($branchExists) {
    Write-WarningMsg "Branch 'phase-12' already exists locally."
    $onPhase12 = ($currentBranch -eq "phase-12")
    
    if ($onPhase12) {
        Write-InfoMsg "Already on phase-12 branch."
    } else {
        Write-InfoMsg "Will switch to existing phase-12 branch."
    }
}

# Check for uncommitted changes
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-InfoMsg "Uncommitted changes detected:"
    Write-Host ""
    git status --short
    Write-Host ""
}

# Check remote
try {
    $remoteUrl = git remote get-url origin 2>&1
    Write-SuccessMsg "Remote origin: $remoteUrl"
}
catch {
    Write-WarningMsg "No remote 'origin' configured."
}

Write-Host ""

# ============================================================================
# PHASE 12 FILES TO ADD
# ============================================================================
$Phase12Files = @(
    "PHASE_12_PLAN.md",
    "scripts\phase12_cleanup.ps1",
    "scripts\create_phase12_branch.ps1",
    "docs\PHASE_12_README.md"
)

Write-InfoMsg "Phase 12 files to add:"
foreach ($file in $Phase12Files) {
    $exists = Test-Path (Join-Path $RepoRoot $file)
    $status = if ($exists) { "✓" } else { "✗ MISSING" }
    Write-Host "  $status $file" -ForegroundColor $(if ($exists) { "Green" } else { "Red" })
}
Write-Host ""

# ============================================================================
# EXECUTION PLAN
# ============================================================================
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Yellow
Write-Host "║                     EXECUTION PLAN                         ║" -ForegroundColor Yellow
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Yellow
Write-Host ""

if ($branchExists -and ($currentBranch -eq "phase-12")) {
    Write-InfoMsg "1. Already on phase-12 branch (skip checkout)"
} elseif ($branchExists) {
    Write-InfoMsg "1. Switch to existing phase-12 branch"
} else {
    Write-InfoMsg "1. Create new phase-12 branch from $currentBranch"
}

Write-InfoMsg "2. Stage Phase 12 files: $($Phase12Files.Count) files"
Write-InfoMsg "3. Commit with message: 'chore(phase-12): add Phase 12 plan and automation scripts'"
Write-InfoMsg "4. Push to origin/phase-12 (set upstream)"
Write-Host ""

# ============================================================================
# EXECUTE (IF -Run SPECIFIED)
# ============================================================================
if ($Run) {
    Write-WarningMsg "EXECUTION MODE ACTIVE - Changes will be made to git repository"
    Write-Host ""
    
    # Confirmation
    $confirmation = Read-Host "Proceed with branch creation and commit? Type 'YES' to confirm"
    
    if ($confirmation -ne "YES") {
        Write-WarningMsg "Operation cancelled by user."
        exit 0
    }
    
    Write-Host ""
    
    try {
        # Step 1: Create or switch to phase-12 branch
        if ($currentBranch -eq "phase-12") {
            Write-InfoMsg "Already on phase-12 branch."
        } elseif ($branchExists) {
            Write-ActionMsg "Switching to phase-12 branch..."
            git checkout phase-12
            Write-SuccessMsg "Switched to phase-12 branch"
        } else {
            Write-ActionMsg "Creating phase-12 branch..."
            git checkout -b phase-12
            Write-SuccessMsg "Created and switched to phase-12 branch"
        }
        Write-Host ""
        
        # Step 2: Stage Phase 12 files
        Write-ActionMsg "Staging Phase 12 files..."
        $stagedCount = 0
        $missingCount = 0
        
        foreach ($file in $Phase12Files) {
            $fullPath = Join-Path $RepoRoot $file
            if (Test-Path $fullPath) {
                git add $file
                Write-Host "  ✓ Staged: $file" -ForegroundColor Green
                $stagedCount++
            } else {
                Write-Host "  ✗ Missing: $file" -ForegroundColor Red
                $missingCount++
            }
        }
        
        if ($stagedCount -eq 0) {
            Write-ErrorMsg "No files were staged. Cannot proceed with commit."
            exit 1
        }
        
        Write-SuccessMsg "Staged $stagedCount file(s)"
        if ($missingCount -gt 0) {
            Write-WarningMsg "$missingCount file(s) missing"
        }
        Write-Host ""
        
        # Step 3: Commit
        Write-ActionMsg "Committing changes..."
        $commitMessage = @"
chore(phase-12): add Phase 12 plan and automation scripts

- Add comprehensive PHASE_12_PLAN.md with technical and product roadmap
- Add phase12_cleanup.ps1 for safe repository cleanup
- Add create_phase12_branch.ps1 for branch management
- Add PHASE_12_README.md with quick-start guide

This commit establishes the foundation for Phase 12 work focused on
world-class production readiness and competitive product features.
"@
        
        git commit -m $commitMessage
        Write-SuccessMsg "Committed changes to phase-12 branch"
        Write-Host ""
        
        # Step 4: Push to origin
        Write-ActionMsg "Pushing to origin/phase-12..."
        
        # Check if remote branch exists
        $remoteBranchExists = git ls-remote --heads origin phase-12 2>&1
        
        if ($remoteBranchExists) {
            Write-InfoMsg "Remote phase-12 branch exists, pushing updates..."
            git push origin phase-12
        } else {
            Write-InfoMsg "Creating remote phase-12 branch..."
            git push -u origin phase-12
        }
        
        Write-SuccessMsg "Pushed to origin/phase-12"
        Write-Host ""
        
        # Success summary
        Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
        Write-Host "║                 BRANCH SETUP COMPLETE                      ║" -ForegroundColor Green
        Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
        Write-Host ""
        Write-SuccessMsg "Phase 12 branch is ready!"
        Write-InfoMsg "Branch: phase-12"
        Write-InfoMsg "Commits: $(git rev-list --count HEAD)"
        Write-InfoMsg "Remote: origin/phase-12"
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Yellow
        Write-Host "  1. Review PHASE_12_PLAN.md for roadmap details" -ForegroundColor White
        Write-Host "  2. Run .\scripts\phase12_cleanup.ps1 to clean repository (optional)" -ForegroundColor White
        Write-Host "  3. Create feature branches from phase-12 for specific tasks" -ForegroundColor White
        Write-Host "  4. Open PRs into phase-12 branch (not main)" -ForegroundColor White
        Write-Host ""
        
    }
    catch {
        Write-ErrorMsg "Operation failed: $($_.Exception.Message)"
        Write-Host ""
        Write-Host "Troubleshooting tips:" -ForegroundColor Yellow
        Write-Host "  - Ensure git credentials are configured" -ForegroundColor White
        Write-Host "  - Check git status for conflicts: git status" -ForegroundColor White
        Write-Host "  - Verify Phase 12 files exist in the repository" -ForegroundColor White
        exit 1
    }
    
} else {
    # Dry-run mode
    Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║                    DRY-RUN MODE                            ║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
    Write-InfoMsg "No changes made. The plan above WOULD be executed."
    Write-Host ""
    Write-Host "To actually create/update the phase-12 branch, run:" -ForegroundColor Yellow
    Write-Host "  .\scripts\create_phase12_branch.ps1 -Run" -ForegroundColor White
    Write-Host ""
}

Write-Host "Script execution complete.`n" -ForegroundColor Blue
