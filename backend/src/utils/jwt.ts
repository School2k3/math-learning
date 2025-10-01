// ES Module-compatible imports
import jwt from 'jsonwebtoken';
import { config } from 'dotenv';

config();

// Get JWT Secret from environment variables or use a default (only for development)
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_should_be_set_in_env';
// Check if JWT_SECRET is using the default value
if (JWT_SECRET === 'your_jwt_secret_should_be_set_in_env') {
  console.error('WARNING: Using default JWT_SECRET. Set JWT_SECRET in your environment variables for production!');
}

const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || '15m'; // 15 minutes by default
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '7d'; // 7 days by default

// Type for JWT payload
export interface JwtPayload {
  id: number;
  username: string;
  role: string;
  iat?: number;
  exp?: number;
  [key: string]: any; // For additional fields
}

/**
 * Generate a JWT token
 * @param payload Data to include in the token
 * @param expiresIn Token expiration time (e.g. '15m', '1h', '7d')
 * @returns JWT token string
 */
export const generateToken = (payload: JwtPayload, expiresIn = ACCESS_TOKEN_EXPIRY): string => {
  // @ts-expect-error Ignoring type errors with jwt.sign
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

/**
 * Generate a refresh token
 * @param payload Data to include in the token
 * @returns Refresh token string
 */
export const generateRefreshToken = (payload: JwtPayload): string => {
  // @ts-expect-error Ignoring type errors with jwt.sign
  return jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
};

/**
 * Verify a JWT token
 * @param token JWT token string
 * @returns Decoded token payload or null if invalid
 */
export const verifyToken = (token: string): JwtPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Cast decoded to any to check properties
    const payload = decoded as any;
    
    // Check that decoded token has the expected properties
    if (!payload || typeof payload !== 'object' || !payload.id || !payload.username || !payload.role) {
      console.error('Invalid token payload structure');
      return null;
    }
    
    return payload as JwtPayload;
  } catch (error) {
    // Better error handling with specific error types
    if (error instanceof Error) {
      if (error.name === 'TokenExpiredError') {
        console.error('Token expired:', error.message);
      } else if (error.name === 'JsonWebTokenError') {
        console.error('JWT error:', error.message);
      } else {
        console.error('Token verification error:', error.message);
      }
    } else {
      console.error('Unknown token verification error');
    }
    return null;
  }
};