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
        }
      },
    },
  },
  apis: ['./src/routes/*.ts', './routes/*.ts'], // Support both dev and build environments
};

const swaggerSpecs = swaggerJsdoc(options);

export default swaggerSpecs;
