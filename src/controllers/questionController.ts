import prisma from '../prisma/prisma.js';
import { Request, Response } from 'express';
import { Controller, RequestWithQuery, QuestionQuery } from '../types/index.js';
import { 
  sendSuccessResponse, 
  sendSuccessNoDataResponse, 
  sendNotFoundResponse, 
  sendErrorResponse,
  sendBadRequestResponse
} from '../utils/apiResponse.js';
import { CreateQuestionInput, UpdateQuestionInput, UpdateAnswersInput } from '../schemas/question.schema.js';
import { synthesizeQuestionAudio } from '../services/questionAudioService.js';
import * as XLSX from 'xlsx';
import multer from 'multer';

function buildQuestionTtsPrompt(question: any) {
  const questionText =
    question.questionText ||
    question.question_text ||
    question.text ||
    '';

  const answers = (question.answers || []).map((a: any, index: number) => {
    const answerText =
      a.answerText ||
      a.answer_text ||
      a.text ||
      '';

    return `Đáp án ${index + 1}: ${answerText}`;
  });

  const lines = [
    `Hãy đọc rõ ràng, chậm rãi như giáo viên tiểu học.`,
    `Câu hỏi: ${questionText}`,
    ...answers,
  ];

  return lines.join('\n');
}


const questionController: Controller = {
  // Get all questions with optional filtering
  getAllQuestions: async (req: RequestWithQuery<QuestionQuery>, res: Response): Promise<void> => {
    try {
      const { grade, type, answerType, lessonId } = req.query;
      
      const whereClause: {
        grade?: number;
        type?: string;
        answerType?: string;
        lessonId?: number;
      } = {};
      
      if (grade) {
        whereClause.grade = parseInt(grade);
      }
      
      if (type) {
        whereClause.type = type;
      }
      
      if (answerType) {
        whereClause.answerType = answerType;
      }
      
      if (lessonId) {
        whereClause.lessonId = parseInt(lessonId);
      }
      
      const questions = await prisma.question.findMany({
        where: whereClause,
        orderBy: [
          { grade: 'asc' },
          { createdAt: 'desc' },
        ],
        include: {
          answers: true, // Include associated answers
          lesson: true, // Include associated lesson
        },
      });
      
      sendSuccessResponse(res, { questions }, 'Questions retrieved successfully');
    } catch (error) {
      console.error('Error getting questions:', error);
      sendErrorResponse(res, 'Error retrieving questions');
    }
  },
  
  // Get a specific question by ID
  getQuestionById: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      const question = await prisma.question.findUnique({
        where: { id: parseInt(id) },
        include: {
          answers: true, // Include associated answers
          lesson: true, // Include associated lesson
        },
      });
      
      if (!question) {
        sendNotFoundResponse(res, 'Question not found');
        return;
      }
      
      sendSuccessResponse(res, { question }, 'Question retrieved successfully');
    } catch (error) {
      console.error('Error getting question:', error);
      sendErrorResponse(res, 'Error retrieving question');
    }
  },
  
  // Get questions by grade
  getQuestionsByGrade: async (req: Request, res: Response): Promise<void> => {
    try {
      const { grade } = req.params;
      
      const questions = await prisma.question.findMany({
        where: { grade: parseInt(grade) },
        include: {
          answers: true, // Include associated answers
          lesson: true, // Include associated lesson
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      
      sendSuccessResponse(res, { questions }, 'Questions retrieved successfully');
    } catch (error) {
      console.error('Error getting questions by grade:', error);
      sendErrorResponse(res, 'Error retrieving questions');
    }
  },

  // Get questions by lesson
  getQuestionsByLesson: async (req: Request, res: Response): Promise<void> => {
    try {
      const { lessonId } = req.params;
      
      const questions = await prisma.question.findMany({
        where: { 
          lessonId: parseInt(lessonId)
        },
        include: {
          answers: true, // Include associated answers
          lesson: true, // Include associated lesson
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      
      sendSuccessResponse(res, { questions }, 'Questions retrieved successfully');
    } catch (error) {
      console.error('Error getting questions by lesson:', error);
      sendErrorResponse(res, 'Error retrieving questions');
    }
  },

  // Get questions by exam
  getQuestionsByExamId: async (req: Request, res: Response): Promise<void> => {
    try {
      const { examId } = req.params;
      
      // Find all questions associated with the specified exam through the join table
      const examQuestions = await prisma.examQuestion.findMany({
        where: { 
          examId: parseInt(examId)
        },
        include: {
          question: {
            include: {
              answers: true, // Include answers for each question
              lesson: true, // Include associated lesson
            }
          }
        },
      });
      
      // Extract just the questions from the results
      const questions = examQuestions.map(eq => eq.question);
      
      sendSuccessResponse(res, { questions }, 'Exam questions retrieved successfully');
    } catch (error) {
      console.error('Error getting questions by exam:', error);
      sendErrorResponse(res, 'Error retrieving exam questions');
    }
  },
  
  // Get practice questions by lesson
  getPracticeQuestionsByLesson: async (req: Request, res: Response): Promise<void> => {
    try {
      const { lessonId } = req.params;
      
      const questions = await prisma.question.findMany({
        where: { 
          lessonId: parseInt(lessonId),
          type: 'practice' // Only get practice questions
        },
        include: {
          answers: true, // Include associated answers
          lesson: true, // Include associated lesson
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      
      sendSuccessResponse(res, { questions }, 'Practice questions retrieved successfully');
    } catch (error) {
      console.error('Error getting practice questions by lesson:', error);
      sendErrorResponse(res, 'Error retrieving practice questions');
    }
  },

  // Get audio by question ID
  getQuestionAudio: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      const question = await prisma.question.findUnique({
        where: { id: parseInt(id) },
        select: { 
          id: true,
          audioUrl: true,
        },
      });
      
      if (!question) {
        sendNotFoundResponse(res, 'Question not found');
        return;
      }
      
      if (!question.audioUrl) {
        sendNotFoundResponse(res, 'Audio not found for this question');
        return;
      }
      
      sendSuccessResponse(res, { 
        id: question.id,
        audioUrl: question.audioUrl 
      }, 'Question audio retrieved successfully');
    } catch (error) {
      console.error('Error getting question audio:', error);
      sendErrorResponse(res, 'Error retrieving question audio');
    }
  },

  // Generate or refresh question audio
generateQuestionAudio: async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const force = req.query.force === 'true';
    const questionId = parseInt(id, 10);

    if (isNaN(questionId)) {
      sendBadRequestResponse(res, 'Invalid question ID');
      return;
    }

    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        answers: {
          orderBy: { id: 'asc' },
        },
      },
    });

    if (!question) {
      sendNotFoundResponse(res, 'Question not found');
      return;
    }

    // Nếu đã có audioUrl và không có ?force=true thì không generate lại
    if (!force && question.audioUrl) {
      sendSuccessResponse(
        res,
        { id: question.id, audioUrl: question.audioUrl, cached: true },
        'Question audio already exists'
      );
      return;
    }

    if (!question.answers.length) {
      sendBadRequestResponse(
        res,
        'Question must have answers before generating audio'
      );
      return;
    }

    const audioResult = await synthesizeQuestionAudio({
      questionId: question.id,
      questionText: question.questionText,
      answers: question.answers.map((answer) => ({
        answerText: answer.answerText,
      })),
    });

    const updatedQuestion = await prisma.question.update({
      where: { id: questionId },
      data: { audioUrl: audioResult.audioUrl },
      select: {
        id: true,
        audioUrl: true,
      },
    });

    sendSuccessResponse(
      res,
      {
        ...updatedQuestion,
        cached: false,
        mimeType: audioResult.mimeType,
      },
      'Question audio generated successfully'
    );
  } catch (error) {
    console.error('Error generating question audio:', error);
    sendErrorResponse(res, 'Failed to generate question audio');
  }
},

  // Create a new question with answers
  createQuestion: async (req: Request, res: Response): Promise<void> => {
    try {
      const questionData: CreateQuestionInput = req.body;
      const { answers, ...questionDetails } = questionData;

      // Check if lesson exists if lessonId is provided
      if (questionDetails.lessonId) {
        const lesson = await prisma.lesson.findUnique({
          where: { id: questionDetails.lessonId }
        });

        if (!lesson) {
          sendBadRequestResponse(res, `Lesson with ID ${questionDetails.lessonId} not found`);
          return;
        }
      }

      // Create question with nested answers in a transaction
      const question = await prisma.$transaction(async (tx) => {
        // Prepare data object for question creation
        const createData: any = {
          questionText: questionDetails.questionText,
          imageUrl: questionDetails.imageUrl,
          audioUrl: questionDetails.audioUrl,
          explanationText: questionDetails.explanationText,
          explanationImg: questionDetails.explanationImg,
          grade: questionDetails.grade,
          type: questionDetails.type
        };
        
        // Add optional fields if they exist
        if (questionDetails.answerType !== undefined) {
          createData.answerType = questionDetails.answerType;
        }
        
        if (questionDetails.lessonId !== undefined) {
          createData.lessonId = questionDetails.lessonId;
        }
        
        // Create the question first
        const newQuestion = await tx.question.create({
          data: createData
        });

        // Create associated answers
        const createdAnswers = await Promise.all(
          answers.map(answer => 
            tx.answer.create({
              data: {
                ...answer,
                questionId: newQuestion.id
              }
            })
          )
        );

        // Return the question with its answers
        return {
          ...newQuestion,
          answers: createdAnswers
        };
      });

      sendSuccessResponse(res, { question }, 'Question created successfully', 201);
    } catch (error) {
      console.error('Error creating question:', error);
      sendErrorResponse(res, 'Failed to create question');
    }
  },

  // Update an existing question
  updateQuestion: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const questionId = parseInt(id);
      const questionData: UpdateQuestionInput = req.body;

      // Check if question exists
      const existingQuestion = await prisma.question.findUnique({
        where: { id: questionId }
      });

      if (!existingQuestion) {
        sendNotFoundResponse(res, 'Question not found');
        return;
      }

      // Check if lesson exists if lessonId is provided
      if (questionData.lessonId) {
        const lesson = await prisma.lesson.findUnique({
          where: { id: questionData.lessonId }
        });

        if (!lesson) {
          sendBadRequestResponse(res, `Lesson with ID ${questionData.lessonId} not found`);
          return;
        }
      }

      // Prepare update data object
      const updateData: any = {};
      
      // Add fields only if they are defined in the update payload
      if (questionData.questionText !== undefined) updateData.questionText = questionData.questionText;
      if (questionData.imageUrl !== undefined) updateData.imageUrl = questionData.imageUrl;
      if (questionData.audioUrl !== undefined) updateData.audioUrl = questionData.audioUrl;
      if (questionData.explanationText !== undefined) updateData.explanationText = questionData.explanationText;
      if (questionData.explanationImg !== undefined) updateData.explanationImg = questionData.explanationImg;
      if (questionData.grade !== undefined) updateData.grade = questionData.grade;
      if (questionData.type !== undefined) updateData.type = questionData.type;
      if (questionData.answerType !== undefined) updateData.answerType = questionData.answerType;
      if (questionData.lessonId !== undefined) updateData.lessonId = questionData.lessonId;
      
      // Update the question
      const updatedQuestion = await prisma.question.update({
        where: { id: questionId },
        data: updateData,
        include: {
          answers: true,
          lesson: true
        }
      });

      sendSuccessResponse(res, { question: updatedQuestion }, 'Question updated successfully');
    } catch (error) {
      console.error('Error updating question:', error);
      sendErrorResponse(res, 'Failed to update question');
    }
  },

  // Update answers for a question
  updateQuestionAnswers: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const questionId = parseInt(id);
      const answersData: UpdateAnswersInput = req.body;

      // Check if question exists
      const existingQuestion = await prisma.question.findUnique({
        where: { id: questionId },
        include: { answers: true }
      });

      if (!existingQuestion) {
        sendNotFoundResponse(res, 'Question not found');
        return;
      }

      // Process answers in a transaction
      await prisma.$transaction(async (tx) => {
        // Process each answer
        for (const answerData of answersData) {
          const { id: answerId, _delete, ...answerDetails } = answerData;

          if (_delete && answerId) {
            // Delete existing answer
            await tx.answer.delete({ where: { id: answerId } });
          } else if (answerId) {
            // Update existing answer
            await tx.answer.update({
              where: { id: answerId },
              data: answerDetails
            });
          } else {
            // Create new answer
            await tx.answer.create({
              data: {
                ...answerDetails,
                questionId
              }
            });
          }
        }
      });

      // Fetch updated question with answers
      const updatedQuestion = await prisma.question.findUnique({
        where: { id: questionId },
        include: {
          answers: true,
          lesson: true
        }
      });

      sendSuccessResponse(res, { question: updatedQuestion }, 'Question answers updated successfully');
    } catch (error) {
      console.error('Error updating question answers:', error);
      sendErrorResponse(res, 'Failed to update question answers');
    }
  },

  // Delete a question
  deleteQuestion: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const questionId = parseInt(id);

      // Check if question exists
      const question = await prisma.question.findUnique({
        where: { id: questionId },
        include: {
          practiceAnswers: true,
          examAnswers: true,
          examQuestions: true
        }
      });

      if (!question) {
        sendNotFoundResponse(res, 'Question not found');
        return;
      }

      // Check if question has been used in practice sessions or exams
      if (question.practiceAnswers.length > 0) {
        sendBadRequestResponse(res, 'Cannot delete question with existing practice answers');
        return;
      }

      if (question.examAnswers.length > 0) {
        sendBadRequestResponse(res, 'Cannot delete question with existing exam answers');
        return;
      }

      if (question.examQuestions.length > 0) {
        sendBadRequestResponse(res, 'Cannot delete question that is used in exams');
        return;
      }

      // Delete question and associated answers in a transaction
      await prisma.$transaction(async (tx) => {
        // Delete all answers for the question
        await tx.answer.deleteMany({ where: { questionId } });
        
        // Delete the question
        await tx.question.delete({ where: { id: questionId } });
      });

      sendSuccessNoDataResponse(res, 'Question deleted successfully');
    } catch (error) {
      console.error('Error deleting question:', error);
      sendErrorResponse(res, 'Failed to delete question');
    }
  },

  // Import questions from Excel file
  importQuestionsFromExcel: async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        sendBadRequestResponse(res, 'No file uploaded');
        return;
      }

      // Parse Excel file
      const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON
      const data: any[] = XLSX.utils.sheet_to_json(worksheet);

      if (data.length === 0) {
        sendBadRequestResponse(res, 'Excel file is empty');
        return;
      }

      const results = {
        success: [] as any[],
        failed: [] as any[],
        total: data.length
      };

      // Process each row
      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const rowNumber = i + 2; // +2 because Excel rows start at 1 and first row is header
        
        try {
          // 1. Validate required fields - check for blank/empty values
          const requiredFields = {
            questionText: row.questionText,
            grade: row.grade,
            type: row.type,
            answerType: row.answerType,
            answer1: row.answer1,
            answer2: row.answer2,
            correctAnswer: row.correctAnswer
          };

          const missingFields: string[] = [];
          for (const [field, value] of Object.entries(requiredFields)) {
            if (value === undefined || value === null || value.toString().trim() === '') {
              missingFields.push(field);
            }
          }

          if (missingFields.length > 0) {
            results.failed.push({
              row: rowNumber,
              error: `Missing required fields: ${missingFields.join(', ')}`,
              data: row
            });
            continue;
          }

          // 2. Validate grade (must be 1-5)
          const grade = parseInt(row.grade);
          if (isNaN(grade) || grade < 1 || grade > 5) {
            results.failed.push({
              row: rowNumber,
              error: 'Grade must be a number between 1 and 5',
              data: row
            });
            continue;
          }

          // 3. Validate type (must be "practice" or "exam")
          const type = row.type.toString().trim().toLowerCase();
          if (type !== 'practice' && type !== 'exam') {
            results.failed.push({
              row: rowNumber,
              error: 'Type must be either "practice" or "exam"',
              data: row
            });
            continue;
          }

          // 4. Validate answerType (must be "combobox", "text", or "choice")
          const answerType = row.answerType.toString().trim().toLowerCase();
          if (answerType !== 'combobox' && answerType !== 'text' && answerType !== 'choice') {
            results.failed.push({
              row: rowNumber,
              error: 'AnswerType must be "combobox", "text", or "choice"',
              data: row
            });
            continue;
          }

          // 5. Validate lessonId if provided
          let lessonId: number | null = null;
          if (row.lessonId) {
            lessonId = parseInt(row.lessonId);
            if (isNaN(lessonId)) {
              results.failed.push({
                row: rowNumber,
                error: 'LessonId must be a valid number',
                data: row
              });
              continue;
            }

            // Check if lesson exists
            const lessonExists = await prisma.lesson.findUnique({
              where: { id: lessonId }
            });

            if (!lessonExists) {
              results.failed.push({
                row: rowNumber,
                error: `Lesson with ID ${lessonId} does not exist`,
                data: row
              });
              continue;
            }
          }

          // 6. Collect all answers (answer1 to answer4)
          const answers: { text: string; index: number }[] = [];
          for (let j = 1; j <= 4; j++) {
            const answerKey = `answer${j}`;
            if (row[answerKey] && row[answerKey].toString().trim() !== '') {
              answers.push({
                text: row[answerKey].toString().trim(),
                index: j
              });
            }
          }

          if (answers.length === 0) {
            results.failed.push({
              row: rowNumber,
              error: 'No answers provided',
              data: row
            });
            continue;
          }

          // 7. Validate correctAnswer - must match one of the answer values
          const correctAnswerValue = row.correctAnswer.toString().trim();
          const matchingAnswer = answers.find(a => a.text === correctAnswerValue);

          if (!matchingAnswer) {
            results.failed.push({
              row: rowNumber,
              error: `correctAnswer "${correctAnswerValue}" must match one of the answer values (answer1, answer2, answer3, or answer4)`,
              data: row
            });
            continue;
          }

          // Create question with answers in transaction
          const question = await prisma.$transaction(async (tx) => {
            const newQuestion = await tx.question.create({
              data: {
                questionText: row.questionText.toString().trim(),
                imageUrl: row.imageUrl?.toString().trim() || null,
                audioUrl: row.audioUrl?.toString().trim() || null,
                explanationText: row.explanationText?.toString().trim() || null,
                explanationImg: row.explanationImg?.toString().trim() || null,
                grade: grade,
                type: type,
                answerType: answerType,
                lessonId: lessonId
              }
            });

            // Create answers
            await tx.answer.createMany({
              data: answers.map(answer => ({
                questionId: newQuestion.id,
                answerText: answer.text,
                isCorrect: answer.text === correctAnswerValue
              }))
            });

            return newQuestion;
          });

          results.success.push({
            row: rowNumber,
            questionId: question.id,
            questionText: question.questionText
          });

        } catch (error: any) {
          results.failed.push({
            row: rowNumber,
            error: error.message || 'Failed to create question',
            data: row
          });
        }
      }

      sendSuccessResponse(res, results, `Import completed: ${results.success.length} succeeded, ${results.failed.length} failed`);
    } catch (error) {
      console.error('Error importing questions:', error);
      sendErrorResponse(res, 'Failed to import questions from Excel');
    }
  },

  // Download Excel template
  downloadExcelTemplate: async (req: Request, res: Response): Promise<void> => {
    try {
      // Create instruction sheet data
      const instructions = [
        { Field: 'HƯỚNG DẪN NHẬP CÂU HỎI', Description: '' },
        { Field: '', Description: '' },
        { Field: '📋 CÁC TRƯỜNG BẮT BUỘC (Không được để trống):', Description: '' },
        { Field: '  • questionText', Description: 'Nội dung câu hỏi' },
        { Field: '  • grade', Description: 'Phải là 1, 2, 3, 4, hoặc 5' },
        { Field: '  • type', Description: 'Phải là "practice" hoặc "exam"' },
        { Field: '  • answerType', Description: 'Phải là "choice", "text", hoặc "combobox"' },
        { Field: '  • answer1', Description: 'Đáp án thứ nhất (bắt buộc)' },
        { Field: '  • answer2', Description: 'Đáp án thứ hai (bắt buộc)' },
        { Field: '  • correctAnswer', Description: 'PHẢI khớp chính xác với NỘI DUNG của answer1-4 (không phải số thứ tự!)' },
        { Field: '', Description: '' },
        { Field: '📝 CÁC TRƯỜNG TÙY CHỌN (Có thể để trống):', Description: '' },
        { Field: '  • imageUrl', Description: 'URL hình ảnh câu hỏi' },
        { Field: '  • audioUrl', Description: 'URL âm thanh câu hỏi' },
        { Field: '  • explanationText', Description: 'Giải thích đáp án bằng văn bản' },
        { Field: '  • explanationImg', Description: 'URL hình ảnh giải thích' },
        { Field: '  • lessonId', Description: 'ID bài học (phải tồn tại trong cơ sở dữ liệu nếu được cung cấp)' },
        { Field: '  • answer3', Description: 'Đáp án thứ ba (tùy chọn)' },
        { Field: '  • answer4', Description: 'Đáp án thứ tư (tùy chọn)' },
        { Field: '', Description: '' },
        { Field: '⚠️ QUY TẮC KIỂM TRA:', Description: '' },
        { Field: '  1. Grade', Description: 'Phải là số từ 1 đến 5' },
        { Field: '  2. Type', Description: 'Chỉ được là "practice" hoặc "exam" (không phân biệt hoa thường)' },
        { Field: '  3. AnswerType', Description: 'Chỉ được là "choice", "text", hoặc "combobox" (không phân biệt hoa thường)' },
        { Field: '  4. LessonId', Description: 'Nếu được cung cấp, phải tồn tại trong cơ sở dữ liệu' },
        { Field: '  5. CorrectAnswer', Description: 'PHẢI khớp chính xác với NỘI DUNG của answer1, answer2, answer3, hoặc answer4' },
        { Field: '', Description: '' },
        { Field: '✅ VÍ DỤ ĐÚNG:', Description: '' },
        { Field: '  answer1: "London"', Description: '' },
        { Field: '  answer2: "Paris"', Description: '' },
        { Field: '  answer3: "Berlin"', Description: '' },
        { Field: '  correctAnswer: "Paris"', Description: '← Khớp chính xác với nội dung answer2!' },
        { Field: '', Description: '' },
        { Field: '❌ VÍ DỤ SAI:', Description: '' },
        { Field: '  answer1: "London"', Description: '' },
        { Field: '  answer2: "Paris"', Description: '' },
        { Field: '  correctAnswer: "2"', Description: '← SAI! Phải dùng "Paris" chứ không phải "2"' },
        { Field: '', Description: '' },
        { Field: '💡 MẸO:', Description: '' },
        { Field: '  • Điền thông tin vào sheet Questions (tab tiếp theo)', Description: '' },
        { Field: '  • Xóa các dòng ví dụ trước khi nhập', Description: '' },
        { Field: '  • Đảm bảo tất cả các trường bắt buộc đã được điền', Description: '' },
        { Field: '  • correctAnswer là GIÁ TRỊ văn bản, không phải số thứ tự đáp án!', Description: '' },
        { Field: '  • Để trống các trường tùy chọn nếu không cần', Description: '' },
        { Field: '', Description: '' },
        { Field: '📤 CÁCH NHẬP:', Description: '' },
        { Field: '  1. Điền câu hỏi của bạn vào sheet Questions', Description: '' },
        { Field: '  2. Lưu file', Description: '' },
        { Field: '  3. Tải lên qua: POST /api/questions/import', Description: '' },
        { Field: '  4. Kiểm tra kết quả trả về để xem các dòng thành công/thất bại', Description: '' }
      ];

      // Create template data
      const templateData = [
        {
          questionText: 'Tính 2 + 2 = ?',
          imageUrl: '',
          audioUrl: '',
          explanationText: 'Addition of two numbers',
          explanationImg: '',
          grade: 1,
          type: 'practice',
          answerType: 'choice',
          lessonId: '8',
          answer1: '3',
          answer2: '4',
          answer3: '5',
          answer4: '6',
          correctAnswer: '4'
        },
        {
          questionText: 'Tính 5 - 3 = ?',
          imageUrl: '',
          audioUrl: '',
          explanationText: 'Subtraction example',
          explanationImg: '',
          grade: 1,
          type: 'exam',
          answerType: 'choice',
          lessonId: '',
          answer1: '1',
          answer2: '2',
          answer3: '3',
          answer4: '4',
          correctAnswer: '2'
        }
      ];

      // Create workbook
      const workbook = XLSX.utils.book_new();
      
      // Add Instructions sheet first
      const instructionSheet = XLSX.utils.json_to_sheet(instructions);
      instructionSheet['!cols'] = [
        { wch: 50 }, // Field column
        { wch: 80 }  // Description column
      ];
      XLSX.utils.book_append_sheet(workbook, instructionSheet, 'Instructions');

      // Add Questions sheet
      const worksheet = XLSX.utils.json_to_sheet(templateData);
      worksheet['!cols'] = [
        { wch: 50 }, // questionText
        { wch: 40 }, // imageUrl
        { wch: 40 }, // audioUrl
        { wch: 50 }, // explanationText
        { wch: 40 }, // explanationImg
        { wch: 10 }, // grade
        { wch: 15 }, // type
        { wch: 15 }, // answerType
        { wch: 10 }, // lessonId
        { wch: 30 }, // answer1
        { wch: 30 }, // answer2
        { wch: 30 }, // answer3
        { wch: 30 }, // answer4
        { wch: 30 }  // correctAnswer
      ];
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Questions');

      // Generate buffer
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      // Set headers and send file
      res.setHeader('Content-Disposition', 'attachment; filename=questions_template.xlsx');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.send(buffer);
    } catch (error) {
      console.error('Error generating template:', error);
      sendErrorResponse(res, 'Failed to generate template');
    }
  }

};

export default questionController;
