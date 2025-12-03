import { buildApiUrl } from "../config/api";

// Interfaces
export interface LessonReview {
  id: number;
  userId: number;
  lessonId: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  user?: {
    id: number;
    username: string;
    fullName: string;
    avatarUrl?: string;
  };
}

export interface ReviewStatistics {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    "1": number;
    "2": number;
    "3": number;
    "4": number;
    "5": number;
  };
}

export interface GetReviewsResponse {
  reviews: LessonReview[];
  statistics: ReviewStatistics;
}

export interface GetUserLikedResponse {
  totalLikes: number;
  likes: number[];
}

export interface CreateReviewRequest {
  userId: number;
  lessonId: number;
  rating: number;
  comment?: string;
}

export interface CreateReviewResponse {
  message: string;
  review: {
    id: number;
    userId: number;
    lessonId: number;
    rating: number;
    comment: string | null;
    createdAt: string;
  };
  statistics: ReviewStatistics;
}

export interface LikeReviewRequest {
  userId: number;
  lessonId: number;
}

export interface LikeReviewResponse {
  success: boolean;
  message: string;
  totalLikes?: number;
}

export interface DeleteReviewResponse {
  success: boolean;
  message: string;
}

/**
 * Lấy tất cả reviews của một lesson
 * GET /api/lesson-reviews/reviews/{lessonId}
 */
export const getReviewsByLessonId = async (
  lessonId: number,
  rating?: number
): Promise<GetReviewsResponse> => {
  try {
    const queryParams = new URLSearchParams();
    if (rating) queryParams.append("rating", rating.toString());

    const url = buildApiUrl(
      `/api/lesson-reviews/reviews/${lessonId}${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`
    );

    console.log("🔵 Get Lesson Reviews API URL:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("🟢 Get Lesson Reviews response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "❌ Get Lesson Reviews failed:",
        response.status,
        errorText
      );
      throw new Error(`Get Lesson Reviews failed: ${response.status}`);
    }

    const result: GetReviewsResponse = await response.json();
    console.log("✅ getReviewsByLessonId response:", result);
    return result;
  } catch (error) {
    console.error("🔴 Lỗi khi gọi API get lesson reviews:", error);
    throw error;
  }
};

/**
 * Lấy danh sách reviews mà user đã like
 * GET /api/lesson-reviews/likes/{lessonId}
 */
export const getUserLikedReviews = async (
  lessonId: number
): Promise<GetUserLikedResponse> => {
  try {
    const url = buildApiUrl(`/api/lesson-reviews/likes/${lessonId}`);

    console.log("🔵 Get User Liked Reviews API URL:", url);

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

    console.log("🟢 Get User Liked Reviews response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "❌ Get User Liked Reviews failed:",
        response.status,
        errorText
      );
      throw new Error(`Get User Liked Reviews failed: ${response.status}`);
    }

    const result: GetUserLikedResponse = await response.json();
    console.log("✅ getUserLikedReviews response:", result);
    return result;
  } catch (error) {
    console.error("🔴 Lỗi khi gọi API get user liked reviews:", error);
    throw error;
  }
};

/**
 * Tạo review mới cho lesson
 * POST /api/lesson-reviews/review
 */
export const createLessonReview = async (
  reviewData: CreateReviewRequest
): Promise<CreateReviewResponse> => {
  try {
    const url = buildApiUrl("/api/lesson-reviews/review");

    console.log("🔵 Create Lesson Review API URL:", url);
    console.log("📤 Review data:", reviewData);

    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(reviewData),
    });

    console.log("🟢 Create Lesson Review response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "❌ Create Lesson Review failed:",
        response.status,
        errorText
      );
      throw new Error(`Create Lesson Review failed: ${response.status}`);
    }

    const result: CreateReviewResponse = await response.json();
    console.log("✅ createLessonReview response:", result);
    return result;
  } catch (error) {
    console.error("🔴 Lỗi khi gọi API create lesson review:", error);
    throw error;
  }
};

/**
 * Like/Unlike một review
 * POST /api/lesson-reviews/like
 * POST /api/lesson-reviews/unlike
 */
export const toggleLikeReview = async (
  reviewId: number,
  lessonId: number,
  isLike: boolean
): Promise<LikeReviewResponse> => {
  try {
    const endpoint = isLike
      ? "/api/lesson-reviews/like"
      : "/api/lesson-reviews/unlike";
    const url = buildApiUrl(endpoint);

    console.log(`🔵 ${isLike ? "Like" : "Unlike"} Review API URL:`, url);

    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const userId = JSON.parse(localStorage.getItem("user") || "{}").id;
    if (!userId) {
      throw new Error("User ID not found");
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId, lessonId }),
    });

    console.log(
      `🟢 ${isLike ? "Like" : "Unlike"} Review response status:`,
      response.status
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `❌ ${isLike ? "Like" : "Unlike"} Review failed:`,
        response.status,
        errorText
      );
      throw new Error(
        `${isLike ? "Like" : "Unlike"} Review failed: ${response.status}`
      );
    }

    const result: LikeReviewResponse = await response.json();
    console.log(`✅ ${isLike ? "like" : "unlike"}Review response:`, result);
    return result;
  } catch (error) {
    console.error(
      `🔴 Lỗi khi gọi API ${isLike ? "like" : "unlike"} review:`,
      error
    );
    throw error;
  }
};

/**
 * Xóa review
 * DELETE /api/lesson-reviews/review
 */
export const deleteLessonReview = async (
  userId: number,
  lessonId: number
): Promise<DeleteReviewResponse> => {
  try {
    const url = buildApiUrl("/api/lesson-reviews/review");

    console.log("🔵 Delete Lesson Review API URL:", url);

    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId, lessonId }),
    });

    console.log("🟢 Delete Lesson Review response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "❌ Delete Lesson Review failed:",
        response.status,
        errorText
      );
      throw new Error(`Delete Lesson Review failed: ${response.status}`);
    }

    const result: DeleteReviewResponse = await response.json();
    console.log("✅ deleteLessonReview response:", result);
    return result;
  } catch (error) {
    console.error("🔴 Lỗi khi gọi API delete lesson review:", error);
    throw error;
  }
};
