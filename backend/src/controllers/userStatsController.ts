import prisma from '../prisma/prisma.js';
import { Request, Response } from 'express';
import { Controller } from '../types/index.js';

const userStatsController: Controller = {
  // Get comprehensive user statistics
  getUserStatistics: async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const { date } = req.query; // Optional date filter (YYYY-MM-DD)
      
      // Build date filter if provided
      let dateFilter: any = {};
      if (date) {
        const targetDate = new Date(date as string);
        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);
        
        dateFilter = {
          gte: targetDate,
          lt: nextDay,
        };
      }
      
      // 1. Get total answered questions (from practice sessions)
      const practiceAnswers = await prisma.practiceAnswer.findMany({
        where: {
          practiceSession: {
            userId: parseInt(userId),
            ...(date ? { startedAt: dateFilter } : {}),
          },
        },
        distinct: ['questionId'], // Count unique questions only
      });
      
      const totalQuestionsAnswered = practiceAnswers.length;
      
      // 2. Get total exams completed
      const completedExams = await prisma.examResult.count({
        where: {
          userId: parseInt(userId),
          finishedAt: {
            not: null, // Only count finished exams
            ...(date ? dateFilter : {}),
          },
        },
      });
      
      // 3. Get total practice sessions completed (topics practiced)
      const completedPracticeSessions = await prisma.practiceSession.count({
        where: {
          userId: parseInt(userId),
          finishedAt: {
            not: null, // Only count finished sessions
            ...(date ? dateFilter : {}),
          },
        },
      });
      
      // 4. Get total minutes spent practicing (optional, estimated)
      const practiceSessions = await prisma.practiceSession.findMany({
        where: {
          userId: parseInt(userId),
          finishedAt: {
            not: null,
            ...(date ? dateFilter : {}),
          },
        },
        select: {
          startedAt: true,
          finishedAt: true,
        },
      });
      
      const totalMinutesSpent = practiceSessions.reduce((total, session) => {
        if (session.finishedAt) {
          const duration = (session.finishedAt.getTime() - session.startedAt.getTime()) / (1000 * 60);
          return total + duration;
        }
        return total;
      }, 0);
      
      // 5. Get points/achievements earned
      const totalPointsEarned = await prisma.practiceSession.aggregate({
        where: {
          userId: parseInt(userId),
          ...(date ? { finishedAt: dateFilter } : {}),
        },
        _sum: {
          score: true,
        },
      });
      
      // 6. Get user trophies
      const user = await prisma.user.findUnique({
        where: { id: parseInt(userId) },
        select: {
          trophies: true,
        },
      });
      
      res.status(200).json({
        success: true,
        message: 'User statistics retrieved successfully',
        data: {
          questionsAnswered: totalQuestionsAnswered,
          examsCompleted: completedExams,
          topicsPracticed: completedPracticeSessions,
          minutesSpent: Math.round(totalMinutesSpent),
          totalPoints: totalPointsEarned._sum.score || 0,
          trophies: user?.trophies || 0,
        },
      });
    } catch (error) {
      console.error('Error getting user statistics:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error retrieving user statistics', 
        error: (error as Error).message 
      });
    }
  },

  // Get detailed practice statistics
  getPracticeStatistics: async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const { date } = req.query; // Optional date filter (YYYY-MM-DD)
      
      // Build date filter if provided
      let dateFilter: any = {};
      if (date) {
        const targetDate = new Date(date as string);
        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);
        
        dateFilter = {
          gte: targetDate,
          lt: nextDay,
        };
      }
      
      const practiceSessions = await prisma.practiceSession.findMany({
        where: {
          userId: parseInt(userId),
          ...(date ? { startedAt: dateFilter } : {}),
        },
        include: {
          lesson: {
            select: {
              id: true,
              title: true,
            },
          },
          practiceAnswers: true,
        },
        orderBy: {
          startedAt: 'desc',
        },
      });
      
      const completed = practiceSessions.filter(s => s.finishedAt !== null).length;
      const inProgress = practiceSessions.filter(s => s.finishedAt === null).length;
      
      res.status(200).json({
        success: true,
        message: 'Practice statistics retrieved successfully',
        data: {
          totalSessions: practiceSessions.length,
          completedSessions: completed,
          inProgressSessions: inProgress,
          sessions: practiceSessions,
        },
      });
    } catch (error) {
      console.error('Error getting practice statistics:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error retrieving practice statistics', 
        error: (error as Error).message 
      });
    }
  },

  // Get detailed exam statistics
  getExamStatistics: async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const { date } = req.query; // Optional date filter (YYYY-MM-DD)
      
      // Build date filter if provided
      let dateFilter: any = {};
      if (date) {
        const targetDate = new Date(date as string);
        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);
        
        dateFilter = {
          gte: targetDate,
          lt: nextDay,
        };
      }
      
      const examResults = await prisma.examResult.findMany({
        where: {
          userId: parseInt(userId),
          ...(date ? { startedAt: dateFilter } : {}),
        },
        include: {
          exam: {
            select: {
              id: true,
              title: true,
              grade: true,
            },
          },
          examAnswers: true,
        },
        orderBy: {
          startedAt: 'desc',
        },
      });
      
      const completed = examResults.filter(e => e.finishedAt !== null);
      const inProgress = examResults.filter(e => e.finishedAt === null);
      
      const averageScore = completed.length > 0
        ? completed.reduce((sum, e) => sum + e.score, 0) / completed.length
        : 0;
      
      const passed = completed.filter(e => e.score >= 60).length;
      const failed = completed.filter(e => e.score < 60).length;
      
      res.status(200).json({
        success: true,
        message: 'Exam statistics retrieved successfully',
        data: {
          totalExams: examResults.length,
          completedExams: completed.length,
          inProgressExams: inProgress.length,
          passedExams: passed,
          failedExams: failed,
          averageScore: Math.round(averageScore * 10) / 10,
          examResults: examResults,
        },
      });
    } catch (error) {
      console.error('Error getting exam statistics:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error retrieving exam statistics', 
        error: (error as Error).message 
      });
    }
  },

  // Get questions answered statistics
  getQuestionsStatistics: async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const { date } = req.query; // Optional date filter (YYYY-MM-DD)
      
      // Build date filter if provided
      let dateFilter: any = {};
      if (date) {
        const targetDate = new Date(date as string);
        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);
        
        dateFilter = {
          gte: targetDate,
          lt: nextDay,
        };
      }
      
      // Get all practice answers
      const practiceAnswers = await prisma.practiceAnswer.findMany({
        where: {
          practiceSession: {
            userId: parseInt(userId),
            ...(date ? { startedAt: dateFilter } : {}),
          },
        },
        include: {
          question: {
            select: {
              id: true,
              grade: true,
            },
          },
        },
      });
      
      const totalAnswered = practiceAnswers.length;
      const correctAnswers = practiceAnswers.filter(a => a.isCorrect).length;
      const incorrectAnswers = totalAnswered - correctAnswers;
      const accuracy = totalAnswered > 0 ? (correctAnswers / totalAnswered) * 100 : 0;
      
      // Get unique questions answered
      const uniqueQuestions = new Set(practiceAnswers.map(a => a.questionId));
      const uniqueQuestionsAnswered = uniqueQuestions.size;
      
      res.status(200).json({
        success: true,
        message: 'Questions statistics retrieved successfully',
        data: {
          totalAnswered,
          uniqueQuestionsAnswered,
          correctAnswers,
          incorrectAnswers,
          accuracy: Math.round(accuracy * 10) / 10,
        },
      });
    } catch (error) {
      console.error('Error getting questions statistics:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error retrieving questions statistics', 
        error: (error as Error).message 
      });
    }
  },

  // Get practice minutes
  getPracticeMinutes: async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const { date } = req.query; // Optional date filter (YYYY-MM-DD)
      
      // Build date filter if provided
      let dateFilter: any = {};
      if (date) {
        const targetDate = new Date(date as string);
        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);
        
        dateFilter = {
          gte: targetDate,
          lt: nextDay,
        };
      }
      
      // Get all completed practice sessions
      const practiceSessions = await prisma.practiceSession.findMany({
        where: {
          userId: parseInt(userId),
          finishedAt: {
            not: null,
            ...(date ? dateFilter : {}),
          },
        },
        select: {
          startedAt: true,
          finishedAt: true,
        },
      });
      
      // Calculate total minutes spent
      const totalMinutes = practiceSessions.reduce((total, session) => {
        if (session.finishedAt) {
          const durationMs = session.finishedAt.getTime() - session.startedAt.getTime();
          const durationMinutes = durationMs / (1000 * 60);
          return total + durationMinutes;
        }
        return total;
      }, 0);
      
      res.status(200).json({
        success: true,
        message: 'Practice minutes retrieved successfully',
        data: {
          totalMinutes: Math.round(totalMinutes),
          totalSessions: practiceSessions.length,
          averageMinutesPerSession: practiceSessions.length > 0 
            ? Math.round(totalMinutes / practiceSessions.length) 
            : 0,
        },
      });
    } catch (error) {
      console.error('Error getting practice minutes:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error retrieving practice minutes', 
        error: (error as Error).message 
      });
    }
  },

  // Get exam minutes
  getExamMinutes: async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const { date } = req.query; // Optional date filter (YYYY-MM-DD)
      
      // Build date filter if provided
      let dateFilter: any = {};
      if (date) {
        const targetDate = new Date(date as string);
        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);
        
        dateFilter = {
          gte: targetDate,
          lt: nextDay,
        };
      }
      
      // Get all completed exams
      const examResults = await prisma.examResult.findMany({
        where: {
          userId: parseInt(userId),
          finishedAt: {
            not: null,
            ...(date ? dateFilter : {}),
          },
        },
        select: {
          startedAt: true,
          finishedAt: true,
        },
      });
      
      // Calculate total minutes spent on exams
      const totalMinutes = examResults.reduce((total, exam) => {
        if (exam.finishedAt) {
          const durationMs = exam.finishedAt.getTime() - exam.startedAt.getTime();
          const durationMinutes = durationMs / (1000 * 60);
          return total + durationMinutes;
        }
        return total;
      }, 0);
      
      res.status(200).json({
        success: true,
        message: 'Exam minutes retrieved successfully',
        data: {
          totalMinutes: Math.round(totalMinutes),
          totalExams: examResults.length,
          averageMinutesPerExam: examResults.length > 0 
            ? Math.round(totalMinutes / examResults.length) 
            : 0,
        },
      });
    } catch (error) {
      console.error('Error getting exam minutes:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error retrieving exam minutes', 
        error: (error as Error).message 
      });
    }
  },
};

export default userStatsController;
