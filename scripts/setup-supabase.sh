#!/bin/bash

# Bash script để setup Supabase Database

echo "========================================"
echo "Math Learning - Supabase Setup"
echo "========================================"
echo ""

# Kiểm tra xem có .env chưa
if [ ! -f ".env" ]; then
    echo "Chưa có file .env. Hãy tạo file .env với DATABASE_URL từ Supabase."
    echo ""
    echo "Ví dụ nội dung file .env:"
    echo ""
    echo 'DATABASE_URL="postgresql://postgres.[ref]:[PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"'
    echo 'JWT_SECRET="your-secret-key-change-this"'
    echo 'NODE_ENV=development'
    echo 'PORT=3000'
    echo ""
    
    read -p "Bạn đã tạo file .env chưa? (y/n)" choice
    if [ "$choice" != "y" ] && [ "$choice" != "Y" ]; then
        echo "Vui lòng tạo file .env trước khi tiếp tục!"
        exit 1
    fi
fi

echo "Step 1: Generating Prisma Client..."
npm run db:generate

if [ $? -ne 0 ]; then
    echo "Error generating Prisma Client!"
    exit 1
fi

echo ""
echo "Step 2: Pushing schema to database..."
npm run db:push

if [ $? -ne 0 ]; then
    echo "Error pushing to database!"
    echo "Hãy kiểm tra lại DATABASE_URL trong file .env"
    exit 1
fi

echo ""
echo "========================================"
echo "Setup completed successfully!"
echo "========================================"
echo ""
echo "Để test connection:"
echo "  npm run db:studio  (xem database trong browser)"
echo "  npm run dev       (start server)"
echo ""

