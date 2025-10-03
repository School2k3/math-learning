import express from 'express';
import questionController from '../controllers/questionController.js';

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

export default router;
