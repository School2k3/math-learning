import prisma from '../prisma/prisma.js';
import { Request, Response } from 'express';
import { Controller } from '../types/index.js';

const practiceController: Controller = {
  // Create or update a practice session
  createOrUpdateSession: async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId, lessonId, topic } = req.body;
      
      if (!userId) {
        res.status(400).json({ message: 'User ID is required' });
        return;
      }

      // Try to find existing session for this user and topic that's not finished
      let practiceSession = await prisma.practiceSession.findFirst({
        where: {
          userId: parseInt(userId),
          topic,
          finishedAt: null,
        },
      });

      // If no existing session, create a new one
      if (!practiceSession) {
        practiceSession = await prisma.practiceSession.create({
          data: {
            userId: parseInt(userId),
            topic,
            score: 0,
            totalQuestions: 0,
            startedAt: new Date(),
          },
        });
      }
      
      res.status(201).json({ practiceSession });
    } catch (error) {
      console.error('Error creating/updating practice session:', error);
      res.status(500).json({ message: 'Error creating/updating practice session', error: (error as Error).message });
    }
  },
  
  // Save a practice answer
  saveAnswer: async (req: Request, res: Response): Promise<void> => {
    try {
      const { practiceId, questionId, answerId } = req.body;
      
      if (!practiceId || !questionId || !answerId) {
        res.status(400).json({ message: 'Practice ID, Question ID and Answer ID are required' });
        return;
      }
      
      // Find the selected answer to check if it's correct
      const answer = await prisma.answer.findUnique({
        where: { id: parseInt(answerId) },
      });
      
      if (!answer) {
        res.status(404).json({ message: 'Answer not found' });
        return;
      }
      
      // Check if an answer for this question already exists in this practice session
      const existingAnswer = await prisma.practiceAnswer.findFirst({
        where: {
          practiceId: parseInt(practiceId),
          questionId: parseInt(questionId),
        },
      });
      
      let practiceAnswer;
      
      if (existingAnswer) {
        // Update the existing answer
        practiceAnswer = await prisma.practiceAnswer.update({
          where: { id: existingAnswer.id },
          data: {
            chosenAnswerId: parseInt(answerId),
            isCorrect: answer.isCorrect,
          },
        });
      } else {
        // Create a new practice answer
        practiceAnswer = await prisma.practiceAnswer.create({
          data: {
            practiceId: parseInt(practiceId),
            questionId: parseInt(questionId),
            chosenAnswerId: parseInt(answerId),
            isCorrect: answer.isCorrect,
          },
        });
        
        // Update the practice session total questions count
        await prisma.practiceSession.update({
          where: { id: parseInt(practiceId) },
          data: {
            totalQuestions: {
              increment: 1,
            },
            score: {
              increment: answer.isCorrect ? 1 : 0,
            },
          },
        });
      }
      
      res.status(201).json({ 
        practiceAnswer,
        isCorrect: answer.isCorrect
      });
    } catch (error) {
      console.error('Error saving practice answer:', error);
      res.status(500).json({ message: 'Error saving practice answer', error: (error as Error).message });
    }
  },
  
  // Complete a practice session
  completeSession: async (req: Request, res: Response): Promise<void> => {
    try {
      const { practiceId } = req.params;
      
      // Update the practice session to mark it as finished
      const practiceSession = await prisma.practiceSession.update({
        where: { id: parseInt(practiceId) },
        data: {
          finishedAt: new Date(),
        },
        include: {
          practiceAnswers: true,
        },
      });
      
      // Calculate the final score
      const correctAnswers = practiceSession.practiceAnswers.filter(answer => answer.isCorrect).length;
      const totalQuestions = practiceSession.totalQuestions;
      const finalScore = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
      
      // Update the session with the final score
      await prisma.practiceSession.update({
        where: { id: parseInt(practiceId) },
        data: {
          score: finalScore,
        },
      });
      
      res.status(200).json({ 
        practiceSession: {
          ...practiceSession,
          score: finalScore
        }
      });
    } catch (error) {
      console.error('Error completing practice session:', error);
      res.status(500).json({ message: 'Error completing practice session', error: (error as Error).message });
    }
  },
  
  // Get practice history for a user
  getUserPracticeHistory: async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      
      const practiceHistory = await prisma.practiceSession.findMany({
        where: { userId: parseInt(userId) },
        include: {
          practiceAnswers: true,
        },
        orderBy: {
          startedAt: 'desc',
        },
      });
      
      res.status(200).json({ practiceHistory });
    } catch (error) {
      console.error('Error getting practice history:', error);
      res.status(500).json({ message: 'Error getting practice history', error: (error as Error).message });
    }
  }
};

export default practiceController;