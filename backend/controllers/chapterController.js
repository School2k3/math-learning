const prisma = require('../prisma/prisma');

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
    } catch (error) {
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
        return res.status(404).json({ message: 'Chapter not found' });
      }
      
      res.status(200).json({ chapter });
    } catch (error) {
      console.error('Error getting chapter:', error);
      res.status(500).json({ message: 'Error retrieving chapter', error: error.message });
    }
  },
  
  // Create new chapter
  createChapter: async (req, res) => {
    try {
      const { grade, volume, chapterNumber, title } = req.body;
      
      // Check if a chapter with the same grade, volume and chapter number already exists
      const existingChapter = await prisma.chapter.findFirst({
        where: {
          grade: parseInt(grade),
          volume: parseInt(volume),
          chapterNumber: parseInt(chapterNumber),
        },
      });
      
      if (existingChapter) {
        return res.status(400).json({ message: 'A chapter with this grade, volume and chapter number already exists' });
      }
      
      const newChapter = await prisma.chapter.create({
        data: {
          grade: parseInt(grade),
          volume: parseInt(volume),
          chapterNumber: parseInt(chapterNumber),
          title,
        },
      });
      
      res.status(201).json({
        message: 'Chapter created successfully',
        chapter: newChapter,
      });
    } catch (error) {
      console.error('Error creating chapter:', error);
      res.status(500).json({ message: 'Error creating chapter', error: error.message });
    }
  },
  
  // Update existing chapter
  updateChapter: async (req, res) => {
    try {
      const { id } = req.params;
      const { grade, volume, chapterNumber, title } = req.body;
      
      const chapter = await prisma.chapter.findUnique({
        where: { id: parseInt(id) },
      });
      
      if (!chapter) {
        return res.status(404).json({ message: 'Chapter not found' });
      }
      
      // Check if updating would create a duplicate
      if (grade !== undefined || volume !== undefined || chapterNumber !== undefined) {
        const existingChapter = await prisma.chapter.findFirst({
          where: {
            grade: grade !== undefined ? parseInt(grade) : chapter.grade,
            volume: volume !== undefined ? parseInt(volume) : chapter.volume,
            chapterNumber: chapterNumber !== undefined ? parseInt(chapterNumber) : chapter.chapterNumber,
            NOT: {
              id: parseInt(id),
            },
          },
        });
        
        if (existingChapter) {
          return res.status(400).json({ message: 'A chapter with this grade, volume and chapter number already exists' });
        }
      }
      
      const updatedChapter = await prisma.chapter.update({
        where: { id: parseInt(id) },
        data: {
          grade: grade !== undefined ? parseInt(grade) : undefined,
          volume: volume !== undefined ? parseInt(volume) : undefined,
          chapterNumber: chapterNumber !== undefined ? parseInt(chapterNumber) : undefined,
          title: title !== undefined ? title : undefined,
        },
      });
      
      res.status(200).json({
        message: 'Chapter updated successfully',
        chapter: updatedChapter,
      });
    } catch (error) {
      console.error('Error updating chapter:', error);
      res.status(500).json({ message: 'Error updating chapter', error: error.message });
    }
  },
  
  // Delete chapter
  deleteChapter: async (req, res) => {
    try {
      const { id } = req.params;
      
      const chapter = await prisma.chapter.findUnique({
        where: { id: parseInt(id) },
        include: {
          lessons: true,
        },
      });
      
      if (!chapter) {
        return res.status(404).json({ message: 'Chapter not found' });
      }
      
      // Check if chapter has lessons
      if (chapter.lessons.length > 0) {
        return res.status(400).json({ message: 'Cannot delete chapter with lessons. Delete lessons first.' });
      }
      
      // Delete the chapter
      await prisma.chapter.delete({
        where: { id: parseInt(id) },
      });
      
      res.status(200).json({ message: 'Chapter deleted successfully' });
    } catch (error) {
      console.error('Error deleting chapter:', error);
      res.status(500).json({ message: 'Error deleting chapter', error: error.message });
    }
  },
  
  // Get all lessons for a specific chapter
  getChapterLessons: async (req, res) => {
    try {
      const { chapterId } = req.params;
      
      const lessons = await prisma.lesson.findMany({
        where: { chapterId: parseInt(chapterId) },
        orderBy: {
          lessonNumber: 'asc',
        },
      });
      
      res.status(200).json({ lessons });
    } catch (error) {
      console.error('Error getting chapter lessons:', error);
      res.status(500).json({ message: 'Error retrieving chapter lessons', error: error.message });
    }
  },
};

module.exports = chapterController;
