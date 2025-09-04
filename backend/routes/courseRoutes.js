const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');

// Course routes
router.get('/', courseController.getAllCourses);
router.get('/:id', courseController.getCourseById);
router.post('/', courseController.createCourse);
router.put('/:id', courseController.updateCourse);
router.delete('/:id', courseController.deleteCourse);

// Problem routes within courses
router.get('/:courseId/problems', courseController.getCourseProblems);

module.exports = router;
