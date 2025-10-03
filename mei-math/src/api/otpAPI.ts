export interface VerifyOTPRequest {
  email: string;
  otp: string;
}

export interface VerifyOTPResponse {
  success: boolean;
  message: string;
}

export const verifyOTPAPI = async (data: VerifyOTPRequest): Promise<VerifyOTPResponse> => {
  try {
    const response = await fetch("http://localhost:3000/api/auth/verify-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result: VerifyOTPResponse = await response.json();
    return result;
  } catch (error) {
    console.error("Lỗi khi verify OTP:", error);
    throw new Error("Không thể kết nối đến server");
  }
};

export const resendOTPAPI = async (email: string): Promise<VerifyOTPResponse> => {
  try {
    const response = await fetch("http://localhost:3000/api/auth/resend-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const result: VerifyOTPResponse = await response.json();
    return result;
  } catch (error) {
    console.error("Lỗi khi resend OTP:", error);
    throw new Error("Không thể kết nối đến server");
  }
};