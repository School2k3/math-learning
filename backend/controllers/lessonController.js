const prisma = require('../prisma/prisma');

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
    } catch (error) {
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
        return res.status(404).json({ message: 'Lesson not found' });
      }
      
      res.status(200).json({ lesson });
    } catch (error) {
      console.error('Error getting lesson:', error);
      res.status(500).json({ message: 'Error retrieving lesson', error: error.message });
    }
  },
  
  // Create new lesson
  createLesson: async (req, res) => {
    try {
      const { chapterId, lessonNumber, title, contentText, videoUrl, imageUrl } = req.body;
      
      // Check if the chapter exists
      const chapter = await prisma.chapter.findUnique({
        where: { id: parseInt(chapterId) },
      });
      
      if (!chapter) {
        return res.status(404).json({ message: 'Chapter not found' });
      }
      
      // Check if a lesson with the same chapter and lesson number already exists
      const existingLesson = await prisma.lesson.findFirst({
        where: {
          chapterId: parseInt(chapterId),
          lessonNumber: parseInt(lessonNumber),
        },
      });
      
      if (existingLesson) {
        return res.status(400).json({ message: 'A lesson with this chapter and lesson number already exists' });
      }
      
      const newLesson = await prisma.lesson.create({
        data: {
          chapterId: parseInt(chapterId),
          lessonNumber: parseInt(lessonNumber),
          title,
          contentText,
          videoUrl,
          imageUrl,
        },
      });
      
      res.status(201).json({
        message: 'Lesson created successfully',
        lesson: newLesson,
      });
    } catch (error) {
      console.error('Error creating lesson:', error);
      res.status(500).json({ message: 'Error creating lesson', error: error.message });
    }
  },
  
  // Update existing lesson
  updateLesson: async (req, res) => {
    try {
      const { id } = req.params;
      const { chapterId, lessonNumber, title, contentText, videoUrl, imageUrl } = req.body;
      
      const lesson = await prisma.lesson.findUnique({
        where: { id: parseInt(id) },
      });
      
      if (!lesson) {
        return res.status(404).json({ message: 'Lesson not found' });
      }
      
      // If chapter ID is changing, check if the new chapter exists
      if (chapterId !== undefined && parseInt(chapterId) !== lesson.chapterId) {
        const chapter = await prisma.chapter.findUnique({
          where: { id: parseInt(chapterId) },
        });
        
        if (!chapter) {
          return res.status(404).json({ message: 'Chapter not found' });
        }
      }
      
      // Check if updating would create a duplicate
      if (chapterId !== undefined || lessonNumber !== undefined) {
        const existingLesson = await prisma.lesson.findFirst({
          where: {
            chapterId: chapterId !== undefined ? parseInt(chapterId) : lesson.chapterId,
            lessonNumber: lessonNumber !== undefined ? parseInt(lessonNumber) : lesson.lessonNumber,
            NOT: {
              id: parseInt(id),
            },
          },
        });
        
        if (existingLesson) {
          return res.status(400).json({ message: 'A lesson with this chapter and lesson number already exists' });
        }
      }
      
      const updatedLesson = await prisma.lesson.update({
        where: { id: parseInt(id) },
        data: {
          chapterId: chapterId !== undefined ? parseInt(chapterId) : undefined,
          lessonNumber: lessonNumber !== undefined ? parseInt(lessonNumber) : undefined,
          title: title !== undefined ? title : undefined,
          contentText: contentText !== undefined ? contentText : undefined,
          videoUrl: videoUrl !== undefined ? videoUrl : undefined,
          imageUrl: imageUrl !== undefined ? imageUrl : undefined,
        },
      });
      
      res.status(200).json({
        message: 'Lesson updated successfully',
        lesson: updatedLesson,
      });
    } catch (error) {
      console.error('Error updating lesson:', error);
      res.status(500).json({ message: 'Error updating lesson', error: error.message });
    }
  },
  
  // Delete lesson
  deleteLesson: async (req, res) => {
    try {
      const { id } = req.params;
      
      const lesson = await prisma.lesson.findUnique({
        where: { id: parseInt(id) },
      });
      
      if (!lesson) {
        return res.status(404).json({ message: 'Lesson not found' });
      }
      
      // Check if there are any progress history entries related to this lesson
      const progressHistoryEntries = await prisma.progressHistory.findMany({
        where: { lessonId: parseInt(id) },
      });
      
      if (progressHistoryEntries.length > 0) {
        // Option 1: Prevent deletion
        // return res.status(400).json({ message: 'Cannot delete lesson with progress history entries.' });
        
        // Option 2: Set the lessonId to null in progress history entries
        await prisma.progressHistory.updateMany({
          where: { lessonId: parseInt(id) },
          data: { lessonId: null },
        });
      }
      
      // Delete the lesson
      await prisma.lesson.delete({
        where: { id: parseInt(id) },
      });
      
      res.status(200).json({ message: 'Lesson deleted successfully' });
    } catch (error) {
      console.error('Error deleting lesson:', error);
      res.status(500).json({ message: 'Error deleting lesson', error: error.message });
    }
  },
};

module.exports = lessonController;
