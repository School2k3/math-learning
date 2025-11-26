import prisma from '../prisma/prisma.js';
const chapterController = {
    // Create a new chapter
    createChapter: async (req, res) => {
        try {
            // We already have validation middleware, so we can safely use req.body
            const data = req.body;
            const chapter = await prisma.chapter.create({
                data,
            });
            res.status(201).json({
                success: true,
                message: 'Chapter created successfully',
                data: chapter,
            });
        }
        catch (error) {
            console.error('Error creating chapter:', error);
            res.status(500).json({
                success: false,
                message: 'Error creating chapter',
                error: error.message
            });
        }
    },
    // Get all chapters with optional filtering
    getAllChapters: async (req, res) => {
        try {
            const { grade, volume } = req.query;
            const whereClause = {};
            if (grade) {
                whereClause.grade = parseInt(grade);
            }
            if (volume) {
                whereClause.volume = parseInt(volume);
            }
            const chapters = await prisma.chapter.findMany({
                where: whereClause,
                orderBy: [
                    { grade: 'asc' },
                    { volume: 'asc' },
                ],
            });
            res.status(200).json({ chapters });
        }
        catch (error) {
            console.error('Error getting chapters:', error);
            res.status(500).json({ message: 'Error retrieving chapters', error: error.message });
        }
    },
    // Get chapter by ID
    getChapterById: async (req, res) => {
        try {
            const { id } = req.params;
            const chapter = await prisma.chapter.findUnique({
                where: { id: parseInt(id) },
                include: {
                    lessons: {
                        orderBy: {
                            id: 'asc',
                        },
                    },
                },
            });
            if (!chapter) {
                res.status(404).json({ message: 'Chapter not found' });
                return;
            }
            res.status(200).json({ chapter });
        }
        catch (error) {
            console.error('Error getting chapter:', error);
            res.status(500).json({ message: 'Error retrieving chapter', error: error.message });
        }
    },
    // Get chapters by grade
    getChaptersByGrade: async (req, res) => {
        try {
            const { grade } = req.params;
            const chapters = await prisma.chapter.findMany({
                where: {
                    grade: parseInt(grade),
                },
                orderBy: [
                    { volume: 'asc' },
                ],
                include: {
                    lessons: {
                        orderBy: {
                            id: 'asc',
                        },
                    },
                },
            });
            res.status(200).json({ chapters });
        }
        catch (error) {
            console.error('Error getting chapters by grade:', error);
            res.status(500).json({ message: 'Error retrieving chapters', error: error.message });
        }
    },
    // Update a chapter
    updateChapter: async (req, res) => {
        try {
            const { id } = req.params;
            const data = req.body;
            // Check if the chapter exists
            const existingChapter = await prisma.chapter.findUnique({
                where: { id: parseInt(id) },
            });
            if (!existingChapter) {
                res.status(404).json({
                    success: false,
                    message: 'Chapter not found'
                });
                return;
            }
            // Update the chapter
            const updatedChapter = await prisma.chapter.update({
                where: { id: parseInt(id) },
                data,
            });
            res.status(200).json({
                success: true,
                message: 'Chapter updated successfully',
                data: updatedChapter,
            });
        }
        catch (error) {
            console.error('Error updating chapter:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating chapter',
                error: error.message
            });
        }
    },
    // Delete a chapter
    deleteChapter: async (req, res) => {
        try {
            const { id } = req.params;
            // Check if the chapter exists
            const existingChapter = await prisma.chapter.findUnique({
                where: { id: parseInt(id) },
                include: { lessons: true },
            });
            if (!existingChapter) {
                res.status(404).json({
                    success: false,
                    message: 'Chapter not found'
                });
                return;
            }
            // Check if the chapter has lessons
            if (existingChapter.lessons.length > 0) {
                res.status(400).json({
                    success: false,
                    message: 'Cannot delete chapter with existing lessons. Please delete the lessons first.'
                });
                return;
            }
            // Delete the chapter
            await prisma.chapter.delete({
                where: { id: parseInt(id) },
            });
            res.status(200).json({
                success: true,
                message: 'Chapter deleted successfully',
            });
        }
        catch (error) {
            console.error('Error deleting chapter:', error);
            res.status(500).json({
                success: false,
                message: 'Error deleting chapter',
                error: error.message
            });
        }
    },
};
export default chapterController;
