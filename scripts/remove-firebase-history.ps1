<#
.SYNOPSIS
  Remove a file from git history using git-filter-repo (PowerShell wrapper).

# Requires:
#  - git
#  - python and git-filter-repo (pip install git-filter-repo)
# Usage:
#  .\remove-firebase-history.ps1 -RepoUrl 'git@github.com:you/yourrepo.git' -FilePath 'firebaseConfig.ts'
#>

param(
  [Parameter(Mandatory=$true)] [string]$RepoUrl,
  [string]$FilePath = 'firebaseConfig.ts'
)

$tmp = Join-Path $env:TEMP ([System.Guid]::NewGuid().ToString())
Write-Host "Cloning mirror into $tmp..."
git clone --mirror $RepoUrl (Join-Path $tmp 'repo.git')
Set-Location (Join-Path $tmp 'repo.git')

Write-Host "Running git-filter-repo to remove $FilePath..."
git filter-repo --invert-paths --path $FilePath

Write-Host "Pushing rewritten history (force)..."
git push --force --all
git push --force --tags

Write-Host "Done. Cleaned repo pushed. Collaborators must re-clone."
