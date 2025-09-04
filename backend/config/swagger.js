const swaggerJsdoc = require('swagger-jsdoc');

const options = {
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
    components: {
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
              description: 'Book volume (1 or 2)',
            },
            chapterNumber: {
              type: 'integer',
              description: 'Chapter sequence number',
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
              description: 'ID of the chapter this lesson belongs to',
            },
            lessonNumber: {
              type: 'integer',
              description: 'Lesson sequence number within the chapter',
            },
            title: {
              type: 'string',
              description: 'Lesson title',
            },
            contentText: {
              type: 'string',
              description: 'Main content text of the lesson',
            },
            videoUrl: {
              type: 'string',
              description: 'URL to lesson video (optional)',
              nullable: true,
            },
            imageUrl: {
              type: 'string',
              description: 'URL to lesson image (optional)',
              nullable: true,
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'User ID',
            },
            username: {
              type: 'string',
              description: 'Username',
            },
            email: {
              type: 'string',
              description: 'User email',
            },
            fullName: {
              type: 'string',
              description: 'User full name',
            },
            role: {
              type: 'string',
              description: 'User role (student, admin)',
              enum: ['student', 'admin'],
            },
            grade: {
              type: 'integer',
              description: 'Student grade level (1-5), null for admin',
              nullable: true,
            },
            avatarUrl: {
              type: 'string',
              description: 'URL to user avatar image',
              nullable: true,
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
            },
            error: {
              type: 'string',
            },
          },
        },
      },
      responses: {
        BadRequest: {
          description: 'Bad Request',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        NotFound: {
          description: 'Not Found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        InternalServerError: {
          description: 'Internal Server Error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
      },
    },
  },
  apis: ['./routes/*.js'], // Path to the API routes files
};

const specs = swaggerJsdoc(options);

module.exports = specs;
