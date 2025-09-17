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
  },

  // Start an exam for a user
  startExam: async (req: Request, res: Response): Promise<void> => {
    try {
      const { examId, userId } = req.body;
      
      // Check if exam exists
      const exam = await prisma.exam.findUnique({
        where: { id: examId },
        include: {
          examQuestions: {
            include: {
              question: true,
            },
          },
        },
      });
      
      if (!exam) {
        res.status(404).json({ message: 'Exam not found' });
        return;
      }
      
      // Check if user already has an active exam result for this exam
      const existingResult = await prisma.examResult.findFirst({
        where: {
          examId: examId,
          userId: userId,
          finishedAt: null, // Not finished yet
        },
      });
      
      if (existingResult) {
        res.status(400).json({ message: 'User already has an active exam for this test' });
        return;
      }
      
      // Create new exam result
      const examResult = await prisma.examResult.create({
        data: {
          examId: examId,
          userId: userId,
          score: 0,
          startedAt: new Date(),
        },
        include: {
          exam: true,
        },
      });
      
      res.status(201).json({ 
        message: 'Exam started successfully',
        examResult,
        totalQuestions: exam.examQuestions.length,
        durationMinutes: exam.durationMinutes,
      });
    } catch (error) {
      console.error('Error starting exam:', error);
      res.status(500).json({ message: 'Error starting exam', error: (error as Error).message });
    }
  },

  // Save an answer during the exam
  saveExamAnswer: async (req: Request, res: Response): Promise<void> => {
    try {
      const { resultId, questionId, chosenAnswerId, isFlagged = false } = req.body;
      
      // Check if exam result exists and is not finished
      const examResult = await prisma.examResult.findUnique({
        where: { id: resultId },
        include: {
          exam: true,
        },
      });
      
      if (!examResult) {
        res.status(404).json({ message: 'Exam result not found' });
        return;
      }
      
      if (examResult.finishedAt) {
        res.status(400).json({ message: 'Cannot save answer for completed exam' });
        return;
      }
      
      // Check if the question belongs to this exam
      const examQuestion = await prisma.examQuestion.findFirst({
        where: {
          examId: examResult.examId,
          questionId: questionId,
        },
      });
      
      if (!examQuestion) {
        res.status(400).json({ message: 'Question does not belong to this exam' });
        return;
      }
      
      // Get the correct answer for this question
      const correctAnswer = await prisma.answer.findFirst({
        where: {
          questionId: questionId,
          isCorrect: true,
        },
      });
      
      const isCorrect = correctAnswer ? correctAnswer.id === chosenAnswerId : false;
      
      // Check if answer already exists for this question in this exam result
      const existingAnswer = await prisma.examAnswer.findFirst({
        where: {
          resultId: resultId,
          questionId: questionId,
        },
      });
      
      let examAnswer;
      if (existingAnswer) {
        // Update existing answer
        examAnswer = await prisma.examAnswer.update({
          where: { id: existingAnswer.id },
          data: {
            chosenAnswerId: chosenAnswerId,
            isCorrect: isCorrect,
            isFlagged: isFlagged,
          },
          include: {
            question: true,
            chosenAnswer: true,
          },
        });
      } else {
        // Create new answer
        examAnswer = await prisma.examAnswer.create({
          data: {
            resultId: resultId,
            questionId: questionId,
            chosenAnswerId: chosenAnswerId,
            isCorrect: isCorrect,
            isFlagged: isFlagged,
          },
          include: {
            question: true,
            chosenAnswer: true,
          },
        });
      }
      
      res.status(200).json({ 
        message: 'Answer saved successfully',
        examAnswer,
      });
    } catch (error) {
      console.error('Error saving exam answer:', error);
      res.status(500).json({ message: 'Error saving exam answer', error: (error as Error).message });
    }
  },

  // Finish an exam and calculate final score
  finishExam: async (req: Request, res: Response): Promise<void> => {
    try {
      const { resultId } = req.params;
      
      // Get exam result with all answers
      const examResult = await prisma.examResult.findUnique({
        where: { id: parseInt(resultId) },
        include: {
          exam: {
            include: {
              examQuestions: true,
            },
          },
          examAnswers: true,
        },
      });
      
      if (!examResult) {
        res.status(404).json({ message: 'Exam result not found' });
        return;
      }
      
      if (examResult.finishedAt) {
        res.status(400).json({ message: 'Exam already finished' });
        return;
      }
      
      // Calculate score
      const totalQuestions = examResult.exam.examQuestions.length;
      const correctAnswers = examResult.examAnswers.filter(answer => answer.isCorrect).length;
      const score = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
      
      // Update exam result with final score and finish time
      const updatedExamResult = await prisma.examResult.update({
        where: { id: parseInt(resultId) },
        data: {
          score: score,
          finishedAt: new Date(),
        },
        include: {
          exam: true,
          user: {
            select: {
              id: true,
              username: true,
              fullName: true,
            },
          },
          examAnswers: {
            include: {
              question: true,
              chosenAnswer: true,
            },
          },
        },
      });
      
      // Create progress history entry
      await prisma.progressHistory.create({
        data: {
          userId: examResult.userId,
          examResultId: parseInt(resultId),
          status: score >= 60 ? 'completed' : 'failed',
        },
      });
      
      res.status(200).json({ 
        message: 'Exam finished successfully',
        examResult: updatedExamResult,
        score: score,
        correctAnswers: correctAnswers,
        totalQuestions: totalQuestions,
        passed: score >= 60,
      });
    } catch (error) {
      console.error('Error finishing exam:', error);
      res.status(500).json({ message: 'Error finishing exam', error: (error as Error).message });
    }
  },

  // Get current exam progress for a user
  getExamProgress: async (req: Request, res: Response): Promise<void> => {
    try {
      const { resultId } = req.params;
      
      const examResult = await prisma.examResult.findUnique({
        where: { id: parseInt(resultId) },
        include: {
          exam: {
            include: {
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
      
      if (examResult.finishedAt) {
        res.status(400).json({ message: 'Exam already finished' });
        return;
      }
      
      // Calculate time remaining
      const timeElapsed = Date.now() - examResult.startedAt.getTime();
      const timeRemaining = Math.max(0, (examResult.exam.durationMinutes * 60 * 1000) - timeElapsed);
      
      res.status(200).json({ 
        examResult,
        timeRemaining: Math.floor(timeRemaining / 1000), // in seconds
        answeredQuestions: examResult.examAnswers.length,
        totalQuestions: examResult.exam.examQuestions.length,
      });
    } catch (error) {
      console.error('Error getting exam progress:', error);
      res.status(500).json({ message: 'Error getting exam progress', error: (error as Error).message });
    }
  }
};

export default examController;