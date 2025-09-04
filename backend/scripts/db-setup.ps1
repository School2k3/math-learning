# Database setup script for Windows
# PowerShell script

# Wait for PostgreSQL to be ready
Write-Host "Waiting for PostgreSQL to start..."
Start-Sleep -s 5

# Run Prisma migrations
Write-Host "Running Prisma migrations..."
npx prisma migrate dev --name init

# Generate Prisma client
Write-Host "Generating Prisma client..."
npx prisma generate

Write-Host "Database setup completed!"
