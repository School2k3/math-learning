import express from 'express';
import questionController from '../controllers/questionController.js';
import { validateRequest } from '../middleware/validation.js';
import { 
  createQuestionSchema, 
  updateQuestionSchema,
  updateAnswersSchema
} from '../schemas/question.schema.js';

const router = express.Router();

/**
 * @swagger
 * /api/questions:
 *   get:
 *     summary: Get all questions
 *     description: Retrieve a list of all questions with optional filtering by grade, topic, and type.
 *     parameters:
 *       - in: query
 *         name: grade
 *         schema:
 *           type: integer
 *         description: Filter by grade level
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by question type (practice, exam, both)
 *       - in: query
 *         name: answerType
 *         schema:
 *           type: string
 *         description: Filter by answer type (combobox, text, choice)
 *     responses:
 *       200:
 *         description: A list of questions with their answers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 questions:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Question'
 *       500:
 *         description: Server error
 */
router.get('/', questionController.getAllQuestions);

/**
 * @swagger
 * /api/questions/grade/{grade}:
 *   get:
 *     summary: Get questions by grade
 *     description: Retrieve all questions for a specific grade level.
 *     parameters:
 *       - in: path
 *         name: grade
 *         required: true
 *         schema:
 *           type: integer
 *         description: Grade level
 *     responses:
 *       200:
 *         description: List of questions for the specified grade
 *       500:
 *         description: Server error
 */
router.get('/grade/:grade', questionController.getQuestionsByGrade);

/**
 * @swagger
 * /api/questions/lesson/{lessonId}:
 *   get:
 *     summary: Get questions by lesson
 *     description: Retrieve all questions for a specific lesson.
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Lesson ID
 *     responses:
 *       200:
 *         description: List of questions for the specified lesson
 *       500:
 *         description: Server error
 */
router.get('/lesson/:lessonId', questionController.getQuestionsByLesson);

/**
 * @swagger
 * /api/questions/lesson/{lessonId}/practice:
 *   get:
 *     summary: Get practice questions by lesson
 *     description: Retrieve all practice questions for a specific lesson.
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Lesson ID
 *     responses:
 *       200:
 *         description: List of practice questions for the specified lesson
 *       500:
 *         description: Server error
 */
router.get('/lesson/:lessonId/practice', questionController.getPracticeQuestionsByLesson);

/**
 * @swagger
 * /api/questions/exam/{examId}:
 *   get:
 *     summary: Get questions by exam
 *     description: Retrieve all questions for a specific exam.
 *     parameters:
 *       - in: path
 *         name: examId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Exam ID
 *     responses:
 *       200:
 *         description: List of questions for the specified exam
 *       500:
 *         description: Server error
 */
router.get('/exam/:examId', questionController.getQuestionsByExamId);

/**
 * @swagger
 * /api/questions/{id}:
 *   get:
 *     summary: Get a question by ID
 *     description: Retrieve a question and its answers by question ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Question ID
 *     responses:
 *       200:
 *         description: Question details with answers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 question:
 *                   $ref: '#/components/schemas/Question'
 *       404:
 *         description: Question not found
 *       500:
 *         description: Server error
 */
router.get('/:id', questionController.getQuestionById);

/**
 * @swagger
 * /api/questions/{id}/audio:
 *   get:
 *     summary: Get audio for a question
 *     description: Retrieve the audio URL for a specific question by ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Question ID
 *     responses:
 *       200:
 *         description: Question audio URL
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 audioUrl:
 *                   type: string
 *       404:
 *         description: Question not found or audio not available
 *       500:
 *         description: Server error
 */
router.get('/:id/audio', questionController.getQuestionAudio);

/**
 * @swagger
 * /api/questions:
 *   post:
 *     summary: Create a new question with answers
 *     description: Create a new question with associated answers.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - questionText
 *               - grade
 *               - type
 *               - answers
 *             properties:
 *               questionText:
 *                 type: string
 *                 description: Text of the question
 *               imageUrl:
 *                 type: string
 *                 nullable: true
 *                 description: URL to the question image
 *               audioUrl:
 *                 type: string
 *                 nullable: true
 *                 description: URL to the question audio
 *               explanationText:
 *                 type: string
 *                 nullable: true
 *                 description: Text explaining the answer
 *               explanationImg:
 *                 type: string
 *                 nullable: true
 *                 description: URL to explanation image
 *               grade:
 *                 type: integer
 *                 description: Grade level (1-5)
 *               type:
 *                 type: string
 *                 enum: [practice, exam]
 *                 description: Question type
 *               answerType:
 *                 type: string
 *                 nullable: true
 *                 enum: [combobox, text, choice]
 *                 description: Type of answer mechanism
 *               lessonId:
 *                 type: integer
 *                 nullable: true
 *                 description: ID of the related lesson
 *               answers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - answerText
 *                     - isCorrect
 *                   properties:
 *                     answerText:
 *                       type: string
 *                       description: Text of the answer
 *                     isCorrect:
 *                       type: boolean
 *                       description: Whether this is the correct answer
 *     responses:
 *       201:
 *         description: Question created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post('/', validateRequest(createQuestionSchema), questionController.createQuestion);

/**
 * @swagger
 * /api/questions/{id}:
 *   put:
 *     summary: Update a question
 *     description: Update an existing question by ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Question ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               questionText:
 *                 type: string
 *                 description: Text of the question
 *               imageUrl:
 *                 type: string
 *                 nullable: true
 *                 description: URL to the question image
 *               audioUrl:
 *                 type: string
 *                 nullable: true
 *                 description: URL to the question audio
 *               explanationText:
 *                 type: string
 *                 nullable: true
 *                 description: Text explaining the answer
 *               explanationImg:
 *                 type: string
 *                 nullable: true
 *                 description: URL to explanation image
 *               grade:
 *                 type: integer
 *                 description: Grade level (1-5)
 *               type:
 *                 type: string
 *                 enum: [practice, exam]
 *                 description: Question type
 *               answerType:
 *                 type: string
 *                 nullable: true
 *                 enum: [combobox, text, choice]
 *                 description: Type of answer mechanism
 *               lessonId:
 *                 type: integer
 *                 nullable: true
 *                 description: ID of the related lesson
 *     responses:
 *       200:
 *         description: Question updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Question not found
 *       500:
 *         description: Server error
 */
router.put('/:id', validateRequest(updateQuestionSchema), questionController.updateQuestion);

/**
 * @swagger
 * /api/questions/{id}/answers:
 *   put:
 *     summary: Update answers for a question
 *     description: Update, add, or delete answers for an existing question.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Question ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: Answer ID (required for updating existing answers)
 *                 answerText:
 *                   type: string
 *                   description: Text of the answer
 *                 isCorrect:
 *                   type: boolean
 *                   description: Whether this is the correct answer
 *                 _delete:
 *                   type: boolean
 *                   description: Set to true to delete this answer
 *     responses:
 *       200:
 *         description: Answers updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Question not found
 *       500:
 *         description: Server error
 */
router.put('/:id/answers', validateRequest(updateAnswersSchema), questionController.updateQuestionAnswers);

/**
 * @swagger
 * /api/questions/{id}:
 *   delete:
 *     summary: Delete a question
 *     description: Delete an existing question by ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Question ID
 *     responses:
 *       200:
 *         description: Question deleted successfully
 *       400:
 *         description: Cannot delete question with existing practice or exam answers
 *       404:
 *         description: Question not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', questionController.deleteQuestion);

export default router;
