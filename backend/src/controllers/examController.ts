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
  
  // Get all exam results by exam ID
  getExamResultsByExamId: async (req: Request, res: Response): Promise<void> => {
    try {
      const { examId } = req.params;
      const { includefinished = 'true', includeactive = 'true' } = req.query;
      
      // Check if exam exists
      const exam = await prisma.exam.findUnique({
        where: { id: parseInt(examId) },
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
      
      // Build where clause based on query parameters
      const whereClause: any = {
        examId: parseInt(examId),
      };
      
      // Filter by status if specified
      if (includefinished === 'false' && includeactive === 'true') {
        whereClause.finishedAt = null;
        whereClause.isActive = true;
      } else if (includefinished === 'true' && includeactive === 'false') {
        whereClause.finishedAt = { not: null };
        whereClause.isActive = false;
      }
      // If both are true or both are false, include all results
      
      const examResults = await prisma.examResult.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              fullName: true,
              role: true,
              grade: true,
            },
          },
          examAnswers: {
            include: {
              question: {
                select: {
                  id: true,
                  questionText: true,
                },
              },
              chosenAnswer: {
                select: {
                  id: true,
                  answerText: true,
                  isCorrect: true,
                },
              },
            },
          },
        },
        orderBy: [
          { finishedAt: 'desc' },
          { startedAt: 'desc' },
        ],
      });
      
      // Calculate statistics
      const finishedResults = examResults.filter(result => result.finishedAt);
      const totalAttempts = examResults.length;
      const averageScore = finishedResults.length > 0 
        ? finishedResults.reduce((sum, result) => sum + result.score, 0) / finishedResults.length
        : 0;
      const passedResults = finishedResults.filter(result => result.score >= 60);
      const passRate = finishedResults.length > 0 ? (passedResults.length / finishedResults.length) * 100 : 0;
      
      res.status(200).json({ 
        examResults,
        exam: {
          id: exam.id,
          title: exam.title,
          grade: exam.grade,
          durationMinutes: exam.durationMinutes,
          totalQuestions: exam.examQuestions.length,
        },
        statistics: {
          totalAttempts,
          finishedAttempts: finishedResults.length,
          activeAttempts: examResults.filter(result => result.isActive && !result.finishedAt).length,
          averageScore: Math.round(averageScore * 100) / 100,
          passRate: Math.round(passRate * 100) / 100,
        },
      });
    } catch (error) {
      console.error('Error getting exam results by exam ID:', error);
      res.status(500).json({ message: 'Error getting exam results by exam ID', error: (error as Error).message });
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
          isActive: true,
          finishedAt: null, // Not finished yet
        },
        include: {
          exam: true,
          examAnswers: {
            include: {
              question: true,
              chosenAnswer: true,
            }
          }
        }
      });
      
      // If there's an active exam, check if it's still within the time limit
      if (existingResult) {
        const startTime = existingResult.startedAt.getTime();
        const currentTime = Date.now();
        const durationInMs = existingResult.exam.durationMinutes * 60 * 1000;
        
        // Check if the exam is still within time limit
        if (currentTime - startTime < durationInMs) {
          // Exam is still active and within time limit, return it for continuation
          const timeRemaining = Math.max(0, durationInMs - (currentTime - startTime));
          
          res.status(200).json({ 
            message: 'Resuming existing exam',
            isResumed: true,
            examResult: existingResult,
            totalQuestions: exam.examQuestions.length,
            answeredQuestions: existingResult.examAnswers.length,
            timeRemaining: Math.floor(timeRemaining / 1000), // in seconds
            durationMinutes: exam.durationMinutes
          });
          return;
        } else {
          // Time's up for the existing exam, mark it as finished automatically
          await prisma.examResult.update({
            where: { id: existingResult.id },
            data: {
              finishedAt: new Date(startTime + durationInMs),
              isActive: false,
            }
          });
          
          // Continue below to create a new exam
        }
      }
      
      // Create new exam result
      const examResult = await prisma.examResult.create({
        data: {
          examId: examId,
          userId: userId,
          score: 0,
          startedAt: new Date(),
          isActive: true,
        },
        include: {
          exam: true,
        },
      });
      
      res.status(201).json({ 
        message: 'Exam started successfully',
        isResumed: false,
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
          isActive: false,
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
  },
  
  // Get active exam for a user
  getActiveExamForUser: async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      
      // Find active exam for the user
      const activeExam = await prisma.examResult.findFirst({
        where: {
          userId: parseInt(userId),
          isActive: true,
          finishedAt: null
        },
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
        orderBy: {
          startedAt: 'desc',
        },
      });
      
      if (!activeExam) {
        res.status(404).json({ message: 'No active exam found for this user' });
        return;
      }
      
      // Check if the exam is still within time limit
      const startTime = activeExam.startedAt.getTime();
      const currentTime = Date.now();
      const durationInMs = activeExam.exam.durationMinutes * 60 * 1000;
      
      // If the exam time has expired but hasn't been marked as finished
      if (currentTime - startTime > durationInMs) {
        // Time's up, mark it as finished automatically
        await prisma.examResult.update({
          where: { id: activeExam.id },
          data: {
            finishedAt: new Date(startTime + durationInMs),
            isActive: false,
          }
        });
        
        res.status(400).json({ message: 'Exam time has expired', examResultId: activeExam.id });
        return;
      }
      
      // Calculate time remaining
      const timeRemaining = Math.max(0, durationInMs - (currentTime - startTime));
      
      res.status(200).json({ 
        activeExam,
        timeRemaining: Math.floor(timeRemaining / 1000), // in seconds
        answeredQuestions: activeExam.examAnswers.length,
        totalQuestions: activeExam.exam.examQuestions.length,
      });
    } catch (error) {
      console.error('Error getting active exam:', error);
      res.status(500).json({ message: 'Error getting active exam', error: (error as Error).message });
    }
  },

  // Create a new exam
  createExam: async (req: Request, res: Response): Promise<void> => {
    try {
      const { title, grade, chapterId, durationMinutes } = req.body;
      
      // Validate request body
      if (!title || !grade || !durationMinutes) {
        res.status(400).json({ message: 'Missing required fields: title, grade, or durationMinutes' });
        return;
      }

      // Create new exam
      const exam = await prisma.exam.create({
        data: {
          title,
          grade,
          chapterId: chapterId ? parseInt(chapterId) : null,
          durationMinutes: parseInt(durationMinutes)
        }
      });
      
      res.status(201).json({ 
        message: 'Exam created successfully',
        exam 
      });
    } catch (error) {
      console.error('Error creating exam:', error);
      res.status(500).json({ message: 'Error creating exam', error: (error as Error).message });
    }
  },

  // Update an existing exam
  updateExam: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { title, grade, chapterId, durationMinutes } = req.body;
      
      // Find the exam to update
      const exam = await prisma.exam.findUnique({
        where: { id: parseInt(id) }
      });
      
      if (!exam) {
        res.status(404).json({ message: 'Exam not found' });
        return;
      }
      
      // Update the exam
      const updatedExam = await prisma.exam.update({
        where: { id: parseInt(id) },
        data: {
          title: title || exam.title,
          grade: grade !== undefined ? parseInt(grade) : exam.grade,
          chapterId: chapterId !== undefined ? (chapterId ? parseInt(chapterId) : null) : exam.chapterId,
          durationMinutes: durationMinutes !== undefined ? parseInt(durationMinutes) : exam.durationMinutes
        }
      });
      
      res.status(200).json({ 
        message: 'Exam updated successfully',
        exam: updatedExam
      });
    } catch (error) {
      console.error('Error updating exam:', error);
      res.status(500).json({ message: 'Error updating exam', error: (error as Error).message });
    }
  },

  // Delete an exam
  deleteExam: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      // Check if exam exists
      const exam = await prisma.exam.findUnique({
        where: { id: parseInt(id) }
      });
      
      if (!exam) {
        res.status(404).json({ message: 'Exam not found' });
        return;
      }
      
      // Check if exam is associated with any exam results
      const examResults = await prisma.examResult.count({
        where: { examId: parseInt(id) }
      });
      
      if (examResults > 0) {
        res.status(400).json({ 
          message: 'Cannot delete exam that has associated results. Delete the exam results first.'
        });
        return;
      }
      
      // Delete related examQuestions first
      await prisma.examQuestion.deleteMany({
        where: { examId: parseInt(id) }
      });
      
      // Delete the exam
      await prisma.exam.delete({
        where: { id: parseInt(id) }
      });
      
      res.status(200).json({ message: 'Exam deleted successfully' });
    } catch (error) {
      console.error('Error deleting exam:', error);
      res.status(500).json({ message: 'Error deleting exam', error: (error as Error).message });
    }
  },

  // Add a question to an exam
  addQuestionToExam: async (req: Request, res: Response): Promise<void> => {
    try {
      const { examId, questionId } = req.body;
      
      // Validate request body
      if (!examId || !questionId) {
        res.status(400).json({ message: 'Missing required fields: examId or questionId' });
        return;
      }
      
      // Check if exam exists
      const exam = await prisma.exam.findUnique({
        where: { id: parseInt(examId) }
      });
      
      if (!exam) {
        res.status(404).json({ message: 'Exam not found' });
        return;
      }
      
      // Check if question exists
      const question = await prisma.question.findUnique({
        where: { id: parseInt(questionId) }
      });
      
      if (!question) {
        res.status(404).json({ message: 'Question not found' });
        return;
      }
      
      // Check if the question is already in the exam
      const existingExamQuestion = await prisma.examQuestion.findFirst({
        where: {
          examId: parseInt(examId),
          questionId: parseInt(questionId)
        }
      });
      
      if (existingExamQuestion) {
        res.status(400).json({ message: 'Question is already in the exam' });
        return;
      }
      
      // Add question to exam
      const examQuestion = await prisma.examQuestion.create({
        data: {
          examId: parseInt(examId),
          questionId: parseInt(questionId)
        },
        include: {
          question: {
            include: {
              answers: true
            }
          }
        }
      });
      
      res.status(201).json({ 
        message: 'Question added to exam successfully',
        examQuestion
      });
    } catch (error) {
      console.error('Error adding question to exam:', error);
      res.status(500).json({ message: 'Error adding question to exam', error: (error as Error).message });
    }
  },

  // Remove a question from an exam
  removeQuestionFromExam: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      // Check if exam question exists
      const examQuestion = await prisma.examQuestion.findUnique({
        where: { id: parseInt(id) }
      });
      
      if (!examQuestion) {
        res.status(404).json({ message: 'Exam question not found' });
        return;
      }
      
      // Delete the exam question
      await prisma.examQuestion.delete({
        where: { id: parseInt(id) }
      });
      
      res.status(200).json({ message: 'Question removed from exam successfully' });
    } catch (error) {
      console.error('Error removing question from exam:', error);
      res.status(500).json({ message: 'Error removing question from exam', error: (error as Error).message });
    }
  }
};

export default examController;