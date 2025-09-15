import prisma from '../prisma/prisma.js';
import { Request, Response } from 'express';
import { Controller, RequestWithQuery } from '../types/index.js';

const explanationController: Controller = {
  // Get all explanations with optional filtering
  getAllExplanations: async (req: Request, res: Response): Promise<void> => {
    try {
      const explanations = await prisma.explanation.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          question: true, // Include the related question
        },
      });
      
      res.status(200).json({ explanations });
    } catch (error) {
      console.error('Error getting explanations:', error);
      res.status(500).json({ message: 'Error getting explanations', error: (error as Error).message });
    }
  },
  
  // Get explanation by ID
  getExplanationById: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      const explanation = await prisma.explanation.findUnique({
        where: { id: parseInt(id) },
        include: {
          question: true, // Include related question
        },
      });
      
      if (!explanation) {
        res.status(404).json({ message: 'Explanation not found' });
        return;
      }
      
      res.status(200).json({ explanation });
    } catch (error) {
      console.error('Error getting explanation:', error);
      res.status(500).json({ message: 'Error getting explanation', error: (error as Error).message });
    }
  },
  
  // Get explanations by question ID
  getExplanationsByQuestionId: async (req: Request, res: Response): Promise<void> => {
    try {
      const { questionId } = req.params;
      
      const explanations = await prisma.explanation.findMany({
        where: { questionId: parseInt(questionId) },
        orderBy: {
          createdAt: 'desc',
        },
      });
      
      res.status(200).json({ explanations });
    } catch (error) {
      console.error('Error getting explanations by question:', error);
      res.status(500).json({ message: 'Error getting explanations by question', error: (error as Error).message });
    }
  },
  
  // Get explanations by grade (through question relation)
  getExplanationsByGrade: async (req: Request, res: Response): Promise<void> => {
    try {
      const { grade } = req.params;
      
      const explanations = await prisma.explanation.findMany({
        where: {
          question: {
            grade: parseInt(grade)
          }
        },
        include: {
          question: true, // Include the related question
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      
      res.status(200).json({ explanations });
    } catch (error) {
      console.error('Error getting explanations by grade:', error);
      res.status(500).json({ message: 'Error getting explanations by grade', error: (error as Error).message });
    }
  },
  
  // Get explanations by lesson ID (through question relation)
  getExplanationsByLessonId: async (req: Request, res: Response): Promise<void> => {
    try {
      const { lessonId } = req.params;
      
      const explanations = await prisma.explanation.findMany({
        where: {
          question: {
            lessonId: parseInt(lessonId)
          }
        },
        include: {
          question: true, // Include the related question
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      
      res.status(200).json({ explanations });
    } catch (error) {
      console.error('Error getting explanations by lesson:', error);
      res.status(500).json({ message: 'Error getting explanations by lesson', error: (error as Error).message });
    }
  },
  
  // Search explanations by content
  searchExplanations: async (req: Request, res: Response): Promise<void> => {
    try {
      const { query } = req.query;
      
      if (!query || typeof query !== 'string') {
        res.status(400).json({ message: 'Search query is required' });
        return;
      }
      
      const explanations = await prisma.explanation.findMany({
        where: {
          content: {
            contains: query,
            mode: 'insensitive' // Case-insensitive search
          }
        },
        include: {
          question: true, // Include the related question
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      
      res.status(200).json({ explanations });
    } catch (error) {
      console.error('Error searching explanations:', error);
      res.status(500).json({ message: 'Error searching explanations', error: (error as Error).message });
    }
  }
};

export default explanationController;