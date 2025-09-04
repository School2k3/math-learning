const express = require('express');
const router = express.Router();
const chapterController = require('../controllers/chapterController');

// Chapter routes
router.get('/', chapterController.getAllChapters);
router.get('/:id', chapterController.getChapterById);
router.post('/', chapterController.createChapter);
router.put('/:id', chapterController.updateChapter);
router.delete('/:id', chapterController.deleteChapter);

// Get lessons by chapter
router.get('/:chapterId/lessons', chapterController.getChapterLessons);

module.exports = router;
