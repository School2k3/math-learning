import { z } from 'zod';

// Create Answer Schema
export const createAnswerSchema = z.object({
  questionId: z.number().int().positive(),
  answerText: z.string().min(1).max(500),
  isCorrect: z.boolean()
});

// Update Answer Schema
export const updateAnswerSchema = z.object({
  answerText: z.string().min(1).max(500).optional(),
  isCorrect: z.boolean().optional()
}).refine(data => Object.keys(data).length > 0, {
  message: "At least one field must be provided for update"
});

// Create Multiple Answers Schema
export const createMultipleAnswersSchema = z.array(
  z.object({
    questionId: z.number().int().positive(),
    answerText: z.string().min(1).max(500),
    isCorrect: z.boolean()
  })
).min(1);

// Get Answer by ID Schema
export const answerIdSchema = z.object({
  id: z.string().transform((val) => parseInt(val, 10)),
});

// Get Answers by Question ID Schema
export const questionIdParamSchema = z.object({
  questionId: z.string().transform((val) => parseInt(val, 10)),
});

// Types derived from schemas
export type CreateAnswerInput = z.infer<typeof createAnswerSchema>;
export type UpdateAnswerInput = z.infer<typeof updateAnswerSchema>;
export type CreateMultipleAnswersInput = z.infer<typeof createMultipleAnswersSchema>;
export type AnswerIdParam = z.infer<typeof answerIdSchema>;
export type QuestionIdParam = z.infer<typeof questionIdParamSchema>;