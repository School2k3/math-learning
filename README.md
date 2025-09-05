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
    - `chapterController.js` - Chapter related operations
    - `lessonController.js` - Lesson related operations
    - `questionController.js` - Question related operations
    - `answerController.js` - Answer related operations
  - `routes/` - API endpoints
    - `chapterRoutes.js` - Chapter endpoints
    - `lessonRoutes.js` - Lesson endpoints
    - `questionRoutes.js` - Question endpoints
    - `answerRoutes.js` - Answer endpoints
  - `prisma/` - Database schema and client
    - `schema.prisma` - Database models and relationships
- Frontend (to be added)

## Development

### Backend Commands

```bash
# Start development server with hot reload
npm run dev

# Run Prisma migrations (creates migration history)
npm run db:migrate

# Push schema changes without migrations (preserves data)
npm run db:push

# Generate Prisma client
npm run db:generate

# Open Prisma Studio (database UI)
npm run db:studio

# Alternative commands (aliases)
npm run prisma:generate  # Generate Prisma client
npm run prisma:push     # Push schema changes without running generate
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

## API Documentation

API documentation is available at `/api-docs` when the server is running. Below are some of the key endpoints:

### Question Endpoints

```
GET /api/questions - Get all questions (with optional filtering)
GET /api/questions/:id - Get a specific question by ID
GET /api/questions/grade/:grade - Get questions by grade level
GET /api/questions/topic/:topic - Get questions by topic
```

### Answer Endpoints

```
GET /api/answers/question/:questionId - Get all answers for a specific question
GET /api/answers/:id - Get a specific answer by ID
GET /api/answers/correct/:questionId - Get all correct answers for a question
```

### Data Models

The database includes the following key models:

- **Chapter & Lesson**: Educational content structure
- **Question & Answer**: Question content with multiple answer options
- **Explanation**: Detailed explanations for questions (linked to questions)
- **Practice & Exam**: Assessment systems for students
- **User & Progress Tracking**: User management and learning progress

### Database Schema

The database schema includes several related models:

```
User ───┬─── PracticeSession ───┬─── PracticeAnswer
        │                       │
        ├─── ExamResult ────────┴─── ExamAnswer
        │
        └─── ProgressHistory
        
Chapter ── Lesson

Question ─┬─ Answer
          │
          └─ Explanation
          
Exam ──── ExamQuestion

Reward ── UserReward
```

This schema allows for a comprehensive educational platform with lessons, practice exercises, and formal examinations.
