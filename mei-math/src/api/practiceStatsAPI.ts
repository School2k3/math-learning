import { buildApiUrl } from "../config/api";

// Interfaces
export interface WrongAnswerQuestion {
  questionId: number;
  questionText: string;
  questionImage: string | null;
  grade: number;
  wrongCount: number;
  totalAttempts: number;
  wrongPercentage: number;
  uniqueStudents: number;
  lesson: {
    id: number;
    title: string;
    chapter: {
      id?: number;
      title: string;
      grade: number;
    };
  };
  correctAnswer: {
    id: number;
    answerText: string;
  };
  commonWrongAnswers: {
    id: number;
    answerText: string;
    count: number;
    percentage: number;
  }[];
  explanationText: string | null;
  explanationImg: string | null;
}

export interface MostWrongAnswersResponse {
  success: boolean;
  message: string;
  data: WrongAnswerQuestion[];
}

/**
 * Lấy danh sách các câu hỏi sai nhiều nhất trong practice của user
 * GET /api/user-stats/{userId}/most-wrong-answers-practice
 */
export const getMostWrongAnswersPractice = async (
  userId: number,
  limit: number = 10
): Promise<MostWrongAnswersResponse> => {
  try {
    // Build query params
    const queryParams = new URLSearchParams();
    queryParams.append("limit", limit.toString());

    const url = buildApiUrl(
      `/api/user-stats/${userId}/most-wrong-answers-practice?${queryParams.toString()}`
    );

    console.log("🔵 Get Most Wrong Answers API URL:", url);

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

    console.log("🟢 Get Most Wrong Answers response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "❌ Get Most Wrong Answers failed:",
        response.status,
        errorText
      );
      throw new Error(`Get Most Wrong Answers failed: ${response.status}`);
    }

    const result: MostWrongAnswersResponse = await response.json();
    console.log("✅ getMostWrongAnswersPractice response:", result);
    return result;
  } catch (error) {
    console.error("🔴 Lỗi khi gọi API get most wrong answers:", error);
    throw error;
  }
};
