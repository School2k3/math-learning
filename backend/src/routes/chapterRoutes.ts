import express from 'express';
import chapterController from '../controllers/chapterController.js';
import { validateRequest } from '../middleware/validation.js';
import { 
  createChapterSchema, 
  updateChapterSchema, 
  chapterIdSchema,
  chapterQuerySchema
} from '../schemas/chapter.schema.js';

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

/**
 * @swagger
 * /api/chapters:
 *   post:
 *     summary: Create a new chapter
 *     description: Create a new chapter with the provided data.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - grade
 *               - volume
 *               - title
 *             properties:
 *               grade:
 *                 type: integer
 *                 description: Grade level (1-5)
 *               volume:
 *                 type: integer
 *                 description: Volume number (1 or 2)
 *               title:
 *                 type: string
 *                 description: Chapter title
 *     responses:
 *       201:
 *         description: Chapter created successfully
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
 *                   $ref: '#/components/schemas/Chapter'
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post('/', validateRequest(createChapterSchema), chapterController.createChapter);

/**
 * @swagger
 * /api/chapters/{id}:
 *   put:
 *     summary: Update a chapter
 *     description: Update an existing chapter by ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Chapter ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               grade:
 *                 type: integer
 *                 description: Grade level (1-5)
 *               volume:
 *                 type: integer
 *                 description: Volume number (1 or 2)
 *               title:
 *                 type: string
 *                 description: Chapter title
 *     responses:
 *       200:
 *         description: Chapter updated successfully
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
 *                   $ref: '#/components/schemas/Chapter'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Chapter not found
 *       500:
 *         description: Server error
 */
router.put('/:id', validateRequest(updateChapterSchema), chapterController.updateChapter);

/**
 * @swagger
 * /api/chapters/{id}:
 *   delete:
 *     summary: Delete a chapter
 *     description: Delete an existing chapter by ID. Only chapters with no lessons can be deleted.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Chapter ID
 *     responses:
 *       200:
 *         description: Chapter deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Cannot delete chapter with existing lessons
 *       404:
 *         description: Chapter not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', chapterController.deleteChapter);

export default router;
