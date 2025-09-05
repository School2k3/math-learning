const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');

/**
 * @swagger
 * /api/questions:
 *   get:
 *     summary: Get all questions
 *     description: Retrieve a list of all questions with optional filtering by grade, topic, and type.
 *     parameters:
 *       - in: query
 *         name: grade
 *         schema:
 *           type: integer
 *         description: Filter by grade level
 *       - in: query
 *         name: topic
 *         schema:
 *           type: string
 *         description: Filter by topic
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by question type (practice, exam, both)
 *     responses:
 *       200:
 *         description: A list of questions with their answers
 *       500:
 *         description: Server error
 */
router.get('/', questionController.getAllQuestions);

/**
 * @swagger
 * /api/questions/{id}:
 *   get:
 *     summary: Get a question by ID
 *     description: Retrieve a question and its answers by question ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Question ID
 *     responses:
 *       200:
 *         description: Question details with answers
 *       404:
 *         description: Question not found
 *       500:
 *         description: Server error
 */
router.get('/:id', questionController.getQuestionById);

/**
 * @swagger
 * /api/questions/grade/{grade}:
 *   get:
 *     summary: Get questions by grade
 *     description: Retrieve all questions for a specific grade level.
 *     parameters:
 *       - in: path
 *         name: grade
 *         required: true
 *         schema:
 *           type: integer
 *         description: Grade level
 *     responses:
 *       200:
 *         description: List of questions for the specified grade
 *       500:
 *         description: Server error
 */
router.get('/grade/:grade', questionController.getQuestionsByGrade);

/**
 * @swagger
 * /api/questions/topic/{topic}:
 *   get:
 *     summary: Get questions by topic
 *     description: Retrieve all questions for a specific topic.
 *     parameters:
 *       - in: path
 *         name: topic
 *         required: true
 *         schema:
 *           type: string
 *         description: Topic name
 *     responses:
 *       200:
 *         description: List of questions for the specified topic
 *       500:
 *         description: Server error
 */
router.get('/topic/:topic', questionController.getQuestionsByTopic);

module.exports = router;
