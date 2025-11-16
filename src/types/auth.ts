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

// Registration response after OTP verification
export interface RegisterResponseBody {
  user: {
    id: number;
    username: string;
    email: string;
    fullName: string;
    role: string;
    grade?: number;
    avatarUrl?: string;
  };
  accessToken: string;
  refreshToken: string;
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

// OTP request body
export interface OtpRequestBody {
  email: string;
}

// OTP verification request body
export interface OtpVerificationRequestBody {
  email: string;
  otp: string;
}