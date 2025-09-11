import prisma from '../prisma/prisma.js';
import { Request, Response } from 'express';
import { Controller, RequestWithQuery, QuestionQuery } from '../types/index.js';

const questionController: Controller = {
  // Get all questions with optional filtering
  getAllQuestions: async (req: RequestWithQuery<QuestionQuery>, res: Response): Promise<void> => {
    try {
      const { grade, topic, type } = req.query;
      
      const whereClause: {
        grade?: number;
        topic?: string;
        type?: string;
      } = {};
      
      if (grade) {
        whereClause.grade = parseInt(grade);
      }
      
      if (topic) {
        whereClause.topic = topic;
      }
      
      if (type) {
        whereClause.type = type;
      }
      
      const questions = await prisma.question.findMany({
        where: whereClause,
        orderBy: [
          { grade: 'asc' },
          { createdAt: 'desc' },
        ],
        include: {
          answers: true, // Include associated answers
        },
      });
      
      res.status(200).json({ questions });
    } catch (error) {
      console.error('Error getting questions:', error);
      res.status(500).json({ message: 'Error getting questions', error: (error as Error).message });
    }
  },
  
  // Get a specific question by ID
  getQuestionById: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      const question = await prisma.question.findUnique({
        where: { id: parseInt(id) },
        include: {
          answers: true, // Include associated answers
          explanations: true, // Include explanations
        },
      });
      
      if (!question) {
        res.status(404).json({ message: 'Question not found' });
        return;
      }
      
      res.status(200).json({ question });
    } catch (error) {
      console.error('Error getting question:', error);
      res.status(500).json({ message: 'Error getting question', error: (error as Error).message });
    }
  },
  
  // Get questions by grade
  getQuestionsByGrade: async (req: Request, res: Response): Promise<void> => {
    try {
      const { grade } = req.params;
      
      const questions = await prisma.question.findMany({
        where: { grade: parseInt(grade) },
        include: {
          answers: true, // Include associated answers
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      
      res.status(200).json({ questions });
    } catch (error) {
      console.error('Error getting questions by grade:', error);
      res.status(500).json({ message: 'Error getting questions by grade', error: (error as Error).message });
    }
  },

  // Get questions by topic
  getQuestionsByTopic: async (req: Request, res: Response): Promise<void> => {
    try {
      const { topic } = req.params;
      
      const questions = await prisma.question.findMany({
        where: { topic },
        include: {
          answers: true, // Include associated answers
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      
      res.status(200).json({ questions });
    } catch (error) {
      console.error('Error getting questions by topic:', error);
      res.status(500).json({ message: 'Error getting questions by topic', error: (error as Error).message });
    }
  },
};

export default questionController;
