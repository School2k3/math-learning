import { buildApiUrl } from "../config/api";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    accessToken: string;
    refreshToken: string;
    user: {
      id: number;
      username: string;
      fullName: string;
      email: string;
      role: string;
      grade: number;
      avatarUrl?: string;
    };
  };
}

export const loginAPI = async (
  loginData: LoginRequest
): Promise<LoginResponse> => {
  try {
    const url = buildApiUrl("/api/auth/login");
    console.log("🔵 Login API URL:", url);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginData),
    });

    console.log("🟢 Login response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Login failed:", response.status, errorText);
      throw new Error(`Login failed: ${response.status}`);
    }

    const result: LoginResponse = await response.json();
    console.log("✅ loginAPI response:", result);
    return result;
  } catch (error) {
    console.error("🔴 Lỗi khi gọi API đăng nhập:", error);
    throw error;
  }
};

// API lấy thông tin người dùng hiện tại
export const getUserInfo = async () => {
  try {
    // Lấy refreshToken từ localStorage
    const refreshToken = localStorage.getItem("refreshToken");

    if (!refreshToken) {
      throw new Error("No refresh token found");
    }

    const response = await fetch(buildApiUrl("/api/auth/me"), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${refreshToken}`, // Truyền refreshToken vào header
      },
    });

    if (!response.ok) {
      throw new Error("Failed to get user info");
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Lỗi khi lấy thông tin user:", error);
    throw error;
  }
};

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

/**
 * Forgot Password - Send OTP to email
 * POST /api/auth/forgot-password
 */
export const forgotPasswordAPI = async (
  email: string
): Promise<ForgotPasswordResponse> => {
  try {
    const url = buildApiUrl("/api/auth/forgot-password");
    console.log("🔵 Forgot Password API URL:", url);
    console.log("📤 Request data:", { email });

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    console.log("🟢 Forgot Password response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Forgot Password failed:", response.status, errorText);
      throw new Error(`Forgot Password failed: ${response.status}`);
    }

    const result: ForgotPasswordResponse = await response.json();
    console.log("✅ forgotPasswordAPI response:", result);
    return result;
  } catch (error) {
    console.error("🔴 Lỗi khi gọi API forgot password:", error);
    throw error;
  }
};

/**
 * Reset Password with OTP verification
 * POST /api/auth/reset-password
 */
export const resetPasswordAPI = async (
  data: ResetPasswordRequest
): Promise<ResetPasswordResponse> => {
  try {
    const url = buildApiUrl("/api/auth/reset-password");
    console.log("🔵 Reset Password API URL:", url);
    console.log("📤 Request data:", { email: data.email, otp: data.otp });

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    console.log("🟢 Reset Password response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Reset Password failed:", response.status, errorText);
      throw new Error(`Reset Password failed: ${response.status}`);
    }

    const result: ResetPasswordResponse = await response.json();
    console.log("✅ resetPasswordAPI response:", result);
    return result;
  } catch (error) {
    console.error("🔴 Lỗi khi gọi API reset password:", error);
    throw error;
  }
};
