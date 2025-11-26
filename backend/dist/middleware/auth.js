import { verifyToken } from '../utils/jwt.js';
import { sendUnauthorizedResponse } from '../utils/apiResponse.js';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
/**
 * Middleware to protect routes that require authentication
 *
 * Verifies the JWT token in the Authorization header
 * and attaches user information to the request object
 */
export const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return sendUnauthorizedResponse(res, 'Access token is required');
        }
        const token = authHeader.replace('Bearer ', '');
        const decoded = verifyToken(token);
        if (!decoded) {
            return sendUnauthorizedResponse(res, 'Invalid or expired token');
        }
        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
        });
        if (!user) {
            return sendUnauthorizedResponse(res, 'User not found');
        }
        // Attach user information to request object
        req.userId = user.id;
        req.username = user.username;
        req.userRole = user.role;
        next();
    }
    catch (error) {
        console.error('Authentication error:', error);
        return sendUnauthorizedResponse(res);
    }
};
/**
 * Middleware to check if the user has admin role
 * Must be used after authenticate middleware
 */
export const requireAdmin = (req, res, next) => {
    if (req.userRole !== 'admin') {
        return sendUnauthorizedResponse(res, 'Admin access required');
    }
    next();
};
