import express from 'express';
import practiceController from '../controllers/practiceController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/practice/session:
 *   post:
 *     summary: Create or update a practice session
 *     description: Creates a new practice session or updates an existing one
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: ID of the user
 *               lessonId:
 *                 type: integer
 *                 description: ID of the lesson (optional)
 *               topic:
 *                 type: string
 *                 description: Topic of the practice session
 *     responses:
 *       201:
 *         description: Practice session created or updated successfully
 *       400:
 *         description: Bad request - missing required fields
 *       500:
 *         description: Server error
 */
router.post('/session', practiceController.createOrUpdateSession);

/**
 * @swagger
 * /api/practice/answer:
 *   post:
 *     summary: Save a practice answer
 *     description: Saves a user's answer for a practice question
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               practiceId:
 *                 type: integer
 *                 description: ID of the practice session
 *               questionId:
 *                 type: integer
 *                 description: ID of the question
 *               answerId:
 *                 type: integer
 *                 description: ID of the selected answer
 *     responses:
 *       201:
 *         description: Practice answer saved successfully
 *       400:
 *         description: Bad request - missing required fields
 *       404:
 *         description: Answer not found
 *       500:
 *         description: Server error
 */
router.post('/answer', practiceController.saveAnswer);

/**
 * @swagger
 * /api/practice/session/{practiceId}/complete:
 *   put:
 *     summary: Complete a practice session
 *     description: Marks a practice session as complete and calculates the final score
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: practiceId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Practice session ID
 *     responses:
 *       200:
 *         description: Practice session completed successfully
 *       500:
 *         description: Server error
 */
router.put('/session/:practiceId/complete', practiceController.completeSession);

/**
 * @swagger
 * /api/practice/history/{userId}:
 *   get:
 *     summary: Get user practice history
 *     description: Retrieves practice session history for a specific user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: Practice history retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/history/:userId', practiceController.getUserPracticeHistory);

export default router;