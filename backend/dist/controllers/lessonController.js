import prisma from '../prisma/prisma.js';
const lessonController = {
    // Get all lessons with optional filtering
    getAllLessons: async (req, res) => {
        try {
            const { chapterId } = req.query;
            const whereClause = {};
            if (chapterId) {
                whereClause.chapterId = parseInt(chapterId);
            }
            const lessons = await prisma.lesson.findMany({
                where: whereClause,
                include: {
                    chapter: true,
                },
                orderBy: [
                    { chapterId: 'asc' },
                    { lessonNumber: 'asc' },
                ],
            });
            res.status(200).json({ lessons });
        }
        catch (error) {
            console.error('Error getting lessons:', error);
            res.status(500).json({ message: 'Error retrieving lessons', error: error.message });
        }
    },
    // Get lesson by ID
    getLessonById: async (req, res) => {
        try {
            const { id } = req.params;
            const lesson = await prisma.lesson.findUnique({
                where: { id: parseInt(id) },
                include: {
                    chapter: true,
                },
            });
            if (!lesson) {
                res.status(404).json({ message: 'Lesson not found' });
                return;
            }
            res.status(200).json({ lesson });
        }
        catch (error) {
            console.error('Error getting lesson:', error);
            res.status(500).json({ message: 'Error retrieving lesson', error: error.message });
        }
    },
    // Get lessons by chapter
    getLessonsByChapter: async (req, res) => {
        try {
            const { chapterId } = req.params;
            const lessons = await prisma.lesson.findMany({
                where: {
                    chapterId: parseInt(chapterId),
                },
                orderBy: {
                    lessonNumber: 'asc',
                },
            });
            res.status(200).json({ lessons });
        }
        catch (error) {
            console.error('Error getting lessons by chapter:', error);
            res.status(500).json({ message: 'Error retrieving lessons', error: error.message });
        }
    },
};
export default lessonController;
