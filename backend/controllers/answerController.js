const prisma = require('../prisma/prisma');

const answerController = {
  // Get all answers for a specific question
  getAnswersByQuestionId: async (req, res) => {
    try {
      const { questionId } = req.params;
      
      const answers = await prisma.answer.findMany({
        where: { questionId: parseInt(questionId) },
        orderBy: {
          id: 'asc',
        },
      });
      
      res.status(200).json({ answers });
    } catch (error) {
      console.error('Error getting answers:', error);
      res.status(500).json({ message: 'Error getting answers', error: error.message });
    }
  },
  
  // Get a specific answer by ID
  getAnswerById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const answer = await prisma.answer.findUnique({
        where: { id: parseInt(id) },
        include: {
          question: true, // Include related question
        },
      });
      
      if (!answer) {
        return res.status(404).json({ message: 'Answer not found' });
      }
      
      res.status(200).json({ answer });
    } catch (error) {
      console.error('Error getting answer:', error);
      res.status(500).json({ message: 'Error getting answer', error: error.message });
    }
  },
  
  // Get all correct answers for a question
  getCorrectAnswers: async (req, res) => {
    try {
      const { questionId } = req.params;
      
      const correctAnswers = await prisma.answer.findMany({
        where: { 
          questionId: parseInt(questionId),
          isCorrect: true
        },
      });
      
      res.status(200).json({ correctAnswers });
    } catch (error) {
      console.error('Error getting correct answers:', error);
      res.status(500).json({ message: 'Error getting correct answers', error: error.message });
    }
  }
};

module.exports = answerController;
