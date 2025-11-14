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
    const response = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginData),
    });

    const result: LoginResponse = await response.json();
    console.log("loginAPI response:", result); // Debug log
    return result;
  } catch (error) {
    console.error("Lỗi khi gọi API đăng nhập:", error);
    throw new Error("Không thể kết nối đến server");
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

    const response = await fetch("http://localhost:5173/api/auth/me", {
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
