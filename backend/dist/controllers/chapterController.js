import prisma from '../prisma/prisma.js';
const chapterController = {
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
                    { chapterNumber: 'asc' },
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
                            lessonNumber: 'asc',
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
                    { chapterNumber: 'asc' },
                ],
                include: {
                    lessons: {
                        orderBy: {
                            lessonNumber: 'asc',
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
};
export default chapterController;
