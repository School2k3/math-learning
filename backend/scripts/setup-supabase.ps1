# PowerShell script để setup Supabase Database

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Math Learning - Supabase Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Kiểm tra xem có .env chưa
if (-not (Test-Path ".env")) {
    Write-Host "Chưa có file .env. Hãy tạo file .env với DATABASE_URL từ Supabase." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Ví dụ nội dung file .env:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host 'DATABASE_URL="postgresql://postgres.[ref]:[PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"' -ForegroundColor Green
    Write-Host 'JWT_SECRET="your-secret-key-change-this"' -ForegroundColor Green
    Write-Host 'NODE_ENV=development' -ForegroundColor Green
    Write-Host 'PORT=3000' -ForegroundColor Green
    Write-Host ""
    
    $choice = Read-Host "Bạn đã tạo file .env chưa? (y/n)"
    if ($choice -ne "y" -and $choice -ne "Y") {
        Write-Host "Vui lòng tạo file .env trước khi tiếp tục!" -ForegroundColor Red
        exit
    }
}

Write-Host "Step 1: Generating Prisma Client..." -ForegroundColor Cyan
npm run db:generate

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error generating Prisma Client!" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "Step 2: Pushing schema to database..." -ForegroundColor Cyan
npm run db:push

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error pushing to database!" -ForegroundColor Red
    Write-Host "Hãy kiểm tra lại DATABASE_URL trong file .env" -ForegroundColor Yellow
    exit
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Setup completed successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Để test connection:" -ForegroundColor Cyan
Write-Host "  npm run db:studio  (xem database trong browser)" -ForegroundColor Yellow
Write-Host "  npm run dev       (start server)" -ForegroundColor Yellow
Write-Host ""

