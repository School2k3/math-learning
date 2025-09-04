const prisma = require('../prisma/prisma');

const courseController = {
  // Get all courses with optional filtering
  getAllCourses: async (req, res) => {
    try {
      const { level, search } = req.query;
      
      const whereClause = {};
      
      if (level) {
        whereClause.level = level;
      }
      
      if (search) {
        whereClause.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }
      
      const courses = await prisma.course.findMany({
        where: whereClause,
        include: {
          _count: {
            select: { problems: true, enrollments: true },
          },
        },
      });
      
      res.status(200).json({ courses });
    } catch (error) {
      console.error('Error getting courses:', error);
      res.status(500).json({ message: 'Error retrieving courses', error: error.message });
    }
  },
  
  // Get course by ID
  getCourseById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const course = await prisma.course.findUnique({
        where: { id: parseInt(id) },
        include: {
          problems: {
            select: {
              id: true,
              title: true,
              difficulty: true,
              mathField: true,
              _count: {
                select: { attempts: true },
              },
            },
          },
          _count: {
            select: { enrollments: true },
          },
        },
      });
      
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
      
      res.status(200).json({ course });
    } catch (error) {
      console.error('Error getting course:', error);
      res.status(500).json({ message: 'Error retrieving course', error: error.message });
    }
  },
  
  // Create new course
  createCourse: async (req, res) => {
    try {
      const { title, description, level } = req.body;
      
      const newCourse = await prisma.course.create({
        data: {
          title,
          description,
          level,
        },
      });
      
      res.status(201).json({
        message: 'Course created successfully',
        course: newCourse,
      });
    } catch (error) {
      console.error('Error creating course:', error);
      res.status(500).json({ message: 'Error creating course', error: error.message });
    }
  },
  
  // Update existing course
  updateCourse: async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, level } = req.body;
      
      const course = await prisma.course.findUnique({
        where: { id: parseInt(id) },
      });
      
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
      
      const updatedCourse = await prisma.course.update({
        where: { id: parseInt(id) },
        data: {
          title,
          description,
          level,
        },
      });
      
      res.status(200).json({
        message: 'Course updated successfully',
        course: updatedCourse,
      });
    } catch (error) {
      console.error('Error updating course:', error);
      res.status(500).json({ message: 'Error updating course', error: error.message });
    }
  },
  
  // Delete course
  deleteCourse: async (req, res) => {
    try {
      const { id } = req.params;
      
      const course = await prisma.course.findUnique({
        where: { id: parseInt(id) },
      });
      
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
      
      // Delete the course
      await prisma.course.delete({
        where: { id: parseInt(id) },
      });
      
      res.status(200).json({ message: 'Course deleted successfully' });
    } catch (error) {
      console.error('Error deleting course:', error);
      res.status(500).json({ message: 'Error deleting course', error: error.message });
    }
  },
  
  // Get all problems for a specific course
  getCourseProblems: async (req, res) => {
    try {
      const { courseId } = req.params;
      
      const problems = await prisma.problem.findMany({
        where: { courseId: parseInt(courseId) },
      });
      
      res.status(200).json({ problems });
    } catch (error) {
      console.error('Error getting course problems:', error);
      res.status(500).json({ message: 'Error retrieving course problems', error: error.message });
    }
  },
};

module.exports = courseController;
