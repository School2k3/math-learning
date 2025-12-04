import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { 
  sendBadRequestResponse, 
  sendSuccessResponse, 
  sendErrorResponse 
} from '../utils/apiResponse.js';
import { hashPassword } from '../utils/password.js';
import { generateOtp, saveOtp } from '../services/otpStore.js';
import { sendOtpEmail } from '../services/emailService.js';

const prisma = new PrismaClient();

/**
 * Admin: Get all users with pagination and filters
 * 
 * @route GET /api/admin/users
 */
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { 
      page = '1', 
      limit = '10', 
      role, 
      grade, 
      isVerified,
      search 
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};
    
    if (role) {
      where.role = role;
    }
    
    if (grade) {
      where.grade = parseInt(grade as string);
    }
    
    if (isVerified !== undefined) {
      where.isVerified = isVerified === 'true';
    }
    
    if (search) {
      where.OR = [
        { username: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
        { fullName: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    // Get users and total count
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limitNum,
        select: {
          id: true,
          username: true,
          email: true,
          fullName: true,
          role: true,
          grade: true,
          avatarUrl: true,
          isVerified: true,
          trophies: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.user.count({ where })
    ]);

    return sendSuccessResponse(res, {
      users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    }, 'Users retrieved successfully');
  } catch (error) {
    console.error('Error getting users:', error);
    return sendErrorResponse(res, 'Failed to get users');
  }
};

/**
 * Admin: Get user by ID
 * 
 * @route GET /api/admin/users/:userId
 */
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        grade: true,
        avatarUrl: true,
        isVerified: true,
        trophies: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            lessonReviews: true,
            practiceSessions: true,
            examResults: true
          }
        }
      }
    });

    if (!user) {
      return sendBadRequestResponse(res, 'User not found');
    }

    return sendSuccessResponse(res, user, 'User retrieved successfully');
  } catch (error) {
    console.error('Error getting user:', error);
    return sendErrorResponse(res, 'Failed to get user');
  }
};

/**
 * Admin: Update user information
 * 
 * @route PUT /api/admin/users/:userId
 */
export const updateUserByAdmin = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { 
      username, 
      email, 
      fullName, 
      role, 
      grade, 
      avatarUrl, 
      password,
      isVerified,
      trophies
    } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: parseInt(userId) }
    });

    if (!existingUser) {
      return sendBadRequestResponse(res, 'User not found');
    }

    // Build update data
    const updateData: any = {};

    if (username !== undefined) {
      // Check if username is already taken by another user
      const usernameExists = await prisma.user.findFirst({
        where: {
          username,
          NOT: { id: parseInt(userId) }
        }
      });

      if (usernameExists) {
        return sendBadRequestResponse(res, 'Username already exists');
      }

      updateData.username = username;
    }

    if (email !== undefined) {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return sendBadRequestResponse(res, 'Invalid email format');
      }

      // Check if email is already taken by another user
      const emailExists = await prisma.user.findFirst({
        where: {
          email,
          NOT: { id: parseInt(userId) }
        }
      });

      if (emailExists) {
        return sendBadRequestResponse(res, 'Email already exists');
      }

      updateData.email = email;
      
      // If admin changes email and doesn't explicitly set isVerified, 
      // we keep the current verification status (admin can override)
    }

    if (fullName !== undefined) {
      updateData.fullName = fullName;
    }

    if (role !== undefined) {
      if (!['student', 'admin'].includes(role)) {
        return sendBadRequestResponse(res, 'Invalid role. Must be student or admin');
      }
      updateData.role = role;
    }

    if (grade !== undefined) {
      if (grade < 1 || grade > 5) {
        return sendBadRequestResponse(res, 'Grade must be between 1 and 5');
      }
      updateData.grade = grade;
    }

    if (avatarUrl !== undefined) {
      updateData.avatarUrl = avatarUrl;
    }

    if (password !== undefined && password.trim() !== '') {
      // Hash the new password
      updateData.passwordHash = await hashPassword(password);
    }

    if (isVerified !== undefined) {
      updateData.isVerified = isVerified;
    }

    if (trophies !== undefined) {
      updateData.trophies = trophies;
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        grade: true,
        avatarUrl: true,
        isVerified: true,
        trophies: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return sendSuccessResponse(
      res, 
      updatedUser,
      'User updated successfully by admin'
    );
  } catch (error) {
    console.error('Error updating user:', error);
    return sendErrorResponse(res, 'Failed to update user');
  }
};

/**
 * Admin: Delete user
 * 
 * @route DELETE /api/admin/users/:userId
 */
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: parseInt(userId) }
    });

    if (!existingUser) {
      return sendBadRequestResponse(res, 'User not found');
    }

    // Delete user (this will cascade delete related records based on schema)
    await prisma.user.delete({
      where: { id: parseInt(userId) }
    });

    return sendSuccessResponse(res, 'User deleted successfully');
  } catch (error) {
    console.error('Error deleting user:', error);
    return sendErrorResponse(res, 'Failed to delete user');
  }
};

/**
 * Admin: Reset user password
 * 
 * @route POST /api/admin/users/:userId/reset-password
 */
export const resetUserPassword = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.trim() === '') {
      return sendBadRequestResponse(res, 'New password is required');
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: parseInt(userId) }
    });

    if (!existingUser) {
      return sendBadRequestResponse(res, 'User not found');
    }

    // Hash and update password
    const passwordHash = await hashPassword(newPassword);
    
    await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { passwordHash }
    });

    return sendSuccessResponse(res, 'Password reset successfully');
  } catch (error) {
    console.error('Error resetting password:', error);
    return sendErrorResponse(res, 'Failed to reset password');
  }
};

/**
 * Admin: Toggle user verification status
 * 
 * @route PATCH /api/admin/users/:userId/verification
 */
export const toggleUserVerification = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { isVerified } = req.body;

    if (typeof isVerified !== 'boolean') {
      return sendBadRequestResponse(res, 'isVerified must be a boolean');
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: parseInt(userId) }
    });

    if (!existingUser) {
      return sendBadRequestResponse(res, 'User not found');
    }

    // Update verification status
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { isVerified },
      select: {
        id: true,
        username: true,
        email: true,
        isVerified: true
      }
    });

    return sendSuccessResponse(
      res, 
      updatedUser,
      `User ${isVerified ? 'verified' : 'unverified'} successfully`
    );
  } catch (error) {
    console.error('Error toggling verification:', error);
    return sendErrorResponse(res, 'Failed to update verification status');
  }
};
