# TypeScript database setup script for Windows
# PowerShell script

# Wait for PostgreSQL to be ready
Write-Host "Waiting for PostgreSQL to start..."
Start-Sleep -s 5

# Run database setup commands using package.json scripts
Write-Host "Running Prisma migrations..."
npm run db:migrate

Write-Host "Generating Prisma client..."
npm run prisma:generate

Write-Host "Database setup completed!"
