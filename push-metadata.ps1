# PowerShell script to push metadata files to GitHub
param(
    [string]$CommitMessage = "Add token metadata files (BTC and SOL)",
    [string]$Branch = "main"
)

Write-Host "Pushing metadata files to GitHub..." -ForegroundColor Green
Write-Host ""

# Check if git is installed
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "Git is not installed. Please install Git first." -ForegroundColor Red
    exit 1
}

# Navigate to repo directory
$RepoPath = "c:\Users\holly\Flash coin"
Set-Location $RepoPath

# Check if .git exists
if (-not (Test-Path ".git")) {
    Write-Host "Not a git repository. Initialize git first." -ForegroundColor Red
    exit 1
}

try {
    # Check git status
    Write-Host "Checking git status..." -ForegroundColor Yellow
    git status
    Write-Host ""

    # Add metadata files
    Write-Host "Adding metadata files..." -ForegroundColor Yellow
    git add metadata/btc-metadata.json
    git add metadata/sol-metadata.json
    Write-Host "Files staged" -ForegroundColor Green
    Write-Host ""

    # Commit
    Write-Host "Committing changes..." -ForegroundColor Yellow
    git commit -m "$CommitMessage"
    Write-Host "Committed" -ForegroundColor Green
    Write-Host ""

    # Push
    Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
    git push origin $Branch
    Write-Host "Pushed successfully!" -ForegroundColor Green
    Write-Host ""

    Write-Host "Done! Metadata files are now on GitHub CDN" -ForegroundColor Green
    Write-Host ""
    Write-Host "Metadata URLs:" -ForegroundColor Cyan
    Write-Host "BTC:  https://raw.githubusercontent.com/Cryptovaultiq/ShowThem-BTC-token/main/metadata/btc-metadata.json"
    Write-Host "SOL:  https://raw.githubusercontent.com/Cryptovaultiq/ShowThem-BTC-token/main/metadata/sol-metadata.json"

} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
}
