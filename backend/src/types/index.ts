import { Request, Response } from 'express';
import { 
  Chapter, 
  Lesson, 
  Question, 
  Answer, 
  Explanation, 
  PracticeSession,
  PracticeAnswer,
  Exam,
  ExamQuestion,
  ExamResult,
  ExamAnswer,
  User,
  Reward,
  UserReward,
  ProgressHistory
} from '@prisma/client';

// Request with query parameters
export interface RequestWithQuery<T extends Record<string, any> = Record<string, any>> extends Request {
  query: T;
}

// Controller function signatures
export type ControllerFunction = (req: Request, res: Response) => Promise<void>;

// Common query parameters
export interface GradeQuery {
  grade?: string;
}

export interface ChapterQuery extends GradeQuery {
  volume?: string;
}

export interface QuestionQuery extends GradeQuery {
  topic?: string;
  type?: string;
}

// Type for controller objects
export interface Controller {
  [key: string]: ControllerFunction;
}
