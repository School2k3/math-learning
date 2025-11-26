import express from 'express';
import lessonReviewController from '../controllers/lessonReviewController.js';
const router = express.Router();
/**
 * @swagger
 * tags:
 *   name: Lesson Reviews
 *   description: Lesson likes and reviews management
 */
/**
 * @swagger
 * /api/lesson-reviews/like:
 *   post:
 *     summary: Like a lesson
 *     tags: [Lesson Reviews]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - lessonId
 *             properties:
 *               userId:
 *                 type: integer
 *                 example: 1
 *               lessonId:
 *                 type: integer
 *                 example: 5
 *     responses:
 *       201:
 *         description: Lesson liked successfully
 *       400:
 *         description: Already liked or bad request
 *       404:
 *         description: Lesson not found
 *       500:
 *         description: Server error
 */
router.post('/like', lessonReviewController.likeLesson);
/**
 * @swagger
 * /api/lesson-reviews/unlike:
 *   post:
 *     summary: Unlike a lesson
 *     tags: [Lesson Reviews]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - lessonId
 *             properties:
 *               userId:
 *                 type: integer
 *                 example: 1
 *               lessonId:
 *                 type: integer
 *                 example: 5
 *     responses:
 *       200:
 *         description: Lesson unliked successfully
 *       404:
 *         description: Like not found
 *       500:
 *         description: Server error
 */
router.post('/unlike', lessonReviewController.unlikeLesson);
/**
 * @swagger
 * /api/lesson-reviews/likes/{lessonId}:
 *   get:
 *     summary: Get all likes for a lesson
 *     tags: [Lesson Reviews]
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Lesson ID
 *     responses:
 *       200:
 *         description: Likes retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/likes/:lessonId', lessonReviewController.getLessonLikes);
/**
 * @swagger
 * /api/lesson-reviews/review:
 *   post:
 *     summary: Create or update a review
 *     tags: [Lesson Reviews]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - lessonId
 *               - rating
 *             properties:
 *               userId:
 *                 type: integer
 *                 example: 1
 *               lessonId:
 *                 type: integer
 *                 example: 5
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *               comment:
 *                 type: string
 *                 example: Great lesson! Very clear explanation.
 *     responses:
 *       201:
 *         description: Review created successfully
 *       200:
 *         description: Review updated successfully
 *       400:
 *         description: Bad request - Invalid rating
 *       404:
 *         description: Lesson not found
 *       500:
 *         description: Server error
 */
router.post('/review', lessonReviewController.createOrUpdateReview);
/**
 * @swagger
 * /api/lesson-reviews/review:
 *   delete:
 *     summary: Delete a review
 *     tags: [Lesson Reviews]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - lessonId
 *             properties:
 *               userId:
 *                 type: integer
 *                 example: 1
 *               lessonId:
 *                 type: integer
 *                 example: 5
 *     responses:
 *       200:
 *         description: Review deleted successfully
 *       404:
 *         description: Review not found
 *       500:
 *         description: Server error
 */
router.delete('/review', lessonReviewController.deleteReview);
/**
 * @swagger
 * /api/lesson-reviews/reviews/{lessonId}:
 *   get:
 *     summary: Get all reviews for a lesson
 *     tags: [Lesson Reviews]
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Lesson ID
 *       - in: query
 *         name: rating
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         description: Filter by rating (optional)
 *     responses:
 *       200:
 *         description: Reviews retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reviews:
 *                   type: array
 *                   items:
 *                     type: object
 *                 statistics:
 *                   type: object
 *                   properties:
 *                     totalReviews:
 *                       type: integer
 *                     averageRating:
 *                       type: number
 *                     ratingDistribution:
 *                       type: object
 *       500:
 *         description: Server error
 */
router.get('/reviews/:lessonId', lessonReviewController.getLessonReviews);
/**
 * @swagger
 * /api/lesson-reviews/review/{lessonId}/{userId}:
 *   get:
 *     summary: Get a specific user's review for a lesson
 *     tags: [Lesson Reviews]
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Lesson ID
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: Review retrieved successfully
 *       404:
 *         description: Review not found
 *       500:
 *         description: Server error
 */
router.get('/review/:lessonId/:userId', lessonReviewController.getUserReview);
export default router;
