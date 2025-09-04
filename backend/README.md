# Math Learning API

This is the backend for a math learning application that uses Node.js, Express, PostgreSQL with Prisma ORM.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Configure your PostgreSQL database in `.env` file:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/math-learning"
   ```

3. Run Prisma migrations to create database schema:
   ```
   npx prisma migrate dev --name init
   ```

4. Start the development server:
   ```
   npm run dev
   ```

## API Endpoints

### User Routes
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login an existing user
- `GET /api/users/profile` - Get user profile information

### Course Routes
- `GET /api/courses` - Get all courses (with optional filtering)
- `GET /api/courses/:id` - Get a specific course
- `POST /api/courses` - Create a new course
- `PUT /api/courses/:id` - Update a course
- `DELETE /api/courses/:id` - Delete a course
- `GET /api/courses/:courseId/problems` - Get all problems for a course

### Problem Routes
- `GET /api/problems/:id` - Get a specific problem
- `POST /api/problems/attempt` - Submit an answer attempt
- `GET /api/problems/user/:userId/attempts` - Get all attempts by a user

## Database Schema

The database includes the following models:
- User
- Course
- Problem
- Enrollment
- Attempt

See the `prisma/schema.prisma` file for detailed schema information.
