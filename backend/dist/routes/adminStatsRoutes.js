import express from 'express';
import adminStatsController from '../controllers/adminStatsController.js';
const router = express.Router();
/**
 * @swagger
 * tags:
 *   name: Admin Statistics
 *   description: Admin dashboard statistics endpoints
 */
/**
 * @swagger
 * /api/admin-stats:
 *   get:
 *     summary: Get all admin dashboard statistics
 *     tags: [Admin Statistics]
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *           example: 2025-11-15
 *         description: Optional date filter (YYYY-MM-DD) for active students calculation
 *     responses:
 *       200:
 *         description: Admin statistics retrieved successfully
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
 *                     totalStudents:
 *                       type: integer
 *                     totalLessons:
 *                       type: integer
 *                     totalExams:
 *                       type: integer
 *                     totalChapters:
 *                       type: integer
 *                     activeStudents:
 *                       type: object
 *                       properties:
 *                         count:
 *                           type: integer
 *                         period:
 *                           type: string
 *                     lessonCompletionRate:
 *                       type: number
 *                     averageExamScore:
 *                       type: number
 *                     totalQuestionsAnswered:
 *                       type: integer
 *       500:
 *         description: Server error
 */
router.get('/', adminStatsController.getAllAdminStats);
/**
 * @swagger
 * /api/admin-stats/students:
 *   get:
 *     summary: Get total students count
 *     tags: [Admin Statistics]
 *     responses:
 *       200:
 *         description: Total students retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/students', adminStatsController.getTotalStudents);
/**
 * @swagger
 * /api/admin-stats/lessons:
 *   get:
 *     summary: Get total lessons count
 *     tags: [Admin Statistics]
 *     responses:
 *       200:
 *         description: Total lessons retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/lessons', adminStatsController.getTotalLessons);
/**
 * @swagger
 * /api/admin-stats/exams:
 *   get:
 *     summary: Get total exams count
 *     tags: [Admin Statistics]
 *     responses:
 *       200:
 *         description: Total exams retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/exams', adminStatsController.getTotalExams);
/**
 * @swagger
 * /api/admin-stats/chapters:
 *   get:
 *     summary: Get total chapters count
 *     tags: [Admin Statistics]
 *     responses:
 *       200:
 *         description: Total chapters retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/chapters', adminStatsController.getTotalChapters);
/**
 * @swagger
 * /api/admin-stats/active-students:
 *   get:
 *     summary: Get active students (last 7 days by default or specific date)
 *     tags: [Admin Statistics]
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *           example: 2025-11-15
 *         description: Optional specific date filter (YYYY-MM-DD)
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 7
 *           example: 7
 *         description: Number of days to look back (default 7, ignored if date is provided)
 *     responses:
 *       200:
 *         description: Active students retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/active-students', adminStatsController.getActiveStudents);
/**
 * @swagger
 * /api/admin-stats/completion-rate:
 *   get:
 *     summary: Get lesson completion rate
 *     tags: [Admin Statistics]
 *     responses:
 *       200:
 *         description: Lesson completion rate retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/completion-rate', adminStatsController.getLessonCompletionRate);
/**
 * @swagger
 * /api/admin-stats/average-score:
 *   get:
 *     summary: Get average exam score
 *     tags: [Admin Statistics]
 *     responses:
 *       200:
 *         description: Average exam score retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/average-score', adminStatsController.getAverageExamScore);
/**
 * @swagger
 * /api/admin-stats/questions:
 *   get:
 *     summary: Get total questions answered
 *     tags: [Admin Statistics]
 *     responses:
 *       200:
 *         description: Total questions answered retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/questions', adminStatsController.getTotalQuestionsAnswered);
/**
 * @swagger
 * /api/admin-stats/students-by-grade:
 *   get:
 *     summary: Get students count grouped by grade (for bar chart)
 *     tags: [Admin Statistics]
 *     responses:
 *       200:
 *         description: Students by grade retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/students-by-grade', adminStatsController.getStudentsByGrade);
/**
 * @swagger
 * /api/admin-stats/completion-breakdown:
 *   get:
 *     summary: Get lesson completion breakdown (for pie chart)
 *     tags: [Admin Statistics]
 *     parameters:
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *           example: 2025-11-01
 *         description: Start date filter (YYYY-MM-DD)
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *           example: 2025-11-15
 *         description: End date filter (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Lesson completion breakdown retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/completion-breakdown', adminStatsController.getLessonCompletionBreakdown);
/**
 * @swagger
 * /api/admin-stats/monthly-trend:
 *   get:
 *     summary: Get monthly trend of average scores and exam count
 *     tags: [Admin Statistics]
 *     parameters:
 *       - in: query
 *         name: months
 *         schema:
 *           type: integer
 *           default: 6
 *           example: 6
 *         description: Number of months to include (ignored if fromDate/toDate provided)
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *           example: 2025-11-01
 *         description: Start date filter (YYYY-MM-DD)
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *           example: 2025-11-15
 *         description: End date filter (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Monthly trend retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/monthly-trend', adminStatsController.getMonthlyTrend);
/**
 * @swagger
 * /api/admin-stats/performance-by-topic:
 *   get:
 *     summary: Get performance statistics by topic/chapter (for radar chart)
 *     tags: [Admin Statistics]
 *     parameters:
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *           example: 2025-11-01
 *         description: Start date filter (YYYY-MM-DD)
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *           example: 2025-11-15
 *         description: End date filter (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Performance by topic retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/performance-by-topic', adminStatsController.getPerformanceByTopic);
/**
 * @swagger
 * /api/admin-stats/weekly-activity:
 *   get:
 *     summary: Get weekly activity statistics
 *     tags: [Admin Statistics]
 *     parameters:
 *       - in: query
 *         name: weeks
 *         schema:
 *           type: integer
 *           default: 4
 *           example: 4
 *         description: Number of weeks to include (ignored if fromDate/toDate provided)
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *           example: 2025-11-01
 *         description: Start date filter (YYYY-MM-DD)
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *           example: 2025-11-15
 *         description: End date filter (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Weekly activity retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/weekly-activity', adminStatsController.getWeeklyActivity);
/**
 * @swagger
 * /api/admin-stats/recent-activity:
 *   get:
 *     summary: Get recent activity feed
 *     tags: [Admin Statistics]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           example: 10
 *         description: Maximum number of activities to return
 *     responses:
 *       200:
 *         description: Recent activity retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/recent-activity', adminStatsController.getRecentActivity);
export default router;
