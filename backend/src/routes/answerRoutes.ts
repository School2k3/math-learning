import express from 'express';
import answerController from '../controllers/answerController.js';
import { validateRequest } from '../middleware/validation.js';
import { 
  createAnswerSchema,
  updateAnswerSchema,
  createMultipleAnswersSchema
} from '../schemas/answer.schema.js';

const router = express.Router();

/**
 * @swagger
 * /api/answers/question/{questionId}:
 *   get:
 *     summary: Get all answers for a question
 *     description: Retrieve all answers for a specific question ID.
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Question ID
 *     responses:
 *       200:
 *         description: List of answers for the question
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 answers:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Answer'
 *       500:
 *         description: Server error
 */
router.get('/question/:questionId', answerController.getAnswersByQuestionId);

/**
 * @swagger
 * /api/answers/{id}:
 *   get:
 *     summary: Get an answer by ID
 *     description: Retrieve an answer by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Answer ID
 *     responses:
 *       200:
 *         description: Answer details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 answer:
 *                   $ref: '#/components/schemas/Answer'
 *       404:
 *         description: Answer not found
 *       500:
 *         description: Server error
 */
router.get('/:id', answerController.getAnswerById);

/**
 * @swagger
 * /api/answers/correct/{questionId}:
 *   get:
 *     summary: Get all correct answers for a question
 *     description: Retrieve all answers marked as correct for a specific question.
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Question ID
 *     responses:
 *       200:
 *         description: List of correct answers for the question
 *       500:
 *         description: Server error
 */
router.get('/correct/:questionId', answerController.getCorrectAnswers);

/**
 * @swagger
 * /api/answers:
 *   post:
 *     summary: Create a new answer
 *     description: Create a new answer for a specific question.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - questionId
 *               - answerText
 *               - isCorrect
 *             properties:
 *               questionId:
 *                 type: integer
 *                 description: ID of the question this answer belongs to
 *               answerText:
 *                 type: string
 *                 description: Text of the answer
 *               isCorrect:
 *                 type: boolean
 *                 description: Whether this is the correct answer
 *     responses:
 *       201:
 *         description: Answer created successfully
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
 *                   $ref: '#/components/schemas/Answer'
 *       400:
 *         description: Validation error or question not found
 *       500:
 *         description: Server error
 */
router.post('/', validateRequest(createAnswerSchema), answerController.createAnswer);

/**
 * @swagger
 * /api/answers/batch:
 *   post:
 *     summary: Create multiple answers
 *     description: Create multiple answers at once.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               required:
 *                 - questionId
 *                 - answerText
 *                 - isCorrect
 *               properties:
 *                 questionId:
 *                   type: integer
 *                   description: ID of the question this answer belongs to
 *                 answerText:
 *                   type: string
 *                   description: Text of the answer
 *                 isCorrect:
 *                   type: boolean
 *                   description: Whether this is the correct answer
 *     responses:
 *       201:
 *         description: Answers created successfully
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
 *                     answers:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Answer'
 *       400:
 *         description: Validation error or one or more questions not found
 *       500:
 *         description: Server error
 */
router.post('/batch', validateRequest(createMultipleAnswersSchema), answerController.createMultipleAnswers);

/**
 * @swagger
 * /api/answers/{id}:
 *   put:
 *     summary: Update an answer
 *     description: Update an existing answer by ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Answer ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               answerText:
 *                 type: string
 *                 description: Text of the answer
 *               isCorrect:
 *                 type: boolean
 *                 description: Whether this is the correct answer
 *     responses:
 *       200:
 *         description: Answer updated successfully
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
 *                   $ref: '#/components/schemas/Answer'
 *       400:
 *         description: Validation error or cannot change correctness of answers used in practice or exams
 *       404:
 *         description: Answer not found
 *       500:
 *         description: Server error
 */
router.put('/:id', validateRequest(updateAnswerSchema), answerController.updateAnswer);

/**
 * @swagger
 * /api/answers/{id}:
 *   delete:
 *     summary: Delete an answer
 *     description: Delete an existing answer by ID. Cannot delete answers used in practice or exams, the only answer for a question, or the only correct answer.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Answer ID
 *     responses:
 *       200:
 *         description: Answer deleted successfully
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
 *         description: Cannot delete the only answer, only correct answer, or answers used in practice or exams
 *       404:
 *         description: Answer not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', answerController.deleteAnswer);

export default router;
