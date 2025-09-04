const express = require('express');
const router = express.Router();
const chapterController = require('../controllers/chapterController');

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
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/', chapterController.getAllChapters);

/**
 * @swagger
 * /api/chapters/{id}:
 *   get:
 *     summary: Get a chapter by ID
 *     description: Retrieve details about a specific chapter including its lessons.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
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
 *                   properties:
 *                     lessons:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Lesson'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:id', chapterController.getChapterById);

/**
 * @swagger
 * /api/chapters:
 *   post:
 *     summary: Create a new chapter
 *     description: Create a new chapter with the provided information.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - grade
 *               - volume
 *               - chapterNumber
 *               - title
 *             properties:
 *               grade:
 *                 type: integer
 *                 description: Grade level (1-5)
 *               volume:
 *                 type: integer
 *                 description: Book volume (1 or 2)
 *               chapterNumber:
 *                 type: integer
 *                 description: Chapter sequence number
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
 *                 message:
 *                   type: string
 *                 chapter:
 *                   $ref: '#/components/schemas/Chapter'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/', chapterController.createChapter);

/**
 * @swagger
 * /api/chapters/{id}:
 *   put:
 *     summary: Update a chapter
 *     description: Update an existing chapter with the provided information.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Chapter ID
 *     requestBody:
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
 *                 description: Book volume (1 or 2)
 *               chapterNumber:
 *                 type: integer
 *                 description: Chapter sequence number
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
 *                 message:
 *                   type: string
 *                 chapter:
 *                   $ref: '#/components/schemas/Chapter'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/:id', chapterController.updateChapter);

/**
 * @swagger
 * /api/chapters/{id}:
 *   delete:
 *     summary: Delete a chapter
 *     description: Delete an existing chapter. Cannot delete chapters with associated lessons.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Chapter ID
 *     responses:
 *       200:
 *         description: Chapter deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete('/:id', chapterController.deleteChapter);

/**
 * @swagger
 * /api/chapters/{chapterId}/lessons:
 *   get:
 *     summary: Get lessons for a chapter
 *     description: Retrieve all lessons for a specific chapter.
 *     parameters:
 *       - in: path
 *         name: chapterId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Chapter ID
 *     responses:
 *       200:
 *         description: A list of lessons for the chapter
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 lessons:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Lesson'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:chapterId/lessons', chapterController.getChapterLessons);

module.exports = router;
