import express from 'express';
import chapterController from '../controllers/chapterController.js';

const router = express.Router();

/**
 * @swagger
 * /api/chapters:
 *   get:
 *     summary: Get all chapters
 *     description: Retrieve a list of all chapters with optional filtering by grade and volume.
 *     parameters:
 *       - in: query
 *         name: grade
 *         schema:
 *           type: integer
 *         description: Filter by grade level (1-5)
 *       - in: query
 *         name: volume
 *         schema:
 *           type: integer
 *         description: Filter by volume (1 or 2)
 *     responses:
 *       200:
 *         description: A list of chapters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 chapters:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Chapter'
 *       500:
 *         description: Server error
 */
router.get('/', chapterController.getAllChapters);

/**
 * @swagger
 * /api/chapters/{id}:
 *   get:
 *     summary: Get a chapter by ID
 *     description: Retrieve details for a specific chapter by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Chapter ID
 *     responses:
 *       200:
 *         description: Chapter details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 chapter:
 *                   $ref: '#/components/schemas/Chapter'
 *       404:
 *         description: Chapter not found
 *       500:
 *         description: Server error
 */
router.get('/:id', chapterController.getChapterById);

/**
 * @swagger
 * /api/chapters/grade/{grade}:
 *   get:
 *     summary: Get chapters by grade
 *     description: Retrieve a list of chapters for a specific grade level.
 *     parameters:
 *       - in: path
 *         name: grade
 *         required: true
 *         schema:
 *           type: integer
 *         description: Grade level (1-5)
 *     responses:
 *       200:
 *         description: A list of chapters for the grade
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 chapters:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Chapter'
 *       500:
 *         description: Server error
 */
router.get('/grade/:grade', chapterController.getChaptersByGrade);

export default router;
