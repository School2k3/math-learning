import prisma from '../prisma/prisma.js';
import { Request, Response } from 'express';
import { Controller, RequestWithQuery, QuestionQuery } from '../types/index.js';

const questionController: Controller = {
  // Get all questions with optional filtering
  getAllQuestions: async (req: RequestWithQuery<QuestionQuery>, res: Response): Promise<void> => {
    try {
      const { grade, type, answerType } = req.query;
      
      const whereClause: {
        grade?: number;
        type?: string;
        answerType?: string;
      } = {};
      
      if (grade) {
        whereClause.grade = parseInt(grade);
      }
      
      if (type) {
        whereClause.type = type;
      }
      
      if (answerType) {
        whereClause.answerType = answerType;
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

  // Get questions by lesson
  getQuestionsByLesson: async (req: Request, res: Response): Promise<void> => {
    try {
      const { lessonId } = req.params;
      
      const questions = await prisma.question.findMany({
        where: { 
          lessonId: parseInt(lessonId)
        },
        include: {
          answers: true, // Include associated answers
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      
      res.status(200).json({ questions });
    } catch (error) {
      console.error('Error getting questions by lesson:', error);
      res.status(500).json({ message: 'Error getting questions by lesson', error: (error as Error).message });
    }
  },

  // Get questions by exam
  getQuestionsByExamId: async (req: Request, res: Response): Promise<void> => {
    try {
      const { examId } = req.params;
      
      // Find all questions associated with the specified exam through the join table
      const examQuestions = await prisma.examQuestion.findMany({
        where: { 
          examId: parseInt(examId)
        },
        include: {
          question: {
            include: {
              answers: true, // Include answers for each question
            }
          }
        },
      });
      
      // Extract just the questions from the results
      const questions = examQuestions.map(eq => eq.question);
      
      res.status(200).json({ questions });
    } catch (error) {
      console.error('Error getting questions by exam:', error);
      res.status(500).json({ message: 'Error getting questions by exam', error: (error as Error).message });
    }
  },
  
  // Get practice questions by lesson
  getPracticeQuestionsByLesson: async (req: Request, res: Response): Promise<void> => {
    try {
      const { lessonId } = req.params;
      
      const questions = await prisma.question.findMany({
        where: { 
          lessonId: parseInt(lessonId),
          type: 'practice' // Only get practice questions
        },
        include: {
          answers: true, // Include associated answers
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      
      res.status(200).json({ questions });
    } catch (error) {
      console.error('Error getting practice questions by lesson:', error);
      res.status(500).json({ message: 'Error getting practice questions by lesson', error: (error as Error).message });
    }
  },

  // Get audio by question ID
  getQuestionAudio: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      const question = await prisma.question.findUnique({
        where: { id: parseInt(id) },
        select: { 
          id: true,
          audioUrl: true,
        },
      });
      
      if (!question) {
        res.status(404).json({ message: 'Question not found' });
        return;
      }
      
      if (!question.audioUrl) {
        res.status(404).json({ message: 'Audio not found for this question' });
        return;
      }
      
      res.status(200).json({ 
        id: question.id,
        audioUrl: question.audioUrl 
      });
    } catch (error) {
      console.error('Error getting question audio:', error);
      res.status(500).json({ message: 'Error getting question audio', error: (error as Error).message });
    }
  }
};

export default questionController;
