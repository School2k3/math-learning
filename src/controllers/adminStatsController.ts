import prisma from '../prisma/prisma.js';
import { Request, Response } from 'express';
import { Controller } from '../types/index.js';

const adminStatsController: Controller = {
  // Get all admin dashboard statistics
  getAllAdminStats: async (req: Request, res: Response): Promise<void> => {
    try {
      const { date } = req.query; // Optional date filter (YYYY-MM-DD) for active students
      
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
      
      // 1. Total students (users with role 'student')
      const totalStudents = await prisma.user.count({
        where: {
          role: 'student',
        },
      });
      
      // 2. Total lessons
      const totalLessons = await prisma.lesson.count();
      
      // 3. Total exams
      const totalExams = await prisma.exam.count();
      
      // 4. Total chapters
      const totalChapters = await prisma.chapter.count();

      // 5. Total questions and total answer choices
      const totalQuestions = await prisma.question.count();
      const totalAnswers = await prisma.answer.count();
      
      // 5. Active students (last 7 days) or specific date
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const activeStudentsFilter = date ? dateFilter : { gte: sevenDaysAgo };
      
      const activeStudentsPractice = await prisma.practiceSession.findMany({
        where: {
          startedAt: activeStudentsFilter,
        },
        select: {
          userId: true,
        },
        distinct: ['userId'],
      });
      
      const activeStudentsExam = await prisma.examResult.findMany({
        where: {
          startedAt: activeStudentsFilter,
        },
        select: {
          userId: true,
        },
        distinct: ['userId'],
      });
      
      // Combine and get unique active students
      const activeStudentIds = new Set([
        ...activeStudentsPractice.map(s => s.userId),
        ...activeStudentsExam.map(e => e.userId),
      ]);
      
      const activeStudents = activeStudentIds.size;
      
      // 6. Lesson completion rate
      const completedLessons = await prisma.practiceSession.count({
        where: {
          finishedAt: { not: null },
        },
      });
      
      const totalPracticeSessions = await prisma.practiceSession.count();
      const lessonCompletionRate = totalPracticeSessions > 0 
        ? (completedLessons / totalPracticeSessions) * 100 
        : 0;
      
      // 7. Average exam score
      const examResults = await prisma.examResult.findMany({
        where: {
          finishedAt: { not: null },
        },
        select: {
          score: true,
        },
      });
      
      const averageExamScore = examResults.length > 0
        ? examResults.reduce((sum, exam) => sum + exam.score, 0) / examResults.length
        : 0;
      
      // 8. Total questions answered
      const totalQuestionsAnswered = await prisma.practiceAnswer.count();
      
      res.status(200).json({
        success: true,
        message: 'Admin statistics retrieved successfully',
        data: {
          totalStudents,
          totalLessons,
          totalExams,
          totalChapters,
          activeStudents: {
            count: activeStudents,
            period: date ? 'specific_date' : 'last_7_days',
          },
          lessonCompletionRate: Math.round(lessonCompletionRate * 10) / 10,
          averageExamScore: Math.round(averageExamScore * 10) / 10,
          totalQuestions,
          totalAnswers,
          totalQuestionsAnswered,
        },
      });
    } catch (error) {
      console.error('Error getting admin statistics:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error retrieving admin statistics', 
        error: (error as Error).message 
      });
    }
  },

  // Get total students count
  getTotalStudents: async (req: Request, res: Response): Promise<void> => {
    try {
      const totalStudents = await prisma.user.count({
        where: {
          role: 'student',
        },
      });
      
      // Get students by grade
      const studentsByGrade = await prisma.user.groupBy({
        by: ['grade'],
        where: {
          role: 'student',
        },
        _count: {
          grade: true,
        },
      });
      
      res.status(200).json({
        success: true,
        message: 'Total students retrieved successfully',
        data: {
          totalStudents,
          byGrade: studentsByGrade,
        },
      });
    } catch (error) {
      console.error('Error getting total students:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error retrieving total students', 
        error: (error as Error).message 
      });
    }
  },

  // Get total lessons count
  getTotalLessons: async (req: Request, res: Response): Promise<void> => {
    try {
      const totalLessons = await prisma.lesson.count();
      
      // Get lessons by chapter grade
      const lessons = await prisma.lesson.findMany({
        include: {
          chapter: {
            select: {
              grade: true,
            },
          },
        },
      });
      
      // Group lessons by grade
      const lessonsByGrade = lessons.reduce((acc: any[], lesson) => {
        const grade = lesson.chapter.grade;
        const existing = acc.find(item => item.grade === grade);
        if (existing) {
          existing._count.grade++;
        } else {
          acc.push({ grade, _count: { grade: 1 } });
        }
        return acc;
      }, []);
      
      res.status(200).json({
        success: true,
        message: 'Total lessons retrieved successfully',
        data: {
          totalLessons,
          byGrade: lessonsByGrade,
        },
      });
    } catch (error) {
      console.error('Error getting total lessons:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error retrieving total lessons', 
        error: (error as Error).message 
      });
    }
  },

  // Get total exams count
  getTotalExams: async (req: Request, res: Response): Promise<void> => {
    try {
      const totalExams = await prisma.exam.count();
      
      // Get exams by grade
      const examsByGrade = await prisma.exam.groupBy({
        by: ['grade'],
        _count: {
          grade: true,
        },
      });
      
      res.status(200).json({
        success: true,
        message: 'Total exams retrieved successfully',
        data: {
          totalExams,
          byGrade: examsByGrade,
        },
      });
    } catch (error) {
      console.error('Error getting total exams:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error retrieving total exams', 
        error: (error as Error).message 
      });
    }
  },

  // Get total chapters count
  getTotalChapters: async (req: Request, res: Response): Promise<void> => {
    try {
      const totalChapters = await prisma.chapter.count();
      
      // Get chapters by grade
      const chaptersByGrade = await prisma.chapter.groupBy({
        by: ['grade'],
        _count: {
          grade: true,
        },
      });
      
      res.status(200).json({
        success: true,
        message: 'Total chapters retrieved successfully',
        data: {
          totalChapters,
          byGrade: chaptersByGrade,
        },
      });
    } catch (error) {
      console.error('Error getting total chapters:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error retrieving total chapters', 
        error: (error as Error).message 
      });
    }
  },

  // Get active students (last 7 days or specific date)
  getActiveStudents: async (req: Request, res: Response): Promise<void> => {
    try {
      const { date, days = '7' } = req.query;
      
      let dateFilter: any = {};
      let period = '';
      
      if (date) {
        // Specific date filter
        const targetDate = new Date(date as string);
        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);
        
        dateFilter = {
          gte: targetDate,
          lt: nextDay,
        };
        period = `date_${date}`;
      } else {
        // Last N days filter
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - parseInt(days as string));
        
        dateFilter = { gte: daysAgo };
        period = `last_${days}_days`;
      }
      
      // Get students who practiced
      const activeStudentsPractice = await prisma.practiceSession.findMany({
        where: {
          startedAt: dateFilter,
        },
        select: {
          userId: true,
          user: {
            select: {
              id: true,
              username: true,
              fullName: true,
              grade: true,
            },
          },
        },
        distinct: ['userId'],
      });
      
      // Get students who took exams
      const activeStudentsExam = await prisma.examResult.findMany({
        where: {
          startedAt: dateFilter,
        },
        select: {
          userId: true,
          user: {
            select: {
              id: true,
              username: true,
              fullName: true,
              grade: true,
            },
          },
        },
        distinct: ['userId'],
      });
      
      // Combine and get unique active students
      const activeStudentsMap = new Map();
      
      activeStudentsPractice.forEach(s => {
        activeStudentsMap.set(s.userId, s.user);
      });
      
      activeStudentsExam.forEach(e => {
        activeStudentsMap.set(e.userId, e.user);
      });
      
      const activeStudents = Array.from(activeStudentsMap.values());
      
      res.status(200).json({
        success: true,
        message: 'Active students retrieved successfully',
        data: {
          activeStudents: activeStudents.length,
          period,
          students: activeStudents,
        },
      });
    } catch (error) {
      console.error('Error getting active students:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error retrieving active students', 
        error: (error as Error).message 
      });
    }
  },

  // Get lesson completion rate
  getLessonCompletionRate: async (req: Request, res: Response): Promise<void> => {
    try {
      const completedLessons = await prisma.practiceSession.count({
        where: {
          finishedAt: { not: null },
        },
      });
      
      const totalPracticeSessions = await prisma.practiceSession.count();
      
      const completionRate = totalPracticeSessions > 0 
        ? (completedLessons / totalPracticeSessions) * 100 
        : 0;
      
      res.status(200).json({
        success: true,
        message: 'Lesson completion rate retrieved successfully',
        data: {
          completedSessions: completedLessons,
          totalSessions: totalPracticeSessions,
          completionRate: Math.round(completionRate * 10) / 10,
        },
      });
    } catch (error) {
      console.error('Error getting lesson completion rate:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error retrieving lesson completion rate', 
        error: (error as Error).message 
      });
    }
  },

  // Get average exam score
  getAverageExamScore: async (req: Request, res: Response): Promise<void> => {
    try {
      const examResults = await prisma.examResult.findMany({
        where: {
          finishedAt: { not: null },
        },
        select: {
          score: true,
        },
      });
      
      const totalExams = examResults.length;
      const averageScore = totalExams > 0
        ? examResults.reduce((sum, exam) => sum + exam.score, 0) / totalExams
        : 0;
      
      // Get score distribution
      const passed = examResults.filter(e => e.score >= 60).length;
      const failed = examResults.filter(e => e.score < 60).length;
      const passRate = totalExams > 0 ? (passed / totalExams) * 100 : 0;
      
      res.status(200).json({
        success: true,
        message: 'Average exam score retrieved successfully',
        data: {
          averageScore: Math.round(averageScore * 10) / 10,
          totalExams,
          passedExams: passed,
          failedExams: failed,
          passRate: Math.round(passRate * 10) / 10,
        },
      });
    } catch (error) {
      console.error('Error getting average exam score:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error retrieving average exam score', 
        error: (error as Error).message 
      });
    }
  },

  // Get total questions answered
  getTotalQuestionsAnswered: async (req: Request, res: Response): Promise<void> => {
    try {
      const totalAnswers = await prisma.practiceAnswer.count();
      
      // Get unique questions answered
      const uniqueQuestions = await prisma.practiceAnswer.findMany({
        select: {
          questionId: true,
        },
        distinct: ['questionId'],
      });
      
      // Get correct vs incorrect
      const correctAnswers = await prisma.practiceAnswer.count({
        where: {
          isCorrect: true,
        },
      });
      
      const accuracy = totalAnswers > 0 
        ? (correctAnswers / totalAnswers) * 100 
        : 0;
      
      res.status(200).json({
        success: true,
        message: 'Total questions answered retrieved successfully',
        data: {
          totalAnswers,
          uniqueQuestions: uniqueQuestions.length,
          correctAnswers,
          incorrectAnswers: totalAnswers - correctAnswers,
          accuracy: Math.round(accuracy * 10) / 10,
        },
      });
    } catch (error) {
      console.error('Error getting total questions answered:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error retrieving total questions answered', 
        error: (error as Error).message 
      });
    }
  },

  // Get students by grade (for bar chart)
  getStudentsByGrade: async (req: Request, res: Response): Promise<void> => {
    try {
      const studentsByGrade = await prisma.user.groupBy({
        by: ['grade'],
        where: {
          role: 'student',
          grade: { not: null },
        },
        _count: {
          id: true,
        },
      });
      
      // Sort by grade
      const sortedData = studentsByGrade
        .map(item => ({
          grade: item.grade as number,
          count: item._count.id,
        }))
        .sort((a, b) => a.grade - b.grade);
      
      res.status(200).json({
        success: true,
        message: 'Students by grade retrieved successfully',
        data: sortedData,
      });
    } catch (error) {
      console.error('Error getting students by grade:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error retrieving students by grade', 
        error: (error as Error).message 
      });
    }
  },

  // Get lesson completion breakdown (for pie chart)
  getLessonCompletionBreakdown: async (req: Request, res: Response): Promise<void> => {
    try {
      const { fromDate, toDate } = req.query;
      
      // Build date filter if provided
      let dateFilter: any = {};
      if (fromDate && toDate) {
        dateFilter = {
          gte: new Date(fromDate as string),
          lte: new Date(toDate as string),
        };
      }
      
      const totalPracticeSessions = await prisma.practiceSession.count({
        where: {
          ...(fromDate && toDate ? { startedAt: dateFilter } : {}),
        },
      });
      
      const completed = await prisma.practiceSession.count({
        where: {
          finishedAt: { not: null, ...(fromDate && toDate ? dateFilter : {}) },
        },
      });
      
      const inProgress = await prisma.practiceSession.count({
        where: {
          finishedAt: null,
          ...(fromDate && toDate ? { startedAt: dateFilter } : {}),
        },
      });
      
      // Calculate percentages
      const completedPercentage = totalPracticeSessions > 0 
        ? (completed / totalPracticeSessions) * 100 
        : 0;
      const inProgressPercentage = totalPracticeSessions > 0 
        ? (inProgress / totalPracticeSessions) * 100 
        : 0;
      
      res.status(200).json({
        success: true,
        message: 'Lesson completion breakdown retrieved successfully',
        data: {
          completed: {
            count: completed,
            percentage: Math.round(completedPercentage * 10) / 10,
          },
          inProgress: {
            count: inProgress,
            percentage: Math.round(inProgressPercentage * 10) / 10,
          },
          total: totalPracticeSessions,
        },
      });
    } catch (error) {
      console.error('Error getting lesson completion breakdown:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error retrieving lesson completion breakdown', 
        error: (error as Error).message 
      });
    }
  },

  // Get monthly trend (average score and exam count by month)
  getMonthlyTrend: async (req: Request, res: Response): Promise<void> => {
    try {
      const { months = '6', fromDate, toDate } = req.query;
      const monthsCount = parseInt(months as string);
      
      // Get date range
      let startDate: Date;
      let endDate: Date;
      
      if (fromDate && toDate) {
        startDate = new Date(fromDate as string);
        endDate = new Date(toDate as string);
      } else {
        endDate = new Date();
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - monthsCount);
      }
      
      // Get all completed exams in the date range
      const examResults = await prisma.examResult.findMany({
        where: {
          finishedAt: {
            not: null,
            gte: startDate,
            lte: endDate,
          },
        },
        select: {
          score: true,
          finishedAt: true,
        },
      });
      
      // Group by month
      const monthlyData: { [key: string]: { scores: number[], count: number } } = {};
      
      examResults.forEach(exam => {
        if (exam.finishedAt) {
          const monthKey = `${exam.finishedAt.getFullYear()}-${String(exam.finishedAt.getMonth() + 1).padStart(2, '0')}`;
          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { scores: [], count: 0 };
          }
          monthlyData[monthKey].scores.push(exam.score);
          monthlyData[monthKey].count++;
        }
      });
      
      // Calculate averages and format data
      const trendData = Object.keys(monthlyData)
        .sort()
        .map(monthKey => {
          const data = monthlyData[monthKey];
          const averageScore = data.scores.length > 0
            ? data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length
            : 0;
          
          return {
            month: monthKey,
            averageScore: Math.round(averageScore * 10) / 10,
            examCount: data.count,
          };
        });
      
      res.status(200).json({
        success: true,
        message: 'Monthly trend retrieved successfully',
        data: trendData,
      });
    } catch (error) {
      console.error('Error getting monthly trend:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error retrieving monthly trend', 
        error: (error as Error).message 
      });
    }
  },

  // Get performance by topic (for radar chart)
  getPerformanceByTopic: async (req: Request, res: Response): Promise<void> => {
    try {
      const { fromDate, toDate } = req.query;
      
      // Build date filter if provided
      let dateFilter: any = {};
      if (fromDate && toDate) {
        dateFilter = {
          gte: new Date(fromDate as string),
          lte: new Date(toDate as string),
        };
      }
      
      // Get all completed practice sessions with lessons
      const practiceSessions = await prisma.practiceSession.findMany({
        where: {
          finishedAt: { not: null, ...(fromDate && toDate ? dateFilter : {}) },
          lessonId: { not: null },
        },
        include: {
          lesson: {
            select: {
              id: true,
              title: true,
              chapter: {
                select: {
                  title: true,
                },
              },
            },
          },
        },
      });
      
      // Group by chapter/topic
      const topicPerformance: { [key: string]: { scores: number[], count: number } } = {};
      
      practiceSessions.forEach(session => {
        if (session.lesson) {
          const topicKey = session.lesson.chapter.title;
          if (!topicPerformance[topicKey]) {
            topicPerformance[topicKey] = { scores: [], count: 0 };
          }
          topicPerformance[topicKey].scores.push(session.score);
          topicPerformance[topicKey].count++;
        }
      });
      
      // Calculate average performance for each topic
      const performanceData = Object.keys(topicPerformance).map(topic => {
        const data = topicPerformance[topic];
        const averageScore = data.scores.length > 0
          ? data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length
          : 0;
        
        return {
          topic,
          averageScore: Math.round(averageScore * 10) / 10,
          completionRate: data.count,
        };
      });
      
      res.status(200).json({
        success: true,
        message: 'Performance by topic retrieved successfully',
        data: performanceData,
      });
    } catch (error) {
      console.error('Error getting performance by topic:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error retrieving performance by topic', 
        error: (error as Error).message 
      });
    }
  },

  // Get weekly activity stats
  getWeeklyActivity: async (req: Request, res: Response): Promise<void> => {
    try {
      const { weeks = '4', fromDate, toDate } = req.query;
      const weeksCount = parseInt(weeks as string);
      
      // Get date range
      let startDate: Date;
      let endDate: Date;
      
      if (fromDate && toDate) {
        startDate = new Date(fromDate as string);
        endDate = new Date(toDate as string);
      } else {
        endDate = new Date();
        startDate = new Date();
        startDate.setDate(startDate.getDate() - (weeksCount * 7));
      }
      
      // Get practice sessions
      const practiceSessions = await prisma.practiceSession.findMany({
        where: {
          startedAt: { gte: startDate, lte: endDate },
        },
        select: {
          startedAt: true,
          finishedAt: true,
          userId: true,
        },
      });
      
      // Get exam results
      const examResults = await prisma.examResult.findMany({
        where: {
          startedAt: { gte: startDate, lte: endDate },
        },
        select: {
          startedAt: true,
          userId: true,
        },
      });
      
      // Get new user registrations
      const newUsers = await prisma.user.findMany({
        where: {
          createdAt: { gte: startDate, lte: endDate },
          role: 'student',
        },
        select: {
          createdAt: true,
        },
      });
      
      // Group by week
      const weeklyData: { [key: string]: { 
        lessonsCompleted: number, 
        activeUsers: Set<number>, 
        newRegistrations: number,
        examsCompleted: number,
      } } = {};
      
      // Helper function to get week key
      const getWeekKey = (date: Date) => {
        const weekStart = new Date(date);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        return weekStart.toISOString().split('T')[0];
      };
      
      // Process practice sessions
      practiceSessions.forEach(session => {
        const weekKey = getWeekKey(session.startedAt);
        if (!weeklyData[weekKey]) {
          weeklyData[weekKey] = { 
            lessonsCompleted: 0, 
            activeUsers: new Set(), 
            newRegistrations: 0,
            examsCompleted: 0,
          };
        }
        if (session.finishedAt) {
          weeklyData[weekKey].lessonsCompleted++;
        }
        weeklyData[weekKey].activeUsers.add(session.userId);
      });
      
      // Process exam results
      examResults.forEach(exam => {
        const weekKey = getWeekKey(exam.startedAt);
        if (!weeklyData[weekKey]) {
          weeklyData[weekKey] = { 
            lessonsCompleted: 0, 
            activeUsers: new Set(), 
            newRegistrations: 0,
            examsCompleted: 0,
          };
        }
        weeklyData[weekKey].examsCompleted++;
        weeklyData[weekKey].activeUsers.add(exam.userId);
      });
      
      // Process new registrations
      newUsers.forEach(user => {
        const weekKey = getWeekKey(user.createdAt);
        if (!weeklyData[weekKey]) {
          weeklyData[weekKey] = { 
            lessonsCompleted: 0, 
            activeUsers: new Set(), 
            newRegistrations: 0,
            examsCompleted: 0,
          };
        }
        weeklyData[weekKey].newRegistrations++;
      });
      
      // Format data
      const activityData = Object.keys(weeklyData)
        .sort()
        .map(weekKey => ({
          week: weekKey,
          lessonsCompleted: weeklyData[weekKey].lessonsCompleted,
          activeUsers: weeklyData[weekKey].activeUsers.size,
          newRegistrations: weeklyData[weekKey].newRegistrations,
          examsCompleted: weeklyData[weekKey].examsCompleted,
        }));
      
      res.status(200).json({
        success: true,
        message: 'Weekly activity retrieved successfully',
        data: activityData,
      });
    } catch (error) {
      console.error('Error getting weekly activity:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error retrieving weekly activity', 
        error: (error as Error).message 
      });
    }
  },

  // Get recent activity feed
  getRecentActivity: async (req: Request, res: Response): Promise<void> => {
    try {
      const { limit = '10' } = req.query;
      const limitCount = parseInt(limit as string);
      
      // Get recent exam completions
      const recentExams = await prisma.examResult.findMany({
        where: {
          finishedAt: { not: null },
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              fullName: true,
            },
          },
          exam: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: {
          finishedAt: 'desc',
        },
        take: limitCount,
      });
      
      // Get recent practice completions
      const recentPractice = await prisma.practiceSession.findMany({
        where: {
          finishedAt: { not: null },
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              fullName: true,
            },
          },
          lesson: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: {
          finishedAt: 'desc',
        },
        take: limitCount,
      });
      
      // Combine and format activities
      const activities = [
        ...recentExams.map(exam => ({
          type: 'exam',
          user: exam.user,
          title: exam.exam.title,
          score: Math.round(exam.score * 10) / 10,
          timestamp: exam.finishedAt,
          id: exam.id,
        })),
        ...recentPractice.map(practice => ({
          type: 'practice',
          user: practice.user,
          title: practice.lesson?.title || 'Practice Session',
          score: Math.round(practice.score * 10) / 10,
          timestamp: practice.finishedAt,
          id: practice.id,
        })),
      ]
        .sort((a, b) => {
          const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
          const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
          return timeB - timeA;
        })
        .slice(0, limitCount);
      
      res.status(200).json({
        success: true,
        message: 'Recent activity retrieved successfully',
        data: activities,
      });
    } catch (error) {
      console.error('Error getting recent activity:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error retrieving recent activity', 
        error: (error as Error).message 
      });
    }
  },

  // Get most wrong answers in practice
  getMostWrongAnswersPractice: async (req: Request, res: Response): Promise<void> => {
    try {
      const { limit = '20', fromDate, toDate } = req.query;
      const limitCount = parseInt(limit as string);
      
      // Build date filter if provided
      let dateFilter: any = {};
      if (fromDate && toDate) {
        dateFilter = {
          gte: new Date(fromDate as string),
          lte: new Date(toDate as string),
        };
      }
      
      // Get all incorrect practice answers
      const incorrectAnswers = await prisma.practiceAnswer.findMany({
        where: {
          isCorrect: false,
          ...(fromDate && toDate ? {
            practiceSession: {
              startedAt: dateFilter,
            },
          } : {}),
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
              userId: true,
              startedAt: true,
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
        commonWrongAnswers: { [key: number]: { answer: any; count: number } };
        students: Set<number>;
      } } = {};
      
      incorrectAnswers.forEach(answer => {
        const questionId = answer.questionId;
        
        if (!questionStats[questionId]) {
          questionStats[questionId] = {
            question: answer.question,
            wrongCount: 0,
            totalAttempts: 0,
            wrongPercentage: 0,
            commonWrongAnswers: {},
            students: new Set(),
          };
        }
        
        questionStats[questionId].wrongCount++;
        questionStats[questionId].students.add(answer.practiceSession.userId);
        
        // Track common wrong answers
        const chosenAnswerId = answer.chosenAnswerId;
        if (!questionStats[questionId].commonWrongAnswers[chosenAnswerId]) {
          questionStats[questionId].commonWrongAnswers[chosenAnswerId] = {
            answer: answer.chosenAnswer,
            count: 0,
          };
        }
        questionStats[questionId].commonWrongAnswers[chosenAnswerId].count++;
      });
      
      // Get total attempts for each question
      const allAnswers = await prisma.practiceAnswer.findMany({
        where: {
          questionId: { in: Object.keys(questionStats).map(id => parseInt(id)) },
          ...(fromDate && toDate ? {
            practiceSession: {
              startedAt: dateFilter,
            },
          } : {}),
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
          
          // Sort common wrong answers by count
          const commonWrongAnswers = Object.values(stat.commonWrongAnswers)
            .sort((a, b) => b.count - a.count)
            .slice(0, 3); // Top 3 wrong answers
          
          return {
            questionId: stat.question.id,
            questionText: stat.question.questionText,
            questionImage: stat.question.imageUrl,
            grade: stat.question.grade,
            lesson: stat.question.lesson,
            wrongCount: stat.wrongCount,
            totalAttempts: stat.totalAttempts,
            wrongPercentage: Math.round(wrongPercentage * 10) / 10,
            uniqueStudents: stat.students.size,
            correctAnswer: correctAnswer ? {
              id: correctAnswer.id,
              answerText: correctAnswer.answerText,
            } : null,
            commonWrongAnswers: commonWrongAnswers.map(wa => ({
              id: wa.answer.id,
              answerText: wa.answer.answerText,
              count: wa.count,
              percentage: Math.round((wa.count / stat.wrongCount) * 100 * 10) / 10,
            })),
            explanationText: stat.question.explanationText,
            explanationImg: stat.question.explanationImg,
          };
        })
        .sort((a, b) => b.wrongCount - a.wrongCount)
        .slice(0, limitCount);
      
      res.status(200).json({
        success: true,
        message: 'Most wrong answers in practice retrieved successfully',
        data: formattedStats,
      });
    } catch (error) {
      console.error('Error getting most wrong answers in practice:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error retrieving most wrong answers in practice', 
        error: (error as Error).message 
      });
    }
  },

  // Get most wrong answers in exams
  getMostWrongAnswersExam: async (req: Request, res: Response): Promise<void> => {
    try {
      const { limit = '20', fromDate, toDate } = req.query;
      const limitCount = parseInt(limit as string);
      
      // Build date filter if provided
      let dateFilter: any = {};
      if (fromDate && toDate) {
        dateFilter = {
          gte: new Date(fromDate as string),
          lte: new Date(toDate as string),
        };
      }
      
      // Get all incorrect exam answers
      const incorrectAnswers = await prisma.examAnswer.findMany({
        where: {
          isCorrect: false,
          ...(fromDate && toDate ? {
            examResult: {
              startedAt: dateFilter,
            },
          } : {}),
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
              userId: true,
              startedAt: true,
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
        commonWrongAnswers: { [key: number]: { answer: any; count: number } };
        students: Set<number>;
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
            commonWrongAnswers: {},
            students: new Set(),
            exams: new Set(),
          };
        }
        
        questionStats[questionId].wrongCount++;
        questionStats[questionId].students.add(answer.examResult.userId);
        questionStats[questionId].exams.add(answer.examResult.exam.id);
        
        // Track common wrong answers
        const chosenAnswerId = answer.chosenAnswerId;
        if (!questionStats[questionId].commonWrongAnswers[chosenAnswerId]) {
          questionStats[questionId].commonWrongAnswers[chosenAnswerId] = {
            answer: answer.chosenAnswer,
            count: 0,
          };
        }
        questionStats[questionId].commonWrongAnswers[chosenAnswerId].count++;
      });
      
      // Get total attempts for each question
      const allAnswers = await prisma.examAnswer.findMany({
        where: {
          questionId: { in: Object.keys(questionStats).map(id => parseInt(id)) },
          ...(fromDate && toDate ? {
            examResult: {
              startedAt: dateFilter,
            },
          } : {}),
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
          
          // Sort common wrong answers by count
          const commonWrongAnswers = Object.values(stat.commonWrongAnswers)
            .sort((a, b) => b.count - a.count)
            .slice(0, 3); // Top 3 wrong answers
          
          return {
            questionId: stat.question.id,
            questionText: stat.question.questionText,
            questionImage: stat.question.imageUrl,
            grade: stat.question.grade,
            wrongCount: stat.wrongCount,
            totalAttempts: stat.totalAttempts,
            wrongPercentage: Math.round(wrongPercentage * 10) / 10,
            uniqueStudents: stat.students.size,
            appearsInExams: stat.exams.size,
            correctAnswer: correctAnswer ? {
              id: correctAnswer.id,
              answerText: correctAnswer.answerText,
            } : null,
            commonWrongAnswers: commonWrongAnswers.map(wa => ({
              id: wa.answer.id,
              answerText: wa.answer.answerText,
              count: wa.count,
              percentage: Math.round((wa.count / stat.wrongCount) * 100 * 10) / 10,
            })),
            explanationText: stat.question.explanationText,
            explanationImg: stat.question.explanationImg,
          };
        })
        .sort((a, b) => b.wrongCount - a.wrongCount)
        .slice(0, limitCount);
      
      res.status(200).json({
        success: true,
        message: 'Most wrong answers in exams retrieved successfully',
        data: formattedStats,
      });
    } catch (error) {
      console.error('Error getting most wrong answers in exams:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error retrieving most wrong answers in exams', 
        error: (error as Error).message 
      });
    }
  },
};

export default adminStatsController;
