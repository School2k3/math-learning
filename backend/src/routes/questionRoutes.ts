import express from 'express';
import questionController from '../controllers/questionController.js';
import { validateRequest } from '../middleware/validation.js';
import { 
  createQuestionSchema, 
  updateQuestionSchema,
  updateAnswersSchema
} from '../schemas/question.schema.js';
import multer from 'multer';

const router = express.Router();

// Configure multer for Excel file upload
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.mimetype === 'application/vnd.ms-excel') {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files (.xlsx, .xls) are allowed'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

/**
 * @swagger
 * /api/questions:
 *   get:
 *     summary: Get all questions
 *     tags: [Questions]
 *     description: Retrieve a list of all questions with optional filtering by grade, topic, and type.
 *     parameters:
 *       - in: query
 *         name: grade
 *         schema:
 *           type: integer
 *         description: Filter by grade level
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by question type (practice, exam, both)
 *       - in: query
 *         name: answerType
 *         schema:
 *           type: string
 *         description: Filter by answer type (combobox, text, choice)
 *     responses:
 *       200:
 *         description: A list of questions with their answers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 questions:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Question'
 *       500:
 *         description: Server error
 */
router.get('/', questionController.getAllQuestions);

/**
 * @swagger
 * /api/questions/import/template:
 *   get:
 *     summary: Download Excel template for importing questions
 *     tags: [Questions]
 *     description: Download an Excel template file with example questions to use for bulk import.
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [practice, exam]
 *         required: false
 *         description: Type of questions (practice or exam). Defaults to practice.
 *     responses:
 *       200:
 *         description: Excel template file
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       500:
 *         description: Server error
 */
router.get('/import/template', questionController.downloadExcelTemplate);

/**
 * @swagger
 * /api/questions/import/practice:
 *   post:
 *     summary: Import practice questions from Excel file
 *     tags: [Questions]
 *     description: Upload an Excel file to import multiple practice questions at once.
 *     parameters:
 *       - in: query
 *         name: grade
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         required: true
 *         description: Grade level for all questions (1-5)
 *       - in: query
 *         name: lessonId
 *         schema:
 *           type: integer
 *         required: false
 *         description: Lesson ID for all questions (optional)
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Excel file (.xlsx or .xls) containing practice questions
 *     responses:
 *       200:
 *         description: Import completed with results
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
 *                     success:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           row:
 *                             type: integer
 *                           questionId:
 *                             type: integer
 *                           questionText:
 *                             type: string
 *                     failed:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           row:
 *                             type: integer
 *                           error:
 *                             type: string
 *                           data:
 *                             type: object
 *                     total:
 *                       type: integer
 *       400:
 *         description: Bad request - No file uploaded or invalid file
 *       500:
 *         description: Server error
 */
router.post('/import/practice', upload.single('file'), questionController.importPracticeQuestionsFromExcel);

/**
 * @swagger
 * /api/questions/import/exam:
 *   post:
 *     summary: Import exam questions from Excel file
 *     tags: [Questions]
 *     description: Upload an Excel file to import multiple exam questions at once.
 *     parameters:
 *       - in: query
 *         name: grade
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         required: true
 *         description: Grade level for all questions (1-5)
 *       - in: query
 *         name: lessonId
 *         schema:
 *           type: integer
 *         required: false
 *         description: Lesson ID for all questions (optional)
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Excel file (.xlsx or .xls) containing exam questions
 *     responses:
 *       200:
 *         description: Import completed with results
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
 *                     success:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           row:
 *                             type: integer
 *                           questionId:
 *                             type: integer
 *                           questionText:
 *                             type: string
 *                     failed:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           row:
 *                             type: integer
 *                           error:
 *                             type: string
 *                           data:
 *                             type: object
 *                     total:
 *                       type: integer
 *       400:
 *         description: Bad request - No file uploaded or invalid file
 *       500:
 *         description: Server error
 */
router.post('/import/exam', upload.single('file'), questionController.importExamQuestionsFromExcel);

/**
 * @swagger
 * /api/questions/export/practice:
 *   get:
 *     summary: Export practice questions to Excel
 *     tags: [Questions]
 *     description: Export practice questions in import-compatible format with optional filtering.
 *     parameters:
 *       - in: query
 *         name: grade
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         required: false
 *         description: Filter by grade level (1-5)
 *       - in: query
 *         name: lessonId
 *         schema:
 *           type: integer
 *         required: false
 *         description: Filter by lesson ID
 *     responses:
 *       200:
 *         description: Excel file with practice questions
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       500:
 *         description: Server error
 */
router.get('/export/practice', questionController.exportPracticeQuestions);

/**
 * @swagger
 * /api/questions/export/exam:
 *   get:
 *     summary: Export exam questions to Excel
 *     tags: [Questions]
 *     description: Export exam questions in import-compatible format with optional filtering.
 *     parameters:
 *       - in: query
 *         name: grade
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         required: false
 *         description: Filter by grade level (1-5)
 *       - in: query
 *         name: lessonId
 *         schema:
 *           type: integer
 *         required: false
 *         description: Filter by lesson ID
 *     responses:
 *       200:
 *         description: Excel file with exam questions
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       500:
 *         description: Server error
 */
router.get('/export/exam', questionController.exportExamQuestions);

/**
 * @swagger
 * /api/questions/grade/{grade}:
 *   get:
 *     summary: Get questions by grade
 *     tags: [Questions]
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
 * /api/questions/lesson/{lessonId}:
 *   get:
 *     summary: Get questions by lesson
 *     tags: [Questions]
 *     description: Retrieve all questions for a specific lesson.
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Lesson ID
 *     responses:
 *       200:
 *         description: List of questions for the specified lesson
 *       500:
 *         description: Server error
 */
router.get('/lesson/:lessonId', questionController.getQuestionsByLesson);

/**
 * @swagger
 * /api/questions/lesson/{lessonId}/practice:
 *   get:
 *     summary: Get practice questions by lesson
 *     tags: [Questions]
 *     description: Retrieve all practice questions for a specific lesson.
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Lesson ID
 *     responses:
 *       200:
 *         description: List of practice questions for the specified lesson
 *       500:
 *         description: Server error
 */
router.get('/lesson/:lessonId/practice', questionController.getPracticeQuestionsByLesson);

/**
 * @swagger
 * /api/questions/exam/{examId}:
 *   get:
 *     summary: Get questions by exam
 *     tags: [Questions]
 *     description: Retrieve all questions for a specific exam.
 *     parameters:
 *       - in: path
 *         name: examId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Exam ID
 *     responses:
 *       200:
 *         description: List of questions for the specified exam
 *       500:
 *         description: Server error
 */
router.get('/exam/:examId', questionController.getQuestionsByExamId);

/**
 * @swagger
 * /api/questions/{id}:
 *   get:
 *     summary: Get a question by ID
 *     tags: [Questions]
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 question:
 *                   $ref: '#/components/schemas/Question'
 *       404:
 *         description: Question not found
 *       500:
 *         description: Server error
 */
router.get('/:id', questionController.getQuestionById);

// /**
//  * @swagger
//  * /api/questions/{id}/audio:
//  *   get:
//  *     summary: Get audio for a question
//  *     tags: [Questions]
//  *     description: Retrieve the audio URL for a specific question by ID.
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: integer
//  *         description: Question ID
//  *     responses:
//  *       200:
//  *         description: Question audio URL
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 id:
//  *                   type: integer
//  *                 audioUrl:
//  *                   type: string
//  *       404:
//  *         description: Question not found or audio not available
//  *       500:
//  *         description: Server error
//  */
// router.get('/:id/audio', questionController.getQuestionAudio);

/**
 * @swagger
 * /api/questions/{id}/audio:
 *   get:
 *     summary: Get audio for a question
 *     tags: [Questions]
 *     description: Retrieve the audio URL for a specific question by ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Question ID
 *     responses:
 *       200:
 *         description: Question audio URL
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 audioUrl:
 *                   type: string
 *       404:
 *         description: Question not found or audio not available
 *       500:
 *         description: Server error
 */
router.get('/:id/audio', questionController.getQuestionAudio);

/**
 * @swagger
 * /api/questions/{id}/audio/generate:
 *   post:
 *     summary: Generate audio for a question
 *     tags: [Questions]
 *     description: >
 *       Synthesize question text and answers into audio using Gemini TTS, 
 *       upload to Cloudinary và lưu URL vào trường audioUrl của Question.  
 *       Dùng query param `force=true` nếu muốn generate lại kể cả khi đã có audio.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Question ID
 *       - in: query
 *         name: force
 *         schema:
 *           type: boolean
 *         description: Force regeneration even if audio already exists
 *     responses:
 *       200:
 *         description: Audio URL generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 audioUrl:
 *                   type: string
 *                 cached:
 *                   type: boolean
 *                 mimeType:
 *                   type: string
 *       400:
 *         description: Question missing answers or invalid state
 *       404:
 *         description: Question not found
 *       500:
 *         description: Server error
 */
router.post('/:id/audio/generate', questionController.generateQuestionAudio);

/**
 * @swagger
 * /api/questions:
 *   post:
 *     summary: Create a new question with answers
 *     tags: [Questions]
 *     description: Create a new question with associated answers.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - questionText
 *               - grade
 *               - type
 *               - answers
 *             properties:
 *               questionText:
 *                 type: string
 *                 description: Text of the question
 *               imageUrl:
 *                 type: string
 *                 nullable: true
 *                 description: URL to the question image
 *               audioUrl:
 *                 type: string
 *                 nullable: true
 *                 description: URL to the question audio
 *               explanationText:
 *                 type: string
 *                 nullable: true
 *                 description: Text explaining the answer
 *               explanationImg:
 *                 type: string
 *                 nullable: true
 *                 description: URL to explanation image
 *               grade:
 *                 type: integer
 *                 description: Grade level (1-5)
 *               type:
 *                 type: string
 *                 enum: [practice, exam]
 *                 description: Question type
 *               answerType:
 *                 type: string
 *                 nullable: true
 *                 enum: [combobox, text, choice]
 *                 description: Type of answer mechanism
 *               lessonId:
 *                 type: integer
 *                 nullable: true
 *                 description: ID of the related lesson
 *               answers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - answerText
 *                     - isCorrect
 *                   properties:
 *                     answerText:
 *                       type: string
 *                       description: Text of the answer
 *                     isCorrect:
 *                       type: boolean
 *                       description: Whether this is the correct answer
 *     responses:
 *       201:
 *         description: Question created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post('/', validateRequest(createQuestionSchema), questionController.createQuestion);

/**
 * @swagger
 * /api/questions/{id}:
 *   put:
 *     summary: Update a question
 *     tags: [Questions]
 *     description: Update an existing question by ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Question ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               questionText:
 *                 type: string
 *                 description: Text of the question
 *               imageUrl:
 *                 type: string
 *                 nullable: true
 *                 description: URL to the question image
 *               audioUrl:
 *                 type: string
 *                 nullable: true
 *                 description: URL to the question audio
 *               explanationText:
 *                 type: string
 *                 nullable: true
 *                 description: Text explaining the answer
 *               explanationImg:
 *                 type: string
 *                 nullable: true
 *                 description: URL to explanation image
 *               grade:
 *                 type: integer
 *                 description: Grade level (1-5)
 *               type:
 *                 type: string
 *                 enum: [practice, exam]
 *                 description: Question type
 *               answerType:
 *                 type: string
 *                 nullable: true
 *                 enum: [combobox, text, choice]
 *                 description: Type of answer mechanism
 *               lessonId:
 *                 type: integer
 *                 nullable: true
 *                 description: ID of the related lesson
 *     responses:
 *       200:
 *         description: Question updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Question not found
 *       500:
 *         description: Server error
 */
router.put('/:id', validateRequest(updateQuestionSchema), questionController.updateQuestion);

/**
 * @swagger
 * /api/questions/{id}/answers:
 *   put:
 *     summary: Update answers for a question
 *     tags: [Questions]
 *     description: Update, add, or delete answers for an existing question.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Question ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: Answer ID (required for updating existing answers)
 *                 answerText:
 *                   type: string
 *                   description: Text of the answer
 *                 isCorrect:
 *                   type: boolean
 *                   description: Whether this is the correct answer
 *                 _delete:
 *                   type: boolean
 *                   description: Set to true to delete this answer
 *     responses:
 *       200:
 *         description: Answers updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Question not found
 *       500:
 *         description: Server error
 */
router.put('/:id/answers', validateRequest(updateAnswersSchema), questionController.updateQuestionAnswers);

/**
 * @swagger
 * /api/questions/{id}:
 *   delete:
 *     summary: Delete a question
 *     tags: [Questions]
 *     description: Delete an existing question by ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Question ID
 *     responses:
 *       200:
 *         description: Question deleted successfully
 *       400:
 *         description: Cannot delete question with existing practice or exam answers
 *       404:
 *         description: Question not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', questionController.deleteQuestion);

export default router;
