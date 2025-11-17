# PowerShell script to fix all API URLs
$apiFiles = @(
    "src/api/examAPI.ts",
    "src/api/lessonAPI.ts",
    "src/api/questionAPI.ts",
    "src/api/praticeAPI.ts",
    "src/api/uploadAPI.ts",
    "src/api/userStatsAPI.ts",
    "src/api/lessonReviewAPI.ts",
    "src/api/answers.ts"
)

foreach ($file in $apiFiles) {
    if (!(Test-Path $file)) {
        Write-Host "⚠️  Skip: $file (not found)" -ForegroundColor Yellow
        continue
    }

    $content = Get-Content $file -Raw

    # Check if already has import
    if ($content -notmatch 'import.*buildApiUrl') {
        # Add import at the top
        $content = "import { buildApiUrl } from `"../config/api`";`n`n$content"
    }

    # Replace fetch patterns
    # Pattern 1: fetch("/api/...")
    $content = $content -replace 'fetch\("(/api/[^"]+)"\)', 'fetch(buildApiUrl("$1"))'
    
    # Pattern 2: fetch('/api/...')
    $content = $content -replace "fetch\('(/api/[^']+)'\)", "fetch(buildApiUrl('`$1'))"
    
    # Pattern 3: fetch(`/api/...`)
    $content = $content -replace 'fetch\(`(/api/[^`]+)`\)', 'fetch(buildApiUrl(`$1`))'
    
    # Pattern 4: fetch(url) where url starts with /api
    $content = $content -replace '(?<=const url = [`''"]/api/[^`''"]+[`''"]\s*;\s*const response = await )fetch\(url\)', 'fetch(buildApiUrl(url))'

    # Write back
    Set-Content -Path $file -Value $content -NoNewline
    Write-Host "✅ Fixed: $file" -ForegroundColor Green
}

Write-Host "`n🎉 All API files have been updated!" -ForegroundColor Cyan
Write-Host "Run: npm run build" -ForegroundColor Yellow
