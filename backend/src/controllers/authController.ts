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
  RefreshTokenRequestBody,
  OtpRequestBody,
  OtpVerificationRequestBody
} from '../types/auth.js';
import { generateOtp, saveOtp, verifyOtp as validateOtp } from '../services/otpStore.js';
import { sendOtpEmail } from '../services/emailService.js';

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

    // Create user but set isVerified to false until OTP verification
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        fullName,
        role,
        grade,
        isVerified: false, // User needs to verify email with OTP
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random`
      }
    });

    // Generate and send OTP
    const otp = generateOtp();
    saveOtp(email, otp);
    
    try {
      await sendOtpEmail(email, otp);
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
      // Continue with registration process even if email sending fails
    }

    // Remove password hash from response
    const { passwordHash: _, ...userWithoutPassword } = newUser;

    sendSuccessResponse(
      res, 
      userWithoutPassword, 
      'User registered successfully. Please verify your email with the OTP sent to your email.', 
      201
    );
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

/**
 * Request an OTP to verify email
 * 
 * @route POST /api/auth/request-otp
 * @param {OtpRequestBody} req.body - Email for OTP request
 * @returns {Object} Success message
 */
export const requestOtp = async (req: Request<{}, {}, OtpRequestBody>, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return sendBadRequestResponse(res, 'Email is required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return sendBadRequestResponse(res, 'Invalid email format');
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return sendBadRequestResponse(res, 'User not found');
    }

    // Generate and save OTP
    const otp = generateOtp();
    saveOtp(email, otp);

    // Send OTP email
    try {
      await sendOtpEmail(email, otp);
    } catch (error) {
      console.error('Failed to send OTP email:', error);
      return sendErrorResponse(res, 'Failed to send OTP email');
    }

    sendSuccessResponse(res, null, 'OTP sent to your email');
  } catch (error) {
    console.error('Request OTP error:', error);
    sendErrorResponse(res, 'Failed to send OTP');
  }
};

/**
 * Verify OTP and mark user as verified
 * 
 * @route POST /api/auth/verify-otp
 * @param {OtpVerificationRequestBody} req.body - Email and OTP
 * @returns {Object} User data with tokens
 */
export const verifyOtp = async (req: Request<{}, {}, OtpVerificationRequestBody>, res: Response) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return sendBadRequestResponse(res, 'Email and OTP are required');
    }

    // Verify OTP
    const isValid = validateOtp(email, otp);
    if (!isValid) {
      return sendBadRequestResponse(res, 'Invalid or expired OTP');
    }

    // Update user to verified status
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return sendBadRequestResponse(res, 'User not found');
    }

    // Mark user as verified
    await prisma.user.update({
      where: { email },
      data: { isVerified: true }
    });

    // Generate tokens for automatic login after verification
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
    }, 'Email verified successfully');
  } catch (error) {
    console.error('Verify OTP error:', error);
    sendErrorResponse(res, 'Failed to verify OTP');
  }
};

/**
 * Get user trophies
 * 
 * @route GET /api/auth/trophies/:userId
 * @param {number} req.params.userId - User ID
 * @returns {Object} User trophy count
 */
export const getUserTrophies = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: {
        id: true,
        username: true,
        fullName: true,
        trophies: true,
        avatarUrl: true
      }
    });

    if (!user) {
      return sendBadRequestResponse(res, 'User not found');
    }

    sendSuccessResponse(res, {
      userId: user.id,
      username: user.username,
      fullName: user.fullName,
      trophies: user.trophies,
      avatarUrl: user.avatarUrl
    }, 'User trophies retrieved successfully');
  } catch (error) {
    console.error('Get user trophies error:', error);
    sendErrorResponse(res, 'Failed to get user trophies');
  }
};

/**
 * Update user profile
 * 
 * @route PUT /api/auth/users/:userId
 * @param {number} req.params.userId - User ID
 * @param {Object} req.body - Updated user data
 * @returns {Object} Updated user data
 */
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { fullName, email, grade, avatarUrl, password } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: parseInt(userId) }
    });

    if (!existingUser) {
      return sendBadRequestResponse(res, 'User not found');
    }

    // Prepare update data
    const updateData: any = {};

    if (fullName !== undefined) {
      updateData.fullName = fullName;
    }

    if (email !== undefined) {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return sendBadRequestResponse(res, 'Invalid email format');
      }

      // Check if email is already used by another user
      const emailExists = await prisma.user.findFirst({
        where: {
          email,
          id: { not: parseInt(userId) }
        }
      });

      if (emailExists) {
        return sendBadRequestResponse(res, 'Email already in use');
      }

      updateData.email = email;
      // If email is changed, set isVerified to false and send new OTP
      if (email !== existingUser.email) {
        updateData.isVerified = false;
        
        // Generate and send OTP
        const otp = generateOtp();
        saveOtp(email, otp);
        
        try {
          await sendOtpEmail(email, otp);
        } catch (emailError) {
          console.error('Failed to send OTP email:', emailError);
        }
      }
    }

    if (grade !== undefined) {
      updateData.grade = grade;
    }

    if (avatarUrl !== undefined) {
      updateData.avatarUrl = avatarUrl;
    }

    if (password !== undefined && password.trim() !== '') {
      // Hash new password
      updateData.passwordHash = await hashPassword(password);
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: updateData
    });

    // Remove sensitive information
    const { passwordHash, ...userWithoutPassword } = updatedUser;

    sendSuccessResponse(
      res, 
      userWithoutPassword, 
      email !== existingUser.email 
        ? 'User updated successfully. Please verify your new email with the OTP sent.'
        : 'User updated successfully'
    );
  } catch (error) {
    console.error('Update user error:', error);
    sendErrorResponse(res, 'Failed to update user');
  }
};

/**
 * Request password reset (Forgot Password)
 * 
 * @route POST /api/auth/forgot-password
 * @param {string} req.body.email - User email
 * @returns {Object} Success message
 */
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return sendBadRequestResponse(res, 'Email is required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return sendBadRequestResponse(res, 'Invalid email format');
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Don't reveal if user exists or not for security
      return sendSuccessResponse(
        res,
        {},
        'If an account with that email exists, a password reset OTP has been sent.'
      );
    }

    // Generate and send OTP
    const otp = generateOtp();
    saveOtp(email, otp);
    
    try {
      await sendOtpEmail(email, otp);
    } catch (emailError) {
      console.error('Failed to send password reset OTP email:', emailError);
      return sendErrorResponse(res, 'Failed to send password reset email');
    }

    sendSuccessResponse(
      res,
      {},
      'If an account with that email exists, a password reset OTP has been sent.'
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    sendErrorResponse(res, 'Failed to process password reset request');
  }
};

/**
 * Reset password with OTP verification
 * 
 * @route POST /api/auth/reset-password
 * @param {string} req.body.email - User email
 * @param {string} req.body.otp - OTP code
 * @param {string} req.body.newPassword - New password
 * @returns {Object} Success message
 */
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return sendBadRequestResponse(res, 'Email, OTP, and new password are required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return sendBadRequestResponse(res, 'Invalid email format');
    }

    // Validate password strength (minimum 6 characters)
    if (newPassword.length < 6) {
      return sendBadRequestResponse(res, 'Password must be at least 6 characters long');
    }

    // Verify OTP
    const isOtpValid = validateOtp(email, otp);
    if (!isOtpValid) {
      return sendBadRequestResponse(res, 'Invalid or expired OTP');
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return sendBadRequestResponse(res, 'User not found');
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { email },
      data: { passwordHash }
    });

    sendSuccessResponse(
      res,
      {},
      'Password reset successfully. You can now login with your new password.'
    );
  } catch (error) {
    console.error('Reset password error:', error);
    sendErrorResponse(res, 'Failed to reset password');
  }
};

/**
 * Change password (requires old password verification)
 * 
 * @route POST /api/auth/change-password
 * @param {string} req.body.userId - User ID
 * @param {string} req.body.oldPassword - Current password
 * @param {string} req.body.newPassword - New password
 * @returns {Object} Success message
 */
export const changePassword = async (req: Request, res: Response) => {
  try {
    const { userId, oldPassword, newPassword } = req.body;

    if (!userId || !oldPassword || !newPassword) {
      return sendBadRequestResponse(res, 'User ID, old password, and new password are required');
    }

    // Validate password strength
    if (newPassword.length < 6) {
      return sendBadRequestResponse(res, 'New password must be at least 6 characters long');
    }

    // Check if old and new passwords are the same
    if (oldPassword === newPassword) {
      return sendBadRequestResponse(res, 'New password must be different from old password');
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) }
    });

    if (!user) {
      return sendBadRequestResponse(res, 'User not found');
    }

    // Verify old password
    const isPasswordValid = await comparePassword(oldPassword, user.passwordHash);
    if (!isPasswordValid) {
      return sendBadRequestResponse(res, 'Current password is incorrect');
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { passwordHash }
    });

    sendSuccessResponse(
      res,
      {},
      'Password changed successfully'
    );
  } catch (error) {
    console.error('Change password error:', error);
    sendErrorResponse(res, 'Failed to change password');
  }
};