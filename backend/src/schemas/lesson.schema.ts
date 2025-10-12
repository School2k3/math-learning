import { z } from 'zod';

// Create Lesson Schema
export const createLessonSchema = z.object({
  chapterId: z.number().int().positive(),
  title: z.string().min(1).max(100),
  videoUrl: z.string().url().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
});

// Update Lesson Schema
export const updateLessonSchema = z.object({
  chapterId: z.number().int().positive().optional(),
  title: z.string().min(1).max(100).optional(),
  videoUrl: z.string().url().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
}).refine(data => Object.keys(data).length > 0, {
  message: "At least one field must be provided for update"
});

// Get Lesson by ID Schema
export const lessonIdSchema = z.object({
  id: z.string().transform((val) => parseInt(val, 10)),
});

// Get Lessons by Chapter ID Schema
export const chapterIdParamSchema = z.object({
  chapterId: z.string().transform((val) => parseInt(val, 10)),
});

// Query Parameters Schema
export const lessonQuerySchema = z.object({
  chapterId: z.string().optional().transform((val) => val ? parseInt(val, 10) : undefined),
});

// Types derived from schemas
export type CreateLessonInput = z.infer<typeof createLessonSchema>;
export type UpdateLessonInput = z.infer<typeof updateLessonSchema>;
export type LessonIdParam = z.infer<typeof lessonIdSchema>;
export type ChapterIdParam = z.infer<typeof chapterIdParamSchema>;
export type LessonQueryParams = z.infer<typeof lessonQuerySchema>;