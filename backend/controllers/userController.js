const prisma = require('../prisma/prisma');

const userController = {
  // Register new user
  registerUser: async (req, res) => {
    try {
      const { email, name, password, role } = req.body;
      
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });
      
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists with this email' });
      }
      
      // In a real app, hash the password before storing
      const newUser = await prisma.user.create({
        data: {
          email,
          name,
          password, // Should be hashed in production
          role: role || 'student',
        },
      });
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = newUser;
      
      res.status(201).json({
        message: 'User registered successfully',
        user: userWithoutPassword,
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Error creating user', error: error.message });
    }
  },
  
  // Login user
  loginUser: async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email },
      });
      
      if (!user || user.password !== password) { // In real app, compare hashed passwords
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      
      // In a real app, generate and return JWT token here
      
      res.status(200).json({
        message: 'Login successful',
        user: userWithoutPassword,
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Error during login', error: error.message });
    }
  },
  
  // Get user profile
  getUserProfile: async (req, res) => {
    try {
      // In a real app, get user ID from JWT token
      const userId = req.query.userId; // Temporary for testing
      
      if (!userId) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      const user = await prisma.user.findUnique({
        where: { id: parseInt(userId) },
        include: {
          enrollments: {
            include: {
              course: true,
            },
          },
        },
      });
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      res.status(200).json({ user: userWithoutPassword });
    } catch (error) {
      console.error('Profile error:', error);
      res.status(500).json({ message: 'Error retrieving profile', error: error.message });
    }
  },
};

module.exports = userController;
