import prisma from '../prisma/prisma.js';
import { Request, Response } from 'express';
import { Controller, RequestWithQuery } from '../types/index.js';

const examController: Controller = {
  // Get all exams with optional filtering
  getAllExams: async (req: Request, res: Response): Promise<void> => {
    try {
      const { grade, chapterId } = req.query;
      
      const whereClause: {
        grade?: number;
        chapterId?: number;
      } = {};
      
      if (grade) {
        whereClause.grade = parseInt(grade as string);
      }
      
      if (chapterId) {
        whereClause.chapterId = parseInt(chapterId as string);
      }
      
      const exams = await prisma.exam.findMany({
        where: whereClause,
        orderBy: [
          { grade: 'asc' },
          { createdAt: 'desc' },
        ],
        include: {
          // chapter: true, // Temporarily removed until Prisma client is regenerated
          examQuestions: {
            include: {
              question: {
                include: {
                  answers: true,
                },
              },
            },
          },
        },
      });
      
      res.status(200).json({ exams });
    } catch (error) {
      console.error('Error getting exams:', error);
      res.status(500).json({ message: 'Error getting exams', error: (error as Error).message });
    }
  },
  
  // Get a specific exam by ID
  getExamById: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      const exam = await prisma.exam.findUnique({
        where: { id: parseInt(id) },
        include: {
          // chapter: true, // Temporarily removed until Prisma client is regenerated
          examQuestions: {
            include: {
              question: {
                include: {
                  answers: true,
                },
              },
            },
          },
        },
      });
      
      if (!exam) {
        res.status(404).json({ message: 'Exam not found' });
        return;
      }
      
      res.status(200).json({ exam });
    } catch (error) {
      console.error('Error getting exam:', error);
      res.status(500).json({ message: 'Error getting exam', error: (error as Error).message });
    }
  },
  
  // Get exams by grade
  getExamsByGrade: async (req: Request, res: Response): Promise<void> => {
    try {
      const { grade } = req.params;
      
      const exams = await prisma.exam.findMany({
        where: { grade: parseInt(grade) },
        include: {
          examQuestions: {
            include: {
              question: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      
      res.status(200).json({ exams });
    } catch (error) {
      console.error('Error getting exams by grade:', error);
      res.status(500).json({ message: 'Error getting exams by grade', error: (error as Error).message });
    }
  },
  
  // Get exams by chapter
  getExamsByChapter: async (req: Request, res: Response): Promise<void> => {
    try {
      const { chapterId } = req.params;
      
      const exams = await prisma.exam.findMany({
        where: { chapterId: parseInt(chapterId) },
        include: {
          // chapter: true, // Temporarily removed until Prisma client is regenerated
          examQuestions: {
            include: {
              question: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      
      res.status(200).json({ exams });
    } catch (error) {
      console.error('Error getting exams by chapter:', error);
      res.status(500).json({ message: 'Error getting exams by chapter', error: (error as Error).message });
    }
  },
  
  // Get exam results for a specific user
  getExamResultsByUser: async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      
      const examResults = await prisma.examResult.findMany({
        where: { userId: parseInt(userId) },
        include: {
          exam: true,
          examAnswers: {
            include: {
              question: true,
              chosenAnswer: true,
            },
          },
        },
        orderBy: {
          finishedAt: 'desc',
        },
      });
      
      res.status(200).json({ examResults });
    } catch (error) {
      console.error('Error getting exam results:', error);
      res.status(500).json({ message: 'Error getting exam results', error: (error as Error).message });
    }
  },
  
  // Get a specific exam result by ID
  getExamResultById: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      const examResult = await prisma.examResult.findUnique({
        where: { id: parseInt(id) },
        include: {
          exam: true,
          user: {
            select: {
              id: true,
              username: true,
              fullName: true,
              role: true,
            }
          },
          examAnswers: {
            include: {
              question: true,
              chosenAnswer: true,
            },
          },
        },
      });
      
      if (!examResult) {
        res.status(404).json({ message: 'Exam result not found' });
        return;
      }
      
      res.status(200).json({ examResult });
    } catch (error) {
      console.error('Error getting exam result:', error);
      res.status(500).json({ message: 'Error getting exam result', error: (error as Error).message });
    }
  }
};

export default examController;