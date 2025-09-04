# Math Learning Project

This project consists of a backend API built with Node.js, Express, and PostgreSQL with Prisma ORM.

## Setup with Docker

### Prerequisites
- Docker Desktop installed and running
- Node.js and npm installed

### Getting Started

1. Start the PostgreSQL database container:
   ```
   docker-compose up -d
   ```

2. Wait a few seconds for the database to initialize, then set up the database schema:
   ```
   cd backend
   npm run db:migrate
   ```

3. Start the backend development server:
   ```
   npm run dev
   ```

### Accessing the Database

You can connect to the PostgreSQL database using HeidiSQL with these credentials:
- Host: localhost
- Port: 5432
- User: postgres
- Password: postgres
- Database: math-learning

## Project Structure

- `backend/` - Express.js API with Prisma ORM
  - `controllers/` - Request handlers
  - `routes/` - API endpoints
  - `prisma/` - Database schema and client
- Frontend (to be added)

## Development

### Backend Commands

```bash
# Start development server with hot reload
npm run dev

# Run Prisma migrations
npm run db:migrate

# Generate Prisma client
npm run db:generate

# Open Prisma Studio (database UI)
npm run db:studio
```

### Docker Commands

```bash
# Start containers
docker-compose up -d

# Stop containers
docker-compose down

# View container logs
docker-compose logs

# Remove containers and volumes
docker-compose down -v
```
