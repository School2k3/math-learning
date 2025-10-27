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
          finishedAt: null,
        },
      });

      // If no existing session, create a new one
      if (!practiceSession) {
        practiceSession = await prisma.practiceSession.create({
          data: {
            userId: parseInt(userId),
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

      // Get current practice session to check if it's completed
      const currentSession = await prisma.practiceSession.findUnique({
        where: { id: parseInt(practiceId) }
      });

      if (!currentSession) {
        res.status(404).json({ message: 'Practice session not found' });
        return;
      }

      if (currentSession.finishedAt) {
        res.status(400).json({ message: 'This practice session is already completed' });
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
      let scoreChange = 0;
      
      // Calculate score change: +10 for correct, -2 for incorrect
      scoreChange = answer.isCorrect ? 10 : -2;
      
      if (existingAnswer) {
        // If answer changes from correct to incorrect or vice versa, adjust score accordingly
        if (existingAnswer.isCorrect !== answer.isCorrect) {
          // If previous was correct and new is incorrect: -12 points (-10 -2)
          // If previous was incorrect and new is correct: +12 points (+10 +2)
          scoreChange = answer.isCorrect ? 12 : -12;
        } else {
          // No change in correctness, no score change
          scoreChange = 0;
        }
        
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
        
        // Update the practice session total questions count and score
        await prisma.practiceSession.update({
          where: { id: parseInt(practiceId) },
          data: {
            totalQuestions: {
              increment: 1,
            },
          },
        });
      }
      
      // Update the score
      const updatedSession = await prisma.practiceSession.update({
        where: { id: parseInt(practiceId) },
        data: {
          score: {
            increment: scoreChange,
          },
        },
      });
      
      // Check if the score has reached 100 or more
      let practiceCompleted = false;
      if (updatedSession.score >= 100 && !updatedSession.finishedAt) {
        await prisma.practiceSession.update({
          where: { id: parseInt(practiceId) },
          data: {
            finishedAt: new Date(),
          },
        });
        practiceCompleted = true;
      }
      
      res.status(201).json({ 
        practiceAnswer,
        isCorrect: answer.isCorrect,
        score: updatedSession.score,
        scoreChange,
        practiceCompleted
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
  },

  // Get current score for a practice session
  getCurrentScore: async (req: Request, res: Response): Promise<void> => {
    try {
      const { practiceId } = req.params;
      
      const practiceSession = await prisma.practiceSession.findUnique({
        where: { id: parseInt(practiceId) },
        include: {
          practiceAnswers: {
            include: {
              question: true,
              chosenAnswer: true
            }
          }
        }
      });
      
      if (!practiceSession) {
        res.status(404).json({ message: 'Practice session not found' });
        return;
      }
      
      // Get total answered questions and correct answers
      const totalAnswered = practiceSession.practiceAnswers.length;
      const correctAnswers = practiceSession.practiceAnswers.filter(answer => answer.isCorrect).length;
      const incorrectAnswers = totalAnswered - correctAnswers;
      
      res.status(200).json({ 
        score: practiceSession.score,
        totalAnswered,
        correctAnswers,
        incorrectAnswers,
        pointsToComplete: Math.max(0, 100 - practiceSession.score),
        isCompleted: practiceSession.finishedAt !== null,
        practiceSession
      });
    } catch (error) {
      console.error('Error getting practice score:', error);
      res.status(500).json({ message: 'Error getting practice score', error: (error as Error).message });
    }
  }
};

export default practiceController;