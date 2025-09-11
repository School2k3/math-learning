import prisma from '../prisma/prisma.js';
import { Request, Response } from 'express';
import { Controller } from '../types/index.js';

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
      });
      
      res.status(200).json({ answers });
    } catch (error) {
      console.error('Error getting answers:', error);
      res.status(500).json({ message: 'Error getting answers', error: (error as Error).message });
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
        res.status(404).json({ message: 'Answer not found' });
        return;
      }
      
      res.status(200).json({ answer });
    } catch (error) {
      console.error('Error getting answer:', error);
      res.status(500).json({ message: 'Error getting answer', error: (error as Error).message });
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
      });
      
      res.status(200).json({ correctAnswers });
    } catch (error) {
      console.error('Error getting correct answers:', error);
      res.status(500).json({ message: 'Error getting correct answers', error: (error as Error).message });
    }
  }
};

export default answerController;
