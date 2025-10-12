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
  }
};

export default questionController;
