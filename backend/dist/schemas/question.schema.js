import { z } from 'zod';
// Create Question Schema
export const createQuestionSchema = z.object({
    questionText: z.string().min(1).max(1000),
    imageUrl: z.string().url().nullable().optional(),
    audioUrl: z.string().url().nullable().optional(),
    explanationText: z.string().min(1).max(1000).nullable().optional(),
    explanationImg: z.string().url().nullable().optional(),
    grade: z.number().int().min(1).max(5),
    type: z.enum(['practice', 'exam']),
    answerType: z.enum(['combobox', 'text', 'choice']).nullable().optional(),
    lessonId: z.number().int().positive().nullable().optional(),
    // Include answers when creating a question
    answers: z.array(z.object({
        answerText: z.string().min(1).max(500),
        isCorrect: z.boolean()
    })).min(1) // At least one answer is required
});
// Update Question Schema
export const updateQuestionSchema = z.object({
    questionText: z.string().min(1).max(1000).optional(),
    imageUrl: z.string().url().nullable().optional(),
    audioUrl: z.string().url().nullable().optional(),
    explanationText: z.string().min(1).max(1000).nullable().optional(),
    explanationImg: z.string().url().nullable().optional(),
    grade: z.number().int().min(1).max(5).optional(),
    type: z.enum(['practice', 'exam']).optional(),
    answerType: z.enum(['combobox', 'text', 'choice']).nullable().optional(),
    lessonId: z.number().int().positive().nullable().optional(),
}).refine(data => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update"
});
// Update Answers for a Question Schema
export const updateAnswersSchema = z.array(z.object({
    id: z.number().int().positive().optional(), // ID is optional for new answers
    answerText: z.string().min(1).max(500),
    isCorrect: z.boolean(),
    _delete: z.boolean().optional() // Mark for deletion
})).min(1); // At least one answer is required
// Get Question by ID Schema
export const questionIdSchema = z.object({
    id: z.string().transform((val) => parseInt(val, 10)),
});
// Get Questions by Lesson ID Schema
export const lessonIdParamSchema = z.object({
    lessonId: z.string().transform((val) => parseInt(val, 10)),
});
// Get Questions by Grade Schema
export const gradeParamSchema = z.object({
    grade: z.string().transform((val) => parseInt(val, 10)),
});
// Get Questions by Exam ID Schema
export const examIdParamSchema = z.object({
    examId: z.string().transform((val) => parseInt(val, 10)),
});
// Query Parameters Schema
export const questionQuerySchema = z.object({
    grade: z.string().optional().transform((val) => val ? parseInt(val, 10) : undefined),
    type: z.enum(['practice', 'exam']).optional(),
    answerType: z.enum(['combobox', 'text', 'choice']).optional(),
    lessonId: z.string().optional().transform((val) => val ? parseInt(val, 10) : undefined),
});
