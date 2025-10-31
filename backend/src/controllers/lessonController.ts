import prisma from '../prisma/prisma.js';
import { Request, Response } from 'express';
import { Controller, RequestWithQuery } from '../types/index.js';
import { 
  sendSuccessResponse, 
  sendSuccessNoDataResponse, 
  sendNotFoundResponse, 
  sendErrorResponse,
  sendBadRequestResponse
} from '../utils/apiResponse.js';
import { CreateLessonInput, UpdateLessonInput } from '../schemas/lesson.schema.js';

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
          { id: 'asc' },
        ],
      });
      
      sendSuccessResponse(res, { lessons }, 'Lessons retrieved successfully');
    } catch (error) {
      console.error('Error getting lessons:', error);
      sendErrorResponse(res, 'Error retrieving lessons');
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
        sendNotFoundResponse(res, 'Lesson not found');
        return;
      }
      
      sendSuccessResponse(res, { lesson }, 'Lesson retrieved successfully');
    } catch (error) {
      console.error('Error getting lesson:', error);
      sendErrorResponse(res, 'Error retrieving lesson');
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
          id: 'asc',
        },
      });
      
      sendSuccessResponse(res, { lessons }, 'Chapter lessons retrieved successfully');
    } catch (error) {
      console.error('Error getting lessons by chapter:', error);
      sendErrorResponse(res, 'Error retrieving lessons');
    }
  },

  // Create a new lesson
  createLesson: async (req: Request, res: Response): Promise<void> => {
    try {
      const lessonData: CreateLessonInput = req.body;

      // Check if chapter exists
      const chapter = await prisma.chapter.findUnique({
        where: { id: lessonData.chapterId }
      });

      if (!chapter) {
        sendBadRequestResponse(res, `Chapter with ID ${lessonData.chapterId} not found`);
        return;
      }

      // Only allow whitelisted fields to be written to avoid passing an explicit id
      const lesson = await prisma.lesson.create({
        data: {
          chapterId: lessonData.chapterId,
          title: lessonData.title,
          videoUrl: lessonData.videoUrl ?? null,
          imageUrl: lessonData.imageUrl ?? null,
        },
        include: {
          chapter: true
        }
      });

      sendSuccessResponse(res, { lesson }, 'Lesson created successfully', 201);
    } catch (error) {
      console.error('Error creating lesson:', error);
      sendErrorResponse(res, 'Failed to create lesson');
    }
  },

  // Update a lesson
  updateLesson: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const lessonData: UpdateLessonInput = req.body;

      // Check if lesson exists
      const existingLesson = await prisma.lesson.findUnique({
        where: { id: parseInt(id) }
      });

      if (!existingLesson) {
        sendNotFoundResponse(res, 'Lesson not found');
        return;
      }

      // Check if chapter exists if chapterId is provided
      if (lessonData.chapterId) {
        const chapter = await prisma.chapter.findUnique({
          where: { id: lessonData.chapterId }
        });

        if (!chapter) {
          sendBadRequestResponse(res, `Chapter with ID ${lessonData.chapterId} not found`);
          return;
        }
      }

      // Only update allowed fields
      const updatedLesson = await prisma.lesson.update({
        where: { id: parseInt(id) },
        data: {
          ...(lessonData.chapterId !== undefined ? { chapterId: lessonData.chapterId } : {}),
          ...(lessonData.title !== undefined ? { title: lessonData.title } : {}),
          ...(lessonData.videoUrl !== undefined ? { videoUrl: lessonData.videoUrl } : {}),
          ...(lessonData.imageUrl !== undefined ? { imageUrl: lessonData.imageUrl } : {}),
        },
        include: {
          chapter: true
        }
      });

      sendSuccessResponse(res, { lesson: updatedLesson }, 'Lesson updated successfully');
    } catch (error) {
      console.error('Error updating lesson:', error);
      sendErrorResponse(res, 'Failed to update lesson');
    }
  },

  // Delete a lesson
  deleteLesson: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const lessonId = parseInt(id);

      // Check if lesson exists
      const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId },
        include: {
          questions: true
        }
      });

      if (!lesson) {
        sendNotFoundResponse(res, 'Lesson not found');
        return;
      }

      // Check if lesson has related questions
      if (lesson.questions.length > 0) {
        sendBadRequestResponse(res, 'Cannot delete lesson with existing questions. Delete related questions first.');
        return;
      }

      await prisma.lesson.delete({
        where: { id: lessonId }
      });

      sendSuccessNoDataResponse(res, 'Lesson deleted successfully');
    } catch (error) {
      console.error('Error deleting lesson:', error);
      sendErrorResponse(res, 'Failed to delete lesson');
    }
  }
};

export default lessonController;
