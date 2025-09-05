const express = require('express');
const router = express.Router();
const answerController = require('../controllers/answerController');

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

module.exports = router;
