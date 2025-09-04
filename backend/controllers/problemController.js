const prisma = require('../prisma/prisma');

const problemController = {
  // Get problem by ID
  getProblemById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const problem = await prisma.problem.findUnique({
        where: { id: parseInt(id) },
        include: {
          course: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      });
      
      if (!problem) {
        return res.status(404).json({ message: 'Problem not found' });
      }
      
      res.status(200).json({ problem });
    } catch (error) {
      console.error('Error getting problem:', error);
      res.status(500).json({ message: 'Error retrieving problem', error: error.message });
    }
  },
  
  // Submit a solution attempt
  submitAttempt: async (req, res) => {
    try {
      const { userId, problemId, answer } = req.body;
      
      // Get the problem to check the answer
      const problem = await prisma.problem.findUnique({
        where: { id: parseInt(problemId) },
      });
      
      if (!problem) {
        return res.status(404).json({ message: 'Problem not found' });
      }
      
      // In a real application, you would have a more sophisticated
      // way to check if the answer is correct
      const isCorrect = checkAnswer(answer, problem.solution);
      
      // Record the attempt
      const attempt = await prisma.attempt.create({
        data: {
          userId: parseInt(userId),
          problemId: parseInt(problemId),
          answer,
          isCorrect,
        },
      });
      
      res.status(201).json({
        message: isCorrect ? 'Correct answer!' : 'Incorrect answer, try again.',
        attempt,
        isCorrect,
      });
    } catch (error) {
      console.error('Error submitting attempt:', error);
      res.status(500).json({ message: 'Error submitting attempt', error: error.message });
    }
  },
  
  // Get all attempts by a user
  getUserAttempts: async (req, res) => {
    try {
      const { userId } = req.params;
      
      const attempts = await prisma.attempt.findMany({
        where: { userId: parseInt(userId) },
        include: {
          problem: {
            select: {
              id: true,
              title: true,
              difficulty: true,
              mathField: true,
              courseId: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      
      res.status(200).json({ attempts });
    } catch (error) {
      console.error('Error getting user attempts:', error);
      res.status(500).json({ message: 'Error retrieving user attempts', error: error.message });
    }
  },
};

// Helper function to check if an answer is correct
function checkAnswer(userAnswer, correctSolution) {
  // This is a simplified check. In a real app, you would have
  // more sophisticated logic based on the type of problem
  return userAnswer.trim().toLowerCase() === correctSolution.trim().toLowerCase();
}

module.exports = problemController;
