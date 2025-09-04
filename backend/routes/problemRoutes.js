const express = require('express');
const router = express.Router();
const problemController = require('../controllers/problemController');

// Problem routes
router.get('/:id', problemController.getProblemById);
router.post('/attempt', problemController.submitAttempt);
router.get('/user/:userId/attempts', problemController.getUserAttempts);

module.exports = router;
