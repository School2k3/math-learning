import express from 'express';
import examController from '../controllers/examController.js';
const router = express.Router();
/**
 * @swagger
 * /api/exams:
 *   get:
 *     summary: Get all exams
 *     tags: [Exams]
 *     description: Retrieve a list of all exams with optional filtering by grade and chapter.
 *     parameters:
 *       - in: query
 *         name: grade
 *         schema:
 *           type: integer
 *         description: Filter by grade level
 *       - in: query
 *         name: chapterId
 *         schema:
 *           type: integer
 *         description: Filter by chapter ID
 *     responses:
 *       200:
 *         description: A list of exams
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exams:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Exam'
 *       500:
 *         description: Server error
 */
router.get('/', examController.getAllExams);
/**
 * @swagger
 * /api/exams/grade/{grade}:
 *   get:
 *     summary: Get exams by grade
 *     tags: [Exams]
 *     description: Retrieve all exams for a specific grade level.
 *     parameters:
 *       - in: path
 *         name: grade
 *         required: true
 *         schema:
 *           type: integer
 *         description: Grade level
 *     responses:
 *       200:
 *         description: List of exams for the specified grade
 *       500:
 *         description: Server error
 */
router.get('/grade/:grade', examController.getExamsByGrade);
/**
 * @swagger
 * /api/exams/chapter/{chapterId}:
 *   get:
 *     summary: Get exams by chapter
 *     tags: [Exams]
 *     description: Retrieve all exams for a specific chapter.
 *     parameters:
 *       - in: path
 *         name: chapterId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Chapter ID
 *     responses:
 *       200:
 *         description: List of exams for the specified chapter
 *       500:
 *         description: Server error
 */
router.get('/chapter/:chapterId', examController.getExamsByChapter);
/**
 * @swagger
 * /api/exams/results/user/{userId}:
 *   get:
 *     summary: Get exam results by user
 *     tags: [Exams]
 *     description: Retrieve all exam results for a specific user.
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: List of exam results for the user
 *       500:
 *         description: Server error
 */
router.get('/results/user/:userId', examController.getExamResultsByUser);
/**
 * @swagger
 * /api/exams/{examId}/results:
 *   get:
 *     summary: Get all exam results by exam ID
 *     tags: [Exams]
 *     description: Retrieve all exam results/attempts for a specific exam.
 *     parameters:
 *       - in: path
 *         name: examId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Exam ID
 *       - in: query
 *         name: includefinished
 *         schema:
 *           type: boolean
 *         description: Include finished exams (default true)
 *       - in: query
 *         name: includeactive
 *         schema:
 *           type: boolean
 *         description: Include active exams (default true)
 *     responses:
 *       200:
 *         description: List of exam results for the specified exam
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 examResults:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ExamResult'
 *                 exam:
 *                   $ref: '#/components/schemas/Exam'
 *                 totalAttempts:
 *                   type: integer
 *                 averageScore:
 *                   type: number
 *                 passRate:
 *                   type: number
 *       404:
 *         description: Exam not found
 *       500:
 *         description: Server error
 */
router.get('/:examId/results', examController.getExamResultsByExamId);
/**
 * @swagger
 * /api/exams/results/{id}:
 *   get:
 *     summary: Get an exam result by ID
 *     tags: [Exams]
 *     description: Retrieve detailed information about a specific exam result.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Exam result ID
 *     responses:
 *       200:
 *         description: Detailed exam result information
 *       404:
 *         description: Exam result not found
 *       500:
 *         description: Server error
 */
router.get('/results/:id', examController.getExamResultById);
/**
 * @swagger
 * /api/exams/{id}:
 *   get:
 *     summary: Get an exam by ID
 *     tags: [Exams]
 *     description: Retrieve a specific exam with its questions and answers.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Exam ID
 *     responses:
 *       200:
 *         description: Exam details with questions and answers
 *       404:
 *         description: Exam not found
 *       500:
 *         description: Server error
 */
router.get('/:id', examController.getExamById);
/**
 * @swagger
 * /api/exams/start:
 *   post:
 *     summary: Start an exam
 *     tags: [Exams]
 *     description: Start a new exam for a user and create an exam result record.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - examId
 *               - userId
 *             properties:
 *               examId:
 *                 type: integer
 *                 description: ID of the exam to start
 *               userId:
 *                 type: integer
 *                 description: ID of the user starting the exam
 *     responses:
 *       201:
 *         description: Exam started successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 examResult:
 *                   $ref: '#/components/schemas/ExamResult'
 *                 totalQuestions:
 *                   type: integer
 *                 durationMinutes:
 *                   type: integer
 *       400:
 *         description: User already has an active exam for this test
 *       404:
 *         description: Exam not found
 *       500:
 *         description: Server error
 */
router.post('/start', examController.startExam);
/**
 * @swagger
 * /api/exams/answer:
 *   post:
 *     summary: Save an exam answer
 *     tags: [Exams]
 *     description: Save or update an answer for a question during the exam.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - resultId
 *               - questionId
 *               - chosenAnswerId
 *             properties:
 *               resultId:
 *                 type: integer
 *                 description: ID of the exam result
 *               questionId:
 *                 type: integer
 *                 description: ID of the question being answered
 *               chosenAnswerId:
 *                 type: integer
 *                 description: ID of the chosen answer
 *               isFlagged:
 *                 type: boolean
 *                 description: Whether the question is flagged for review
 *                 default: false
 *     responses:
 *       200:
 *         description: Answer saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 examAnswer:
 *                   $ref: '#/components/schemas/ExamAnswer'
 *       400:
 *         description: Cannot save answer for completed exam or question does not belong to exam
 *       404:
 *         description: Exam result not found
 *       500:
 *         description: Server error
 */
router.post('/answer', examController.saveExamAnswer);
/**
 * @swagger
 * /api/exams/finish/{resultId}:
 *   post:
 *     summary: Finish an exam
 *     tags: [Exams]
 *     description: Finish an exam, calculate the final score, and update the exam result.
 *     parameters:
 *       - in: path
 *         name: resultId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the exam result to finish
 *     responses:
 *       200:
 *         description: Exam finished successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 examResult:
 *                   $ref: '#/components/schemas/ExamResult'
 *                 score:
 *                   type: number
 *                   description: Final score as percentage
 *                 correctAnswers:
 *                   type: integer
 *                 totalQuestions:
 *                   type: integer
 *                 passed:
 *                   type: boolean
 *                   description: Whether the exam was passed (score >= 60%)
 *       400:
 *         description: Exam already finished
 *       404:
 *         description: Exam result not found
 *       500:
 *         description: Server error
 */
router.post('/finish/:resultId', examController.finishExam);
/**
 * @swagger
 * /api/exams/progress/{resultId}:
 *   get:
 *     summary: Get exam progress
 *     tags: [Exams]
 *     description: Get current progress and time remaining for an active exam.
 *     parameters:
 *       - in: path
 *         name: resultId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the exam result
 *     responses:
 *       200:
 *         description: Current exam progress
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 examResult:
 *                   $ref: '#/components/schemas/ExamResult'
 *                 timeRemaining:
 *                   type: integer
 *                   description: Time remaining in seconds
 *                 answeredQuestions:
 *                   type: integer
 *                 totalQuestions:
 *                   type: integer
 *       400:
 *         description: Exam already finished
 *       404:
 *         description: Exam result not found
 *       500:
 *         description: Server error
 */
router.get('/progress/:resultId', examController.getExamProgress);
/**
 * @swagger
 * /api/exams/active/{userId}:
 *   get:
 *     summary: Get active exam for user
 *     tags: [Exams]
 *     description: Get the currently active exam for a user, if one exists. This enables resuming exams if accidentally navigated away.
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the user
 *     responses:
 *       200:
 *         description: Active exam found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 activeExam:
 *                   $ref: '#/components/schemas/ExamResult'
 *                 timeRemaining:
 *                   type: integer
 *                   description: Time remaining in seconds
 *                 answeredQuestions:
 *                   type: integer
 *                 totalQuestions:
 *                   type: integer
 *       400:
 *         description: Exam time has expired
 *       404:
 *         description: No active exam found for this user
 *       500:
 *         description: Server error
 */
router.get('/active/:userId', examController.getActiveExamForUser);
/**
 * @swagger
 * /api/exams:
 *   post:
 *     summary: Create a new exam
 *     tags: [Exams]
 *     description: Create a new exam with the specified details
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - grade
 *               - durationMinutes
 *             properties:
 *               title:
 *                 type: string
 *                 description: Title of the exam
 *               grade:
 *                 type: integer
 *                 description: Grade level for the exam
 *               chapterId:
 *                 type: integer
 *                 description: ID of the chapter this exam is associated with (optional)
 *               durationMinutes:
 *                 type: integer
 *                 description: Duration of the exam in minutes
 *     responses:
 *       201:
 *         description: Exam created successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Server error
 */
router.post('/', examController.createExam);
/**
 * @swagger
 * /api/exams/{id}:
 *   put:
 *     summary: Update an exam
 *     tags: [Exams]
 *     description: Update an existing exam with new details
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Exam ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: New title for the exam
 *               grade:
 *                 type: integer
 *                 description: New grade level for the exam
 *               chapterId:
 *                 type: integer
 *                 description: New chapter ID for the exam
 *               durationMinutes:
 *                 type: integer
 *                 description: New duration of the exam in minutes
 *     responses:
 *       200:
 *         description: Exam updated successfully
 *       404:
 *         description: Exam not found
 *       500:
 *         description: Server error
 */
router.put('/:id', examController.updateExam);
/**
 * @swagger
 * /api/exams/{id}:
 *   delete:
 *     summary: Delete an exam
 *     tags: [Exams]
 *     description: Delete an exam and all its related questions
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Exam ID
 *     responses:
 *       200:
 *         description: Exam deleted successfully
 *       400:
 *         description: Cannot delete exam with existing results
 *       404:
 *         description: Exam not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', examController.deleteExam);
/**
 * @swagger
 * /api/exams/questions:
 *   post:
 *     summary: Add a question to an exam
 *     tags: [Exams]
 *     description: Associate an existing question with an exam
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - examId
 *               - questionId
 *             properties:
 *               examId:
 *                 type: integer
 *                 description: ID of the exam
 *               questionId:
 *                 type: integer
 *                 description: ID of the question to add
 *     responses:
 *       201:
 *         description: Question added to exam successfully
 *       400:
 *         description: Missing required fields or question already in exam
 *       404:
 *         description: Exam or question not found
 *       500:
 *         description: Server error
 */
router.post('/questions', examController.addQuestionToExam);
/**
 * @swagger
 * /api/exams/questions/multiple:
 *   post:
 *     summary: Add multiple questions to an exam
 *     tags: [Exams]
 *     description: Associate multiple existing questions with an exam in a single request
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - examId
 *               - questionIds
 *             properties:
 *               examId:
 *                 type: integer
 *                 description: ID of the exam
 *               questionIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Array of question IDs to add to the exam
 *                 example: [1, 2, 3, 4, 5]
 *     responses:
 *       201:
 *         description: Questions added to exam successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 addedQuestions:
 *                   type: array
 *                   items:
 *                     type: object
 *                 skippedQuestions:
 *                   type: array
 *                   items:
 *                     type: object
 *                 summary:
 *                   type: object
 *                   properties:
 *                     totalRequested:
 *                       type: integer
 *                     successfullyAdded:
 *                       type: integer
 *                     skipped:
 *                       type: integer
 *       400:
 *         description: Missing required fields or invalid data
 *       404:
 *         description: Exam not found
 *       500:
 *         description: Server error
 */
router.post('/questions/multiple', examController.addMultipleQuestionsToExam);
/**
 * @swagger
 * /api/exams/questions/remove:
 *   post:
 *     summary: Remove a question from an exam
 *     tags: [Exams]
 *     description: Remove the association between a question and an exam using examId and questionId
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - examId
 *               - questionId
 *             properties:
 *               examId:
 *                 type: integer
 *                 description: ID of the exam
 *               questionId:
 *                 type: integer
 *                 description: ID of the question to remove
 *     responses:
 *       200:
 *         description: Question removed from exam successfully
 *       400:
 *         description: Missing required fields
 *       404:
 *         description: Exam, question, or association not found
 *       500:
 *         description: Server error
 */
router.post('/questions/remove', examController.removeQuestionFromExam);
/**
 * @swagger
 * /api/exams/questions/{id}:
 *   delete:
 *     summary: Remove a question from an exam (legacy)
 *     tags: [Exams]
 *     description: Delete the association between a question and an exam using examQuestionId (deprecated - use /questions/remove instead)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ExamQuestion ID
 *     responses:
 *       200:
 *         description: Question removed from exam successfully
 *       404:
 *         description: Exam question not found
 *       500:
 *         description: Server error
 */
router.delete('/questions/:id', examController.removeQuestionFromExamLegacy);
export default router;
