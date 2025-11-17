import { buildApiUrl } from "../config/api";

export interface RegisterRequest {
  fullName: string;
  email: string;
  username: string;
  password: string;
  role: string;
  grade: number;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data?: {
    id: number;
    email: string;
    username: string;
    fullName: string;
    role: string;
    grade: number;
    isVerified: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

export const registerAPI = async (
  registerData: RegisterRequest
): Promise<RegisterResponse> => {
  try {
    // Tự động set role = "student" nếu grade có giá trị
    const requestData = {
      ...registerData,
      role: registerData.grade ? "student" : registerData.role,
    };

    const response = await fetch(buildApiUrl("/api/auth/register"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    const result: RegisterResponse = await response.json();
    return result;
  } catch (error) {
    console.error("Lỗi khi gọi API đăng ký:", error);
    throw new Error("Không thể kết nối đến server");
  }
};
