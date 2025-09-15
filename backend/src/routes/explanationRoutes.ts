import express from 'express';
import explanationController from '../controllers/explanationController.js';

const router = express.Router();

/**
 * @swagger
 * /api/explanations:
 *   get:
 *     summary: Get all explanations
 *     description: Retrieve a list of all explanations with their related questions.
 *     responses:
 *       200:
 *         description: A list of explanations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 explanations:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Explanation'
 *       500:
 *         description: Server error
 */
router.get('/', explanationController.getAllExplanations);

/**
 * @swagger
 * /api/explanations/search:
 *   get:
 *     summary: Search explanations
 *     description: Search explanations by content text.
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Search term for explanation content
 *     responses:
 *       200:
 *         description: List of explanations matching the search query
 *       400:
 *         description: Missing search query
 *       500:
 *         description: Server error
 */
router.get('/search', explanationController.searchExplanations);

/**
 * @swagger
 * /api/explanations/question/{questionId}:
 *   get:
 *     summary: Get explanations by question
 *     description: Retrieve all explanations for a specific question ID.
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Question ID
 *     responses:
 *       200:
 *         description: List of explanations for the question
 *       500:
 *         description: Server error
 */
router.get('/question/:questionId', explanationController.getExplanationsByQuestionId);

/**
 * @swagger
 * /api/explanations/grade/{grade}:
 *   get:
 *     summary: Get explanations by grade
 *     description: Retrieve all explanations for questions of a specific grade level.
 *     parameters:
 *       - in: path
 *         name: grade
 *         required: true
 *         schema:
 *           type: integer
 *         description: Grade level
 *     responses:
 *       200:
 *         description: List of explanations for the specified grade
 *       500:
 *         description: Server error
 */
router.get('/grade/:grade', explanationController.getExplanationsByGrade);

/**
 * @swagger
 * /api/explanations/lesson/{lessonId}:
 *   get:
 *     summary: Get explanations by lesson
 *     description: Retrieve all explanations for questions in a specific lesson.
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Lesson ID
 *     responses:
 *       200:
 *         description: List of explanations for the specified lesson
 *       500:
 *         description: Server error
 */
router.get('/lesson/:lessonId', explanationController.getExplanationsByLessonId);

/**
 * @swagger
 * /api/explanations/{id}:
 *   get:
 *     summary: Get an explanation by ID
 *     description: Retrieve an explanation by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Explanation ID
 *     responses:
 *       200:
 *         description: Explanation details with related question
 *       404:
 *         description: Explanation not found
 *       500:
 *         description: Server error
 */
router.get('/:id', explanationController.getExplanationById);

export default router;