# Resolve merge conflict and complete merge (stripe <- main)
# Run this in PowerShell *outside* Cursor (e.g. Windows Terminal) so .git/index.lock is not held.

$repo = "c:\Users\syeda\OneDrive\Desktop\Syed\Dev\ummahhacks-26"
Set-Location $repo

$lock = Join-Path $repo ".git\index.lock"
if (Test-Path $lock) {
  Remove-Item $lock -Force
  Write-Host "Removed .git/index.lock"
}

# Accept "deleted by them": stage deletion of NeedsForm (admin/needs page already deleted, form unused)
git add components/admin/NeedsForm.tsx

git status
if (-not $?) { exit 1 }
Write-Host "`nIf no unmerged paths remain, run: git commit -m `"Merge main into stripe`""
