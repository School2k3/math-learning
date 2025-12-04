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

  // Get user's most wrong answers in practice
  getUserMostWrongAnswersPractice: async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const { limit = '20' } = req.query;
      const limitCount = parseInt(limit as string);
      
      // Get all incorrect practice answers for this user
      const incorrectAnswers = await prisma.practiceAnswer.findMany({
        where: {
          isCorrect: false,
          practiceSession: {
            userId: parseInt(userId),
          },
        },
        include: {
          question: {
            include: {
              answers: true,
              lesson: {
                select: {
                  id: true,
                  title: true,
                  chapter: {
                    select: {
                      title: true,
                      grade: true,
                    },
                  },
                },
              },
            },
          },
          chosenAnswer: true,
          practiceSession: {
            select: {
              startedAt: true,
              finishedAt: true,
            },
          },
        },
      });
      
      // Group by question and count wrong attempts
      const questionStats: { [key: number]: {
        question: any;
        wrongCount: number;
        totalAttempts: number;
        wrongPercentage: number;
        wrongAnswers: Array<{ answer: any; attemptedAt: Date }>;
        lastAttempted: Date;
      } } = {};
      
      incorrectAnswers.forEach(answer => {
        const questionId = answer.questionId;
        
        if (!questionStats[questionId]) {
          questionStats[questionId] = {
            question: answer.question,
            wrongCount: 0,
            totalAttempts: 0,
            wrongPercentage: 0,
            wrongAnswers: [],
            lastAttempted: answer.practiceSession.startedAt,
          };
        }
        
        questionStats[questionId].wrongCount++;
        questionStats[questionId].wrongAnswers.push({
          answer: answer.chosenAnswer,
          attemptedAt: answer.practiceSession.startedAt,
        });
        
        // Update last attempted date
        if (answer.practiceSession.startedAt > questionStats[questionId].lastAttempted) {
          questionStats[questionId].lastAttempted = answer.practiceSession.startedAt;
        }
      });
      
      // Get total attempts for each question by this user
      const allAnswers = await prisma.practiceAnswer.findMany({
        where: {
          questionId: { in: Object.keys(questionStats).map(id => parseInt(id)) },
          practiceSession: {
            userId: parseInt(userId),
          },
        },
        select: {
          questionId: true,
        },
      });
      
      allAnswers.forEach(answer => {
        if (questionStats[answer.questionId]) {
          questionStats[answer.questionId].totalAttempts++;
        }
      });
      
      // Calculate percentages and format data
      const formattedStats = Object.values(questionStats)
        .map(stat => {
          const wrongPercentage = stat.totalAttempts > 0 
            ? (stat.wrongCount / stat.totalAttempts) * 100 
            : 0;
          
          // Get correct answer
          const correctAnswer = stat.question.answers.find((a: any) => a.isCorrect);
          
          // Get most recent wrong answer
          const recentWrongAnswer = stat.wrongAnswers
            .sort((a, b) => b.attemptedAt.getTime() - a.attemptedAt.getTime())[0];
          
          return {
            questionId: stat.question.id,
            questionText: stat.question.questionText,
            questionImage: stat.question.imageUrl,
            audioUrl: stat.question.audioUrl,
            grade: stat.question.grade,
            lesson: stat.question.lesson,
            wrongCount: stat.wrongCount,
            totalAttempts: stat.totalAttempts,
            wrongPercentage: Math.round(wrongPercentage * 10) / 10,
            lastAttempted: stat.lastAttempted,
            correctAnswer: correctAnswer ? {
              id: correctAnswer.id,
              answerText: correctAnswer.answerText,
            } : null,
            lastWrongAnswer: recentWrongAnswer ? {
              id: recentWrongAnswer.answer.id,
              answerText: recentWrongAnswer.answer.answerText,
              attemptedAt: recentWrongAnswer.attemptedAt,
            } : null,
            allAnswers: stat.question.answers.map((a: any) => ({
              id: a.id,
              answerText: a.answerText,
              isCorrect: a.isCorrect,
            })),
            explanationText: stat.question.explanationText,
            explanationImg: stat.question.explanationImg,
          };
        })
        .sort((a, b) => b.wrongCount - a.wrongCount)
        .slice(0, limitCount);
      
      res.status(200).json({
        success: true,
        message: 'User most wrong answers in practice retrieved successfully',
        data: formattedStats,
      });
    } catch (error) {
      console.error('Error getting user most wrong answers in practice:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error retrieving user most wrong answers in practice', 
        error: (error as Error).message 
      });
    }
  },

  // Get user's most wrong answers in exams
  getUserMostWrongAnswersExam: async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const { limit = '20' } = req.query;
      const limitCount = parseInt(limit as string);
      
      // Get all incorrect exam answers for this user
      const incorrectAnswers = await prisma.examAnswer.findMany({
        where: {
          isCorrect: false,
          examResult: {
            userId: parseInt(userId),
          },
        },
        include: {
          question: {
            include: {
              answers: true,
            },
          },
          chosenAnswer: true,
          examResult: {
            select: {
              startedAt: true,
              finishedAt: true,
              score: true,
              exam: {
                select: {
                  id: true,
                  title: true,
                  grade: true,
                },
              },
            },
          },
        },
      });
      
      // Group by question and count wrong attempts
      const questionStats: { [key: number]: {
        question: any;
        wrongCount: number;
        totalAttempts: number;
        wrongPercentage: number;
        wrongAnswers: Array<{ answer: any; exam: any; attemptedAt: Date; score: number }>;
        lastAttempted: Date;
        exams: Set<number>;
      } } = {};
      
      incorrectAnswers.forEach(answer => {
        const questionId = answer.questionId;
        
        if (!questionStats[questionId]) {
          questionStats[questionId] = {
            question: answer.question,
            wrongCount: 0,
            totalAttempts: 0,
            wrongPercentage: 0,
            wrongAnswers: [],
            lastAttempted: answer.examResult.startedAt,
            exams: new Set(),
          };
        }
        
        questionStats[questionId].wrongCount++;
        questionStats[questionId].exams.add(answer.examResult.exam.id);
        questionStats[questionId].wrongAnswers.push({
          answer: answer.chosenAnswer,
          exam: answer.examResult.exam,
          attemptedAt: answer.examResult.startedAt,
          score: answer.examResult.score,
        });
        
        // Update last attempted date
        if (answer.examResult.startedAt > questionStats[questionId].lastAttempted) {
          questionStats[questionId].lastAttempted = answer.examResult.startedAt;
        }
      });
      
      // Get total attempts for each question by this user
      const allAnswers = await prisma.examAnswer.findMany({
        where: {
          questionId: { in: Object.keys(questionStats).map(id => parseInt(id)) },
          examResult: {
            userId: parseInt(userId),
          },
        },
        select: {
          questionId: true,
        },
      });
      
      allAnswers.forEach(answer => {
        if (questionStats[answer.questionId]) {
          questionStats[answer.questionId].totalAttempts++;
        }
      });
      
      // Calculate percentages and format data
      const formattedStats = Object.values(questionStats)
        .map(stat => {
          const wrongPercentage = stat.totalAttempts > 0 
            ? (stat.wrongCount / stat.totalAttempts) * 100 
            : 0;
          
          // Get correct answer
          const correctAnswer = stat.question.answers.find((a: any) => a.isCorrect);
          
          // Get most recent wrong answer
          const recentWrongAnswer = stat.wrongAnswers
            .sort((a, b) => b.attemptedAt.getTime() - a.attemptedAt.getTime())[0];
          
          return {
            questionId: stat.question.id,
            questionText: stat.question.questionText,
            questionImage: stat.question.imageUrl,
            audioUrl: stat.question.audioUrl,
            grade: stat.question.grade,
            wrongCount: stat.wrongCount,
            totalAttempts: stat.totalAttempts,
            wrongPercentage: Math.round(wrongPercentage * 10) / 10,
            lastAttempted: stat.lastAttempted,
            appearsInExams: stat.exams.size,
            correctAnswer: correctAnswer ? {
              id: correctAnswer.id,
              answerText: correctAnswer.answerText,
            } : null,
            lastWrongAnswer: recentWrongAnswer ? {
              id: recentWrongAnswer.answer.id,
              answerText: recentWrongAnswer.answer.answerText,
              exam: recentWrongAnswer.exam,
              attemptedAt: recentWrongAnswer.attemptedAt,
              examScore: Math.round(recentWrongAnswer.score * 10) / 10,
            } : null,
            allAnswers: stat.question.answers.map((a: any) => ({
              id: a.id,
              answerText: a.answerText,
              isCorrect: a.isCorrect,
            })),
            explanationText: stat.question.explanationText,
            explanationImg: stat.question.explanationImg,
          };
        })
        .sort((a, b) => b.wrongCount - a.wrongCount)
        .slice(0, limitCount);
      
      res.status(200).json({
        success: true,
        message: 'User most wrong answers in exams retrieved successfully',
        data: formattedStats,
      });
    } catch (error) {
      console.error('Error getting user most wrong answers in exams:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error retrieving user most wrong answers in exams', 
        error: (error as Error).message 
      });
    }
  },
};

export default userStatsController;
