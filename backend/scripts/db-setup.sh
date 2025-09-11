#!/bin/bash

# TypeScript database setup script for Unix-based systems

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to start..."
sleep 5

# Run database setup commands using package.json scripts
echo "Running Prisma migrations..."
npm run db:migrate

echo "Generating Prisma client..."
npm run prisma:generate

echo "Database setup completed!"
