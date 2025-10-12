import express from 'express';
import lessonController from '../controllers/lessonController.js';
import { validateRequest } from '../middleware/validation.js';
import { 
  createLessonSchema, 
  updateLessonSchema, 
  lessonIdSchema,
  chapterIdParamSchema,
  lessonQuerySchema
} from '../schemas/lesson.schema.js';

const router = express.Router();

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
 *         description: Server error
 */
router.get('/', lessonController.getAllLessons);

/**
 * @swagger
 * /api/lessons/{id}:
 *   get:
 *     summary: Get a lesson by ID
 *     description: Retrieve details for a specific lesson by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
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
 *       404:
 *         description: Lesson not found
 *       500:
 *         description: Server error
 */
router.get('/:id', lessonController.getLessonById);

/**
 * @swagger
 * /api/lessons/chapter/{chapterId}:
 *   get:
 *     summary: Get lessons by chapter
 *     description: Retrieve a list of lessons for a specific chapter.
 *     parameters:
 *       - in: path
 *         name: chapterId
 *         required: true
 *         schema:
 *           type: integer
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
 *         description: Server error
 */
router.get('/chapter/:chapterId', lessonController.getLessonsByChapter);

/**
 * @swagger
 * /api/lessons:
 *   post:
 *     summary: Create a new lesson
 *     description: Create a new lesson with the provided data.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - chapterId
 *               - title
 *             properties:
 *               chapterId:
 *                 type: integer
 *                 description: ID of the chapter this lesson belongs to
 *               title:
 *                 type: string
 *                 description: Lesson title
 *               videoUrl:
 *                 type: string
 *                 nullable: true
 *                 description: URL to the lesson video
 *               imageUrl:
 *                 type: string
 *                 nullable: true
 *                 description: URL to the lesson image
 *     responses:
 *       201:
 *         description: Lesson created successfully
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
 *                   $ref: '#/components/schemas/Lesson'
 *       400:
 *         description: Validation error or chapter not found
 *       500:
 *         description: Server error
 */
router.post('/', validateRequest(createLessonSchema), lessonController.createLesson);

/**
 * @swagger
 * /api/lessons/{id}:
 *   put:
 *     summary: Update a lesson
 *     description: Update an existing lesson by ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Lesson ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               chapterId:
 *                 type: integer
 *                 description: ID of the chapter this lesson belongs to
 *               title:
 *                 type: string
 *                 description: Lesson title
 *               videoUrl:
 *                 type: string
 *                 nullable: true
 *                 description: URL to the lesson video
 *               imageUrl:
 *                 type: string
 *                 nullable: true
 *                 description: URL to the lesson image
 *     responses:
 *       200:
 *         description: Lesson updated successfully
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
 *                   $ref: '#/components/schemas/Lesson'
 *       400:
 *         description: Validation error or chapter not found
 *       404:
 *         description: Lesson not found
 *       500:
 *         description: Server error
 */
router.put('/:id', validateRequest(lessonIdSchema, 'params'), validateRequest(updateLessonSchema), lessonController.updateLesson);

/**
 * @swagger
 * /api/lessons/{id}:
 *   delete:
 *     summary: Delete a lesson
 *     description: Delete an existing lesson by ID. Only lessons with no questions can be deleted.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Lesson ID
 *     responses:
 *       200:
 *         description: Lesson deleted successfully
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
 *         description: Cannot delete lesson with existing questions
 *       404:
 *         description: Lesson not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', lessonController.deleteLesson);

export default router;
