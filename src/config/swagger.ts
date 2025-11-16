import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Math Learning API',
      version: '1.0.0',
      description: 'API documentation for the Math Learning application',
      contact: {
        name: 'API Support',
        email: 'support@math-learning.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    tags: [
      { name: 'Users', description: 'User profile and management' },
      { name: 'Authentication', description: 'Auth, tokens, OTP' },
      { name: 'Chapters', description: 'Chapters management' },
      { name: 'Lessons', description: 'Lessons management' },
      { name: 'Questions', description: 'Questions and related operations' },
      { name: 'Answers', description: 'Answers management' },
      { name: 'Exams', description: 'Exams and results' },
      { name: 'Uploads', description: 'Media uploads (images, videos)' },
      { name: 'Practice', description: 'Practice sessions and logic' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token in the format: Bearer <token>'
        }
      },
      // Tag definitions (to organize the UI)
      // Actual grouping is driven by adding \"tags\" to each operation in route docs
      // These tags will appear in the sidebar
      // Note: Some tags may be defined here even if not yet used by all routes
      // to make the structure clearer for future additions.
      // OpenAPI 3 allows top-level tags either under root or via definition extension.
      // We'll add them under root below as well for better UI support.
      schemas: {
        Chapter: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Chapter ID',
            },
            grade: {
              type: 'integer',
              description: 'Grade level (1-5)',
            },
            volume: {
              type: 'integer',
              description: 'Volume number (1 or 2)',
            },
            chapterNumber: {
              type: 'integer',
              description: 'Chapter number within grade and volume',
            },
            title: {
              type: 'string',
              description: 'Chapter title',
            },
          },
        },
        Lesson: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Lesson ID',
            },
            chapterId: {
              type: 'integer',
              description: 'ID of the parent chapter',
            },
            lessonNumber: {
              type: 'integer',
              description: 'Lesson number within chapter',
            },
            title: {
              type: 'string',
              description: 'Lesson title',
            },
            videoUrl: {
              type: 'string',
              description: 'URL to lesson video',
              nullable: true,
            },
            imageUrl: {
              type: 'string',
              description: 'URL to lesson image',
              nullable: true,
            },
          },
        },
        Question: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Question ID',
            },
            questionText: {
              type: 'string',
              description: 'The text of the question',
            },
            imageUrl: {
              type: 'string',
              description: 'URL to question image',
              nullable: true,
            },
            audioUrl: {
              type: 'string',
              description: 'URL to question audio',
              nullable: true,
            },
            grade: {
              type: 'integer',
              description: 'Grade level',
            },
            explanationText: {
              type: 'string',
              description: 'Explanation text for the question',
              nullable: true,
            },
            explanationImg: {
              type: 'string',
              description: 'URL to explanation image',
              nullable: true,
            },
            type: {
              type: 'string',
              description: 'Question type (practice, exam, both)',
            },
            answerType: {
              type: 'string',
              description: 'Answer type (combobox, text, choice)',
            },
            answers: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Answer',
              },
            },
          },
        },
        Answer: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Answer ID',
            },
            questionId: {
              type: 'integer',
              description: 'ID of the question this answer belongs to',
            },
            answerText: {
              type: 'string',
              description: 'Text of the answer',
            },
            isCorrect: {
              type: 'boolean',
              description: 'Whether this answer is correct',
            },
          },
        },
        Exam: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Exam ID',
            },
            title: {
              type: 'string',
              description: 'Exam title',
            },
            grade: {
              type: 'integer',
              description: 'Grade level',
            },
            chapterId: {
              type: 'integer',
              description: 'ID of the chapter this exam belongs to',
              nullable: true,
            },
            chapter: {
              $ref: '#/components/schemas/Chapter',
              nullable: true,
            },
            durationMinutes: {
              type: 'integer',
              description: 'Duration of the exam in minutes',
            },
            examQuestions: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/ExamQuestion',
              },
              description: 'Questions included in this exam',
            },
          },
        },
        ExamQuestion: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Exam Question ID',
            },
            examId: {
              type: 'integer',
              description: 'ID of the exam this question belongs to',
            },
            questionId: {
              type: 'integer',
              description: 'ID of the question',
            },
            question: {
              $ref: '#/components/schemas/Question',
            },
          },
        },
        ExamResult: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Result ID',
            },
            examId: {
              type: 'integer',
              description: 'ID of the exam taken',
            },
            userId: {
              type: 'integer',
              description: 'ID of the user who took the exam',
            },
            score: {
              type: 'number',
              description: 'Score achieved in the exam',
            },
            startedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Time when the exam was started',
            },
            finishedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Time when the exam was finished',
              nullable: true,
            },
            examAnswers: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/ExamAnswer',
              },
              description: 'Answers submitted for this exam',
            },
          },
        },
        ExamAnswer: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Exam Answer ID',
            },
            resultId: {
              type: 'integer',
              description: 'ID of the exam result this answer belongs to',
            },
            questionId: {
              type: 'integer',
              description: 'ID of the question being answered',
            },
            chosenAnswerId: {
              type: 'integer',
              description: 'ID of the answer chosen by the user',
            },
            isCorrect: {
              type: 'boolean',
              description: 'Whether the chosen answer was correct',
            },
            isFlagged: {
              type: 'boolean',
              description: 'Whether the question was flagged by the user for review',
            },
          },
        }
      },
    },
  },
  apis: ['./src/routes/*.ts', './routes/*.ts'], // Support both dev and build environments
};

const swaggerSpecs = swaggerJsdoc(options);

export default swaggerSpecs;
