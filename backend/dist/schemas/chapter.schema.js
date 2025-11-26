import { z } from 'zod';
// Create Chapter Schema
export const createChapterSchema = z.object({
    grade: z.number().int().min(1).max(5),
    volume: z.number().int().min(1).max(2),
    title: z.string().min(1).max(100),
});
// Update Chapter Schema
export const updateChapterSchema = z.object({
    grade: z.number().int().min(1).max(5).optional(),
    volume: z.number().int().min(1).max(2).optional(),
    title: z.string().min(1).max(100).optional(),
}).refine(data => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update"
});
// Get Chapter by ID Schema
export const chapterIdSchema = z.object({
    id: z.string().transform((val) => parseInt(val, 10)),
});
// Query Parameters Schema
export const chapterQuerySchema = z.object({
    grade: z.string().optional().transform((val) => val ? parseInt(val, 10) : undefined),
    volume: z.string().optional().transform((val) => val ? parseInt(val, 10) : undefined),
});
