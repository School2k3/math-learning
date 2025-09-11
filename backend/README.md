# Math Learning API

This is the backend for a math learning application that uses TypeScript, Node.js, Express, and PostgreSQL with Prisma ORM.

## Technologies

- **TypeScript** - Strongly typed programming language
- **Node.js** - JavaScript runtime
- **Express** - Web application framework
- **PostgreSQL** - Relational database
- **Prisma** - Next-generation ORM
- **ESM Modules** - Modern JavaScript module system
- **Swagger** - API documentation

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure your PostgreSQL database in `.env` file:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/math-learning"
   ```

3. Database setup - choose one method:
   
   **Using migrations** (recommended for production):
   ```bash
   npm run db:migrate
   ```
   
   **Direct schema push** (faster for development):
   ```bash
   npm run db:push
   # or
   npm run prisma:push
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. For production deployment:
   ```bash
   npm run build
   npm start
   ```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build production-ready JavaScript |
| `npm start` | Run production server from compiled code |
| `npm run db:migrate` | Run database migrations |
| `npm run db:push` | Push schema changes without migrations |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:studio` | Open Prisma Studio UI |
| `npm run test` | Run tests |

## TypeScript Development

This project uses TypeScript with ESM (ECMAScript Modules). Some important notes:

1. **Import extensions**: Always include `.js` extension in imports even for TypeScript files:
   ```typescript
   // Correct
   import { router } from './routes/index.js';
   
   // Incorrect - will cause "Cannot find module" errors
   import { router } from './routes/index';
   ```

2. **Type definitions**: Store custom type definitions in the `src/types` directory.

3. **Build process**: The TypeScript compiler will output files to the `dist` directory.

4. **nodemon configuration**: The development server uses nodemon with `ts-node` for hot reloading.

## Project Structure

```
backend/
├── src/                   # TypeScript source files
│   ├── config/            # Configuration files (Swagger, etc.)
│   ├── controllers/       # Request handlers
│   ├── routes/            # API routes
│   ├── types/             # TypeScript type definitions
│   └── index.ts           # Entry point
├── prisma/                # Prisma ORM files
│   ├── schema.prisma      # Database schema
│   └── migrations/        # Database migrations
├── dist/                  # Compiled JavaScript output
├── package.json           # Project dependencies and scripts
└── tsconfig.json          # TypeScript configuration
```

## API Endpoints

### Chapters

- **GET /api/chapters** - Get all chapters
- **GET /api/chapters/:id** - Get chapter by ID
- **POST /api/chapters** - Create a new chapter
- **PUT /api/chapters/:id** - Update a chapter
- **DELETE /api/chapters/:id** - Delete a chapter

### Lessons

- **GET /api/lessons** - Get all lessons
- **GET /api/lessons/:id** - Get lesson by ID
- **GET /api/chapters/:chapterId/lessons** - Get lessons by chapter ID
- **POST /api/lessons** - Create a new lesson
- **PUT /api/lessons/:id** - Update a lesson
- **DELETE /api/lessons/:id** - Delete a lesson

### Questions

- **GET /api/questions** - Get all questions
- **GET /api/questions/:id** - Get question by ID
- **GET /api/lessons/:lessonId/questions** - Get questions by lesson ID
- **POST /api/questions** - Create a new question
- **PUT /api/questions/:id** - Update a question
- **DELETE /api/questions/:id** - Delete a question

### Answers

- **GET /api/answers** - Get all answers
- **GET /api/answers/:id** - Get answer by ID
- **GET /api/questions/:questionId/answers** - Get answers by question ID
- **POST /api/answers** - Create a new answer
- **PUT /api/answers/:id** - Update an answer
- **DELETE /api/answers/:id** - Delete an answer

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
