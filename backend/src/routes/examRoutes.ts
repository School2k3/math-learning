import express from 'express';
import examController from '../controllers/examController.js';

const router = express.Router();

/**
 * @swagger
 * /api/exams:
 *   get:
 *     summary: Get all exams
 *     description: Retrieve a list of all exams with optional filtering by grade and chapter.
 *     parameters:
 *       - in: query
 *         name: grade
 *         schema:
 *           type: integer
 *         description: Filter by grade level
 *       - in: query
 *         name: chapterId
 *         schema:
 *           type: integer
 *         description: Filter by chapter ID
 *     responses:
 *       200:
 *         description: A list of exams
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exams:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Exam'
 *       500:
 *         description: Server error
 */
router.get('/', examController.getAllExams);

/**
 * @swagger
 * /api/exams/grade/{grade}:
 *   get:
 *     summary: Get exams by grade
 *     description: Retrieve all exams for a specific grade level.
 *     parameters:
 *       - in: path
 *         name: grade
 *         required: true
 *         schema:
 *           type: integer
 *         description: Grade level
 *     responses:
 *       200:
 *         description: List of exams for the specified grade
 *       500:
 *         description: Server error
 */
router.get('/grade/:grade', examController.getExamsByGrade);

/**
 * @swagger
 * /api/exams/chapter/{chapterId}:
 *   get:
 *     summary: Get exams by chapter
 *     description: Retrieve all exams for a specific chapter.
 *     parameters:
 *       - in: path
 *         name: chapterId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Chapter ID
 *     responses:
 *       200:
 *         description: List of exams for the specified chapter
 *       500:
 *         description: Server error
 */
router.get('/chapter/:chapterId', examController.getExamsByChapter);

/**
 * @swagger
 * /api/exams/results/user/{userId}:
 *   get:
 *     summary: Get exam results by user
 *     description: Retrieve all exam results for a specific user.
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: List of exam results for the user
 *       500:
 *         description: Server error
 */
router.get('/results/user/:userId', examController.getExamResultsByUser);

/**
 * @swagger
 * /api/exams/results/{id}:
 *   get:
 *     summary: Get an exam result by ID
 *     description: Retrieve detailed information about a specific exam result.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Exam result ID
 *     responses:
 *       200:
 *         description: Detailed exam result information
 *       404:
 *         description: Exam result not found
 *       500:
 *         description: Server error
 */
router.get('/results/:id', examController.getExamResultById);

/**
 * @swagger
 * /api/exams/{id}:
 *   get:
 *     summary: Get an exam by ID
 *     description: Retrieve a specific exam with its questions and answers.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Exam ID
 *     responses:
 *       200:
 *         description: Exam details with questions and answers
 *       404:
 *         description: Exam not found
 *       500:
 *         description: Server error
 */
router.get('/:id', examController.getExamById);

export default router;