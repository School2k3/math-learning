import prisma from '../prisma/prisma.js';
import { Request, Response } from 'express';
import { Controller } from '../types/index.js';
import { 
  sendSuccessResponse, 
  sendSuccessNoDataResponse, 
  sendNotFoundResponse, 
  sendErrorResponse,
  sendBadRequestResponse
} from '../utils/apiResponse.js';
import { CreateAnswerInput, UpdateAnswerInput, CreateMultipleAnswersInput } from '../schemas/answer.schema.js';

const answerController: Controller = {
  // Get all answers for a specific question
  getAnswersByQuestionId: async (req: Request, res: Response): Promise<void> => {
    try {
      const { questionId } = req.params;
      
      const answers = await prisma.answer.findMany({
        where: { questionId: parseInt(questionId) },
        orderBy: {
          id: 'asc',
        },
        include: {
          question: true // Include associated question
        }
      });
      
      sendSuccessResponse(res, { answers }, 'Answers retrieved successfully');
    } catch (error) {
      console.error('Error getting answers:', error);
      sendErrorResponse(res, 'Error retrieving answers');
    }
  },
  
  // Get a specific answer by ID
  getAnswerById: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      const answer = await prisma.answer.findUnique({
        where: { id: parseInt(id) },
        include: {
          question: true, // Include related question
        },
      });
      
      if (!answer) {
        sendNotFoundResponse(res, 'Answer not found');
        return;
      }
      
      sendSuccessResponse(res, { answer }, 'Answer retrieved successfully');
    } catch (error) {
      console.error('Error getting answer:', error);
      sendErrorResponse(res, 'Error retrieving answer');
    }
  },
  
  // Get all correct answers for a question
  getCorrectAnswers: async (req: Request, res: Response): Promise<void> => {
    try {
      const { questionId } = req.params;
      
      const correctAnswers = await prisma.answer.findMany({
        where: { 
          questionId: parseInt(questionId),
          isCorrect: true
        },
        include: {
          question: true // Include associated question
        }
      });
      
      sendSuccessResponse(res, { correctAnswers }, 'Correct answers retrieved successfully');
    } catch (error) {
      console.error('Error getting correct answers:', error);
      sendErrorResponse(res, 'Error retrieving correct answers');
    }
  },

  // Create a new answer
  createAnswer: async (req: Request, res: Response): Promise<void> => {
    try {
      const answerData: CreateAnswerInput = req.body;

      // Check if question exists
      const question = await prisma.question.findUnique({
        where: { id: answerData.questionId }
      });

      if (!question) {
        sendBadRequestResponse(res, `Question with ID ${answerData.questionId} not found`);
        return;
      }

      const answer = await prisma.answer.create({
        data: answerData,
        include: {
          question: true
        }
      });

      sendSuccessResponse(res, { answer }, 'Answer created successfully', 201);
    } catch (error) {
      console.error('Error creating answer:', error);
      sendErrorResponse(res, 'Failed to create answer');
    }
  },

  // Create multiple answers at once
  createMultipleAnswers: async (req: Request, res: Response): Promise<void> => {
    try {
      const answersData: CreateMultipleAnswersInput = req.body;
      
      // Extract unique question IDs
      const questionIds = [...new Set(answersData.map(a => a.questionId))];
      
      // Check if all questions exist
      const questions = await prisma.question.findMany({
        where: { id: { in: questionIds } }
      });
      
      if (questions.length !== questionIds.length) {
        sendBadRequestResponse(res, 'One or more questions not found');
        return;
      }
      
      // Create all answers in a transaction
      const answers = await prisma.$transaction(
        answersData.map(answerData => 
          prisma.answer.create({
            data: answerData,
            include: {
              question: true
            }
          })
        )
      );
      
      sendSuccessResponse(res, { answers }, 'Answers created successfully', 201);
    } catch (error) {
      console.error('Error creating multiple answers:', error);
      sendErrorResponse(res, 'Failed to create answers');
    }
  },

  // Update an answer
  updateAnswer: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const answerId = parseInt(id);
      const answerData: UpdateAnswerInput = req.body;

      // Check if answer exists
      const existingAnswer = await prisma.answer.findUnique({
        where: { id: answerId },
        include: {
          question: true,
          practiceAnswers: true,
          examAnswers: true
        }
      });

      if (!existingAnswer) {
        sendNotFoundResponse(res, 'Answer not found');
        return;
      }

      // Check if answer is used in practice sessions or exams
      if (existingAnswer.practiceAnswers.length > 0 || existingAnswer.examAnswers.length > 0) {
        // For answers used in practice or exams, only allow updating the text, not the correctness
        if (answerData.isCorrect !== undefined && answerData.isCorrect !== existingAnswer.isCorrect) {
          sendBadRequestResponse(res, 'Cannot change correctness of answers used in practice sessions or exams');
          return;
        }
      }

      // Update the answer
      const updatedAnswer = await prisma.answer.update({
        where: { id: answerId },
        data: answerData,
        include: {
          question: true
        }
      });

      sendSuccessResponse(res, { answer: updatedAnswer }, 'Answer updated successfully');
    } catch (error) {
      console.error('Error updating answer:', error);
      sendErrorResponse(res, 'Failed to update answer');
    }
  },

  // Delete an answer
  deleteAnswer: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const answerId = parseInt(id);

      // Check if answer exists
      const answer = await prisma.answer.findUnique({
        where: { id: answerId },
        include: {
          practiceAnswers: true,
          examAnswers: true,
          question: {
            include: {
              answers: true
            }
          }
        }
      });

      if (!answer) {
        sendNotFoundResponse(res, 'Answer not found');
        return;
      }

      // Check if answer has been used in practice sessions or exams
      if (answer.practiceAnswers.length > 0) {
        sendBadRequestResponse(res, 'Cannot delete answer used in practice sessions');
        return;
      }

      if (answer.examAnswers.length > 0) {
        sendBadRequestResponse(res, 'Cannot delete answer used in exams');
        return;
      }

      // Check if it's the only answer for the question
      if (answer.question.answers.length <= 1) {
        sendBadRequestResponse(res, 'Cannot delete the only answer for a question');
        return;
      }

      // Check if it's the only correct answer (when required)
      const correctAnswers = answer.question.answers.filter(a => a.isCorrect);
      if (answer.isCorrect && correctAnswers.length <= 1) {
        sendBadRequestResponse(res, 'Cannot delete the only correct answer for a question');
        return;
      }

      // Delete the answer
      await prisma.answer.delete({
        where: { id: answerId }
      });

      sendSuccessNoDataResponse(res, 'Answer deleted successfully');
    } catch (error) {
      console.error('Error deleting answer:', error);
      sendErrorResponse(res, 'Failed to delete answer');
    }
  }
};

export default answerController;
