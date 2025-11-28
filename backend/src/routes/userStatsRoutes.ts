import express from 'express';
import userStatsController from '../controllers/userStatsController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: User Statistics
 *   description: User learning statistics and progress tracking
 */

/**
 * @swagger
 * /api/user-stats/{userId}:
 *   get:
 *     summary: Get comprehensive user statistics
 *     tags: [User Statistics]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *           example: 2025-11-15
 *         description: Optional date filter (YYYY-MM-DD) to get stats for a specific day
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     questionsAnswered:
 *                       type: integer
 *                       description: Total unique questions answered
 *                     examsCompleted:
 *                       type: integer
 *                       description: Number of completed exams
 *                     topicsPracticed:
 *                       type: integer
 *                       description: Number of completed practice sessions
 *                     minutesSpent:
 *                       type: integer
 *                       description: Total minutes spent learning
 *                     totalPoints:
 *                       type: number
 *                       description: Total points earned
 *                     trophies:
 *                       type: integer
 *                       description: Number of trophies earned
 *       500:
 *         description: Server error
 */
router.get('/:userId', userStatsController.getUserStatistics);

/**
 * @swagger
 * /api/user-stats/{userId}/practice:
 *   get:
 *     summary: Get detailed practice statistics
 *     tags: [User Statistics]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *           example: 2025-11-15
 *         description: Optional date filter (YYYY-MM-DD) to get stats for a specific day
 *     responses:
 *       200:
 *         description: Practice statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalSessions:
 *                       type: integer
 *                     completedSessions:
 *                       type: integer
 *                     inProgressSessions:
 *                       type: integer
 *                     sessions:
 *                       type: array
 *       500:
 *         description: Server error
 */
router.get('/:userId/practice', userStatsController.getPracticeStatistics);

/**
 * @swagger
 * /api/user-stats/{userId}/exams:
 *   get:
 *     summary: Get detailed exam statistics
 *     tags: [User Statistics]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *           example: 2025-11-15
 *         description: Optional date filter (YYYY-MM-DD) to get stats for a specific day
 *     responses:
 *       200:
 *         description: Exam statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalExams:
 *                       type: integer
 *                     completedExams:
 *                       type: integer
 *                     inProgressExams:
 *                       type: integer
 *                     passedExams:
 *                       type: integer
 *                     failedExams:
 *                       type: integer
 *                     averageScore:
 *                       type: number
 *                     examResults:
 *                       type: array
 *       500:
 *         description: Server error
 */
router.get('/:userId/exams', userStatsController.getExamStatistics);

/**
 * @swagger
 * /api/user-stats/{userId}/questions:
 *   get:
 *     summary: Get questions answered statistics
 *     tags: [User Statistics]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *           example: 2025-11-15
 *         description: Optional date filter (YYYY-MM-DD) to get stats for a specific day
 *     responses:
 *       200:
 *         description: Questions statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalAnswered:
 *                       type: integer
 *                       description: Total answers given
 *                     uniqueQuestionsAnswered:
 *                       type: integer
 *                       description: Unique questions answered
 *                     correctAnswers:
 *                       type: integer
 *                     incorrectAnswers:
 *                       type: integer
 *                     accuracy:
 *                       type: number
 *                       description: Accuracy percentage
 *       500:
 *         description: Server error
 */
router.get('/:userId/questions', userStatsController.getQuestionsStatistics);

/**
 * @swagger
 * /api/user-stats/{userId}/practice-minutes:
 *   get:
 *     summary: Get total minutes spent on practice
 *     tags: [User Statistics]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *           example: 2025-11-15
 *         description: Optional date filter (YYYY-MM-DD) to get stats for a specific day
 *     responses:
 *       200:
 *         description: Practice minutes retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalMinutes:
 *                       type: integer
 *                       description: Total minutes spent on practice
 *                     totalSessions:
 *                       type: integer
 *                       description: Number of completed practice sessions
 *                     averageMinutesPerSession:
 *                       type: integer
 *                       description: Average minutes per session
 *       500:
 *         description: Server error
 */
router.get('/:userId/practice-minutes', userStatsController.getPracticeMinutes);

/**
 * @swagger
 * /api/user-stats/{userId}/exam-minutes:
 *   get:
 *     summary: Get total minutes spent on exams
 *     tags: [User Statistics]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *           example: 2025-11-15
 *         description: Optional date filter (YYYY-MM-DD) to get stats for a specific day
 *     responses:
 *       200:
 *         description: Exam minutes retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalMinutes:
 *                       type: integer
 *                       description: Total minutes spent on exams
 *                     totalExams:
 *                       type: integer
 *                       description: Number of completed exams
 *                     averageMinutesPerExam:
 *                       type: integer
 *                       description: Average minutes per exam
 *       500:
 *         description: Server error
 */
router.get('/:userId/exam-minutes', userStatsController.getExamMinutes);

/**
 * @swagger
 * /api/user-stats/{userId}/most-wrong-answers-practice:
 *   get:
 *     summary: Get user's most wrong answers in practice sessions
 *     tags: [User Statistics]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           example: 20
 *         description: Maximum number of questions to return
 *     responses:
 *       200:
 *         description: User most wrong answers in practice retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       questionId:
 *                         type: integer
 *                       questionText:
 *                         type: string
 *                       questionImage:
 *                         type: string
 *                       wrongCount:
 *                         type: integer
 *                       totalAttempts:
 *                         type: integer
 *                       wrongPercentage:
 *                         type: number
 *                       correctAnswer:
 *                         type: object
 *                       lastWrongAnswer:
 *                         type: object
 *                       allAnswers:
 *                         type: array
 *                       explanationText:
 *                         type: string
 *       500:
 *         description: Server error
 */
router.get('/:userId/most-wrong-answers-practice', userStatsController.getUserMostWrongAnswersPractice);

/**
 * @swagger
 * /api/user-stats/{userId}/most-wrong-answers-exam:
 *   get:
 *     summary: Get user's most wrong answers in exams
 *     tags: [User Statistics]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           example: 20
 *         description: Maximum number of questions to return
 *     responses:
 *       200:
 *         description: User most wrong answers in exams retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       questionId:
 *                         type: integer
 *                       questionText:
 *                         type: string
 *                       questionImage:
 *                         type: string
 *                       wrongCount:
 *                         type: integer
 *                       totalAttempts:
 *                         type: integer
 *                       wrongPercentage:
 *                         type: number
 *                       appearsInExams:
 *                         type: integer
 *                       correctAnswer:
 *                         type: object
 *                       lastWrongAnswer:
 *                         type: object
 *                       allAnswers:
 *                         type: array
 *                       explanationText:
 *                         type: string
 *       500:
 *         description: Server error
 */
router.get('/:userId/most-wrong-answers-exam', userStatsController.getUserMostWrongAnswersExam);

export default router;
