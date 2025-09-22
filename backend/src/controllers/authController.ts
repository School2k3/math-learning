import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { 
  sendBadRequestResponse, 
  sendSuccessResponse, 
  sendUnauthorizedResponse, 
  sendErrorResponse 
} from '../utils/apiResponse.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateToken, generateRefreshToken, verifyToken } from '../utils/jwt.js';
import { 
  RegisterRequestBody, 
  LoginRequestBody, 
  RefreshTokenRequestBody 
} from '../types/auth.js';

const prisma = new PrismaClient();

/**
 * Register a new user
 * 
 * @route POST /api/auth/register
 * @param {RegisterRequestBody} req.body - User registration data
 * @returns {Object} User data without the password hash
 */
export const register = async (req: Request<{}, {}, RegisterRequestBody>, res: Response) => {
  try {
    const { username, email, password, fullName, role = 'student', grade } = req.body;

    // Check if required fields are provided
    if (!username || !email || !password || !fullName) {
      return sendBadRequestResponse(res, 'All fields are required: username, email, password, fullName');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return sendBadRequestResponse(res, 'Invalid email format');
    }
    
    // Check if username or email already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email }
        ]
      }
    });

    if (existingUser) {
      return sendBadRequestResponse(res, 'Username or email already exists');
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        fullName,
        role,
        grade,
        isVerified: true, // For simplicity, auto-verify users for now
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random`
      }
    });

    // Remove password hash from response
    const { passwordHash: _, ...userWithoutPassword } = newUser;

    sendSuccessResponse(res, userWithoutPassword, 'User registered successfully', 201);
  } catch (error) {
    console.error('Registration error:', error);
    sendErrorResponse(res, 'Failed to register user');
  }
};

/**
 * Login a user
 * 
 * @route POST /api/auth/login
 * @param {LoginRequestBody} req.body - User login data
 * @returns {Object} Access and refresh tokens
 */
export const login = async (req: Request<{}, {}, LoginRequestBody>, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return sendBadRequestResponse(res, 'Username and password are required');
    }

    // Find user by username
    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      return sendUnauthorizedResponse(res, 'Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return sendUnauthorizedResponse(res, 'Invalid credentials');
    }

    // Check if user is verified
    if (!user.isVerified) {
      return sendUnauthorizedResponse(res, 'Account not verified');
    }

    // Generate tokens
    const tokenPayload = { id: user.id, username: user.username, role: user.role };
    const accessToken = generateToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    sendSuccessResponse(res, {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        grade: user.grade,
        avatarUrl: user.avatarUrl
      }
    }, 'Login successful');
  } catch (error) {
    console.error('Login error:', error);
    sendErrorResponse(res, 'Failed to login');
  }
};

/**
 * Refresh access token using refresh token
 * 
 * @route POST /api/auth/refresh
 * @param {RefreshTokenRequestBody} req.body - Refresh token
 * @returns {Object} New access and refresh tokens
 */
export const refreshToken = async (req: Request<{}, {}, RefreshTokenRequestBody>, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return sendBadRequestResponse(res, 'Refresh token is required');
    }

    // Verify the refresh token
    const decoded = verifyToken(refreshToken);
    if (!decoded) {
      return sendUnauthorizedResponse(res, 'Invalid refresh token');
    }

    // Get the user information
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user) {
      return sendUnauthorizedResponse(res, 'Invalid refresh token');
    }

    // Generate new tokens
    const tokenPayload = { id: user.id, username: user.username, role: user.role };
    const newAccessToken = generateToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    sendSuccessResponse(res, {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    }, 'Token refreshed successfully');
  } catch (error) {
    console.error('Refresh token error:', error);
    sendErrorResponse(res, 'Failed to refresh token');
  }
};

/**
 * Get current user information
 * 
 * @route GET /api/auth/me
 * @returns {Object} User data
 */
export const getMe = async (req: Request, res: Response) => {
  try {
    // The user ID is attached to the request by the authenticate middleware
    const userId = (req as any).userId;

    if (!userId) {
      return sendUnauthorizedResponse(res, 'Not authenticated');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return sendUnauthorizedResponse(res, 'User not found');
    }

    // Remove sensitive information
    const { passwordHash, ...userWithoutSensitiveInfo } = user;

    sendSuccessResponse(res, userWithoutSensitiveInfo, 'User data retrieved successfully');
  } catch (error) {
    console.error('Get user data error:', error);
    sendErrorResponse(res, 'Failed to get user data');
  }
};

/**
 * Logout a user
 * 
 * @route POST /api/auth/logout
 * @returns {Object} Success message
 */
export const logout = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    if (!userId) {
      return sendUnauthorizedResponse(res, 'Not authenticated');
    }

    // With stateless JWT approach, the client is responsible for removing tokens
    // We simply return a success message
    sendSuccessResponse(res, null, 'Logged out successfully');
  } catch (error) {
    console.error('Logout error:', error);
    sendErrorResponse(res, 'Failed to logout');
  }
};