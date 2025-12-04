import { buildApiUrl } from "../config/api";

// Interfaces
export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: "student" | "admin";
  grade?: number;
  avatarUrl?: string;
  isVerified: boolean;
  createdAt?: string;
  trophies?: number;
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  role?: "student" | "admin";
  grade?: number;
  isVerified?: boolean;
  search?: string;
}

export interface GetUsersResponse {
  success: boolean;
  message: string;
  data: {
    users: User[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
}

export interface GetUserByIdResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
  };
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  fullName?: string;
  role?: "student" | "admin";
  grade?: number;
  avatarUrl?: string;
  isVerified?: boolean;
  trophies?: number;
}

export interface UpdateUserResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    username: string;
    email: string;
    fullName: string;
    role: string;
    grade: number;
    avatarUrl: string;
    isVerified: boolean;
    trophies: number;
  };
}

// API Functions

/**
 * Get all users with filters and pagination (Admin only)
 * GET /api/admin/users
 */
export const getAllUsers = async (
  params?: GetUsersParams
): Promise<GetUsersResponse> => {
  try {
    // Build query string from params
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.role) queryParams.append("role", params.role);
    if (params?.grade) queryParams.append("grade", params.grade.toString());
    if (params?.isVerified !== undefined)
      queryParams.append("isVerified", params.isVerified.toString());
    if (params?.search) queryParams.append("search", params.search);

    const queryString = queryParams.toString();
    const url = buildApiUrl(
      `/api/admin/users${queryString ? `?${queryString}` : ""}`
    );

    console.log("🔵 Get All Users API URL:", url);

    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    console.log("🔑 Token exists:", !!token, "| Length:", token?.length);
    console.log("🔑 Token preview:", token?.substring(0, 30) + "...");
    console.log("📦 All localStorage keys:", Object.keys(localStorage));

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("🟢 Get Users response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Get Users failed:", response.status, errorText);
      throw new Error(`Get Users failed: ${response.status}`);
    }

    const result: GetUsersResponse = await response.json();
    console.log("✅ getAllUsers response:", result);
    return result;
  } catch (error) {
    console.error("🔴 Lỗi khi gọi API get all users:", error);
    throw error;
  }
};

/**
 * Get user by ID (Admin only)
 * GET /api/admin/users/{userId}
 */
export const getUserById = async (
  userId: number
): Promise<GetUserByIdResponse> => {
  try {
    const url = buildApiUrl(`/api/admin/users/${userId}`);
    console.log("🔵 Get User By ID API URL:", url);

    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("🟢 Get User By ID response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Get User By ID failed:", response.status, errorText);
      throw new Error(`Get User By ID failed: ${response.status}`);
    }

    const result: GetUserByIdResponse = await response.json();
    console.log("✅ getUserById response:", result);
    return result;
  } catch (error) {
    console.error("🔴 Lỗi khi gọi API get user by ID:", error);
    throw error;
  }
};

/**
 * Update user information (Admin only)
 * PUT /api/admin/users/{userId}
 */
export const updateUser = async (
  userId: number,
  userData: UpdateUserRequest
): Promise<UpdateUserResponse> => {
  try {
    const url = buildApiUrl(`/api/admin/users/${userId}`);
    console.log("🔵 Update User API URL:", url);
    console.log("📤 Update User data:", userData);

    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });

    console.log("🟢 Update User response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Update User failed:", response.status, errorText);
      throw new Error(`Update User failed: ${response.status}`);
    }

    const result: UpdateUserResponse = await response.json();
    console.log("✅ updateUser response:", result);
    return result;
  } catch (error) {
    console.error("🔴 Lỗi khi gọi API update user:", error);
    throw error;
  }
};

/**
 * Toggle user verification status (Admin only)
 * PATCH /api/admin/users/{userId}/verification
 */
export const toggleUserVerification = async (
  userId: number,
  isVerified: boolean
): Promise<{ success: boolean; message: string }> => {
  try {
    const url = buildApiUrl(`/api/admin/users/${userId}/verification`);
    console.log("🔵 Toggle Verification API URL:", url);
    console.log("📤 isVerified:", isVerified);

    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ isVerified }),
    });

    console.log("🟢 Toggle Verification response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "❌ Toggle Verification failed:",
        response.status,
        errorText
      );
      throw new Error(`Toggle Verification failed: ${response.status}`);
    }

    const result = await response.json();
    console.log("✅ toggleUserVerification response:", result);
    return result;
  } catch (error) {
    console.error("🔴 Lỗi khi gọi API toggle verification:", error);
    throw error;
  }
};
