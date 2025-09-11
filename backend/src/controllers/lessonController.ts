import prisma from '../prisma/prisma.js';
import { Request, Response } from 'express';
import { Controller, RequestWithQuery } from '../types/index.js';

interface LessonQuery {
  chapterId?: string;
}

const lessonController: Controller = {
  // Get all lessons with optional filtering
  getAllLessons: async (req: RequestWithQuery<LessonQuery>, res: Response): Promise<void> => {
    try {
      const { chapterId } = req.query;
      
      const whereClause: {
        chapterId?: number;
      } = {};
      
      if (chapterId) {
        whereClause.chapterId = parseInt(chapterId);
      }
      
      const lessons = await prisma.lesson.findMany({
        where: whereClause,
        include: {
          chapter: true,
        },
        orderBy: [
          { chapterId: 'asc' },
          { lessonNumber: 'asc' },
        ],
      });
      
      res.status(200).json({ lessons });
    } catch (error) {
      console.error('Error getting lessons:', error);
      res.status(500).json({ message: 'Error retrieving lessons', error: (error as Error).message });
    }
  },
  
  // Get lesson by ID
  getLessonById: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      const lesson = await prisma.lesson.findUnique({
        where: { id: parseInt(id) },
        include: {
          chapter: true,
        },
      });
      
      if (!lesson) {
        res.status(404).json({ message: 'Lesson not found' });
        return;
      }
      
      res.status(200).json({ lesson });
    } catch (error) {
      console.error('Error getting lesson:', error);
      res.status(500).json({ message: 'Error retrieving lesson', error: (error as Error).message });
    }
  },
  
  // Get lessons by chapter
  getLessonsByChapter: async (req: Request, res: Response): Promise<void> => {
    try {
      const { chapterId } = req.params;
      
      const lessons = await prisma.lesson.findMany({
        where: {
          chapterId: parseInt(chapterId),
        },
        orderBy: {
          lessonNumber: 'asc',
        },
      });
      
      res.status(200).json({ lessons });
    } catch (error) {
      console.error('Error getting lessons by chapter:', error);
      res.status(500).json({ message: 'Error retrieving lessons', error: (error as Error).message });
    }
  },
};

export default lessonController;
