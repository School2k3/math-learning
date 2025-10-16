export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    refreshToken: string;
    user: {
      id: number;
      username: string;
      fullName: string;
      email: string;
      grade: number;
      address: string;
      avatar?: string;
    };
  };
}








export const loginAPI = async (loginData: LoginRequest): Promise<LoginResponse> => {

  try {
    const response = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginData),
    });

    const result: LoginResponse = await response.json();
    return result;
  } catch (error) {
    console.error("Lỗi khi gọi API đăng nhập:", error);
    throw new Error("Không thể kết nối đến server");
  }


};




