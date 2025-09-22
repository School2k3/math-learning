import { Request } from 'express';

// Extended Express Request with user information
export interface AuthRequest extends Request {
  userId?: number;
  username?: string;
  userRole?: string;
}

// Registration request body
export interface RegisterRequestBody {
  username: string;
  password: string;
  email: string;
  fullName: string;
  role?: string;
  grade?: number;
}

// Login request body
export interface LoginRequestBody {
  username: string;
  password: string;
}

// Token response
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

// Refresh token request body
export interface RefreshTokenRequestBody {
  refreshToken: string;
}