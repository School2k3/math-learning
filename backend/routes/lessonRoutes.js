const express = require('express');
const router = express.Router();
const lessonController = require('../controllers/lessonController');

/**
 * @swagger
 * /api/lessons:
 *   get:
 *     summary: Get all lessons
 *     description: Retrieve a list of all lessons with optional filtering by chapter ID.
 *     parameters:
 *       - in: query
 *         name: chapterId
 *         schema:
 *           type: integer
 *         description: Filter by chapter ID
 *     responses:
 *       200:
 *         description: A list of lessons
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
router.get('/', lessonController.getAllLessons);

/**
 * @swagger
 * /api/lessons/{id}:
 *   get:
 *     summary: Get a lesson by ID
 *     description: Retrieve details about a specific lesson including its chapter information.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Lesson ID
 *     responses:
 *       200:
 *         description: Lesson details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 lesson:
 *                   $ref: '#/components/schemas/Lesson'
 *                   properties:
 *                     chapter:
 *                       $ref: '#/components/schemas/Chapter'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:id', lessonController.getLessonById);

/**
 * @swagger
 * /api/lessons:
 *   post:
 *     summary: Create a new lesson
 *     description: Create a new lesson with the provided information.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - chapterId
 *               - lessonNumber
 *               - title
 *               - contentText
 *             properties:
 *               chapterId:
 *                 type: integer
 *                 description: ID of the chapter this lesson belongs to
 *               lessonNumber:
 *                 type: integer
 *                 description: Lesson sequence number within the chapter
 *               title:
 *                 type: string
 *                 description: Lesson title
 *               contentText:
 *                 type: string
 *                 description: Main content text of the lesson
 *               videoUrl:
 *                 type: string
 *                 description: URL to lesson video (optional)
 *               imageUrl:
 *                 type: string
 *                 description: URL to lesson image (optional)
 *     responses:
 *       201:
 *         description: Lesson created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 lesson:
 *                   $ref: '#/components/schemas/Lesson'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         description: Chapter not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/', lessonController.createLesson);

/**
 * @swagger
 * /api/lessons/{id}:
 *   put:
 *     summary: Update a lesson
 *     description: Update an existing lesson with the provided information.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Lesson ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               chapterId:
 *                 type: integer
 *                 description: ID of the chapter this lesson belongs to
 *               lessonNumber:
 *                 type: integer
 *                 description: Lesson sequence number within the chapter
 *               title:
 *                 type: string
 *                 description: Lesson title
 *               contentText:
 *                 type: string
 *                 description: Main content text of the lesson
 *               videoUrl:
 *                 type: string
 *                 description: URL to lesson video (optional)
 *               imageUrl:
 *                 type: string
 *                 description: URL to lesson image (optional)
 *     responses:
 *       200:
 *         description: Lesson updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 lesson:
 *                   $ref: '#/components/schemas/Lesson'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/:id', lessonController.updateLesson);

/**
 * @swagger
 * /api/lessons/{id}:
 *   delete:
 *     summary: Delete a lesson
 *     description: Delete an existing lesson. Progress history entries with this lesson will have their lessonId set to null.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Lesson ID
 *     responses:
 *       200:
 *         description: Lesson deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete('/:id', lessonController.deleteLesson);

module.exports = router;
