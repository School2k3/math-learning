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

/**
 * @swagger
 * /api/exams/start:
 *   post:
 *     summary: Start an exam
 *     description: Start a new exam for a user and create an exam result record.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - examId
 *               - userId
 *             properties:
 *               examId:
 *                 type: integer
 *                 description: ID of the exam to start
 *               userId:
 *                 type: integer
 *                 description: ID of the user starting the exam
 *     responses:
 *       201:
 *         description: Exam started successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 examResult:
 *                   $ref: '#/components/schemas/ExamResult'
 *                 totalQuestions:
 *                   type: integer
 *                 durationMinutes:
 *                   type: integer
 *       400:
 *         description: User already has an active exam for this test
 *       404:
 *         description: Exam not found
 *       500:
 *         description: Server error
 */
router.post('/start', examController.startExam);

/**
 * @swagger
 * /api/exams/answer:
 *   post:
 *     summary: Save an exam answer
 *     description: Save or update an answer for a question during the exam.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - resultId
 *               - questionId
 *               - chosenAnswerId
 *             properties:
 *               resultId:
 *                 type: integer
 *                 description: ID of the exam result
 *               questionId:
 *                 type: integer
 *                 description: ID of the question being answered
 *               chosenAnswerId:
 *                 type: integer
 *                 description: ID of the chosen answer
 *               isFlagged:
 *                 type: boolean
 *                 description: Whether the question is flagged for review
 *                 default: false
 *     responses:
 *       200:
 *         description: Answer saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 examAnswer:
 *                   $ref: '#/components/schemas/ExamAnswer'
 *       400:
 *         description: Cannot save answer for completed exam or question does not belong to exam
 *       404:
 *         description: Exam result not found
 *       500:
 *         description: Server error
 */
router.post('/answer', examController.saveExamAnswer);

/**
 * @swagger
 * /api/exams/finish/{resultId}:
 *   post:
 *     summary: Finish an exam
 *     description: Finish an exam, calculate the final score, and update the exam result.
 *     parameters:
 *       - in: path
 *         name: resultId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the exam result to finish
 *     responses:
 *       200:
 *         description: Exam finished successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 examResult:
 *                   $ref: '#/components/schemas/ExamResult'
 *                 score:
 *                   type: number
 *                   description: Final score as percentage
 *                 correctAnswers:
 *                   type: integer
 *                 totalQuestions:
 *                   type: integer
 *                 passed:
 *                   type: boolean
 *                   description: Whether the exam was passed (score >= 60%)
 *       400:
 *         description: Exam already finished
 *       404:
 *         description: Exam result not found
 *       500:
 *         description: Server error
 */
router.post('/finish/:resultId', examController.finishExam);

/**
 * @swagger
 * /api/exams/progress/{resultId}:
 *   get:
 *     summary: Get exam progress
 *     description: Get current progress and time remaining for an active exam.
 *     parameters:
 *       - in: path
 *         name: resultId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the exam result
 *     responses:
 *       200:
 *         description: Current exam progress
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 examResult:
 *                   $ref: '#/components/schemas/ExamResult'
 *                 timeRemaining:
 *                   type: integer
 *                   description: Time remaining in seconds
 *                 answeredQuestions:
 *                   type: integer
 *                 totalQuestions:
 *                   type: integer
 *       400:
 *         description: Exam already finished
 *       404:
 *         description: Exam result not found
 *       500:
 *         description: Server error
 */
router.get('/progress/:resultId', examController.getExamProgress);

export default router;