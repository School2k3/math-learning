// API cho thống kê người dùng

// Lấy tổng quan thống kê
export const getUserStats = async (userId: number) => {
  try {
    console.log("🔵 [getUserStats] Calling API for userId:", userId);
    const response = await fetch(`/api/user-stats/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    console.log("🔵 [getUserStats] Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ [getUserStats] Failed:", response.status, errorText);
      throw new Error("Failed to fetch user stats");
    }

    const data = await response.json();
    console.log("✅ [getUserStats] Success:", data);
    return data;
  } catch (error) {
    console.error("❌ [getUserStats] Error:", error);
    throw error;
  }
};

// Lấy thống kê luyện tập
export const getPracticeStats = async (userId: number) => {
  try {
    console.log("🟢 [getPracticeStats] Calling API for userId:", userId);
    const response = await fetch(`/api/user-stats/${userId}/practice`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    console.log("🟢 [getPracticeStats] Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "❌ [getPracticeStats] Failed:",
        response.status,
        errorText
      );
      throw new Error("Failed to fetch practice stats");
    }

    const data = await response.json();
    console.log("✅ [getPracticeStats] Success:", data);
    return data;
  } catch (error) {
    console.error("❌ [getPracticeStats] Error:", error);
    throw error;
  }
};

// Lấy thống kê bài kiểm tra
export const getExamStats = async (userId: number) => {
  try {
    console.log("🟡 [getExamStats] Calling API for userId:", userId);
    const response = await fetch(`/api/user-stats/${userId}/exams`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    console.log("🟡 [getExamStats] Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ [getExamStats] Failed:", response.status, errorText);
      throw new Error("Failed to fetch exam stats");
    }

    const data = await response.json();
    console.log("✅ [getExamStats] Success:", data);
    return data;
  } catch (error) {
    console.error("❌ [getExamStats] Error:", error);
    throw error;
  }
};

// Lấy thống kê câu hỏi đã trả lời
export const getQuestionStats = async (userId: number) => {
  try {
    console.log("🟣 [getQuestionStats] Calling API for userId:", userId);
    const response = await fetch(`/api/user-stats/${userId}/questions`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    console.log("🟣 [getQuestionStats] Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "❌ [getQuestionStats] Failed:",
        response.status,
        errorText
      );
      throw new Error("Failed to fetch question stats");
    }

    const data = await response.json();
    console.log("✅ [getQuestionStats] Success:", data);
    return data;
  } catch (error) {
    console.error("❌ [getQuestionStats] Error:", error);
    throw error;
  }
};

// Lấy số phút luyện tập
export const getPracticeMinutes = async (userId: number) => {
  try {
    console.log("⏱️ [getPracticeMinutes] Calling API for userId:", userId);
    const response = await fetch(`/api/user-stats/${userId}/practice-minutes`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    console.log("⏱️ [getPracticeMinutes] Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "❌ [getPracticeMinutes] Failed:",
        response.status,
        errorText
      );
      throw new Error("Failed to fetch practice minutes");
    }

    const data = await response.json();
    console.log("✅ [getPracticeMinutes] Success:", data);
    return data;
  } catch (error) {
    console.error("❌ [getPracticeMinutes] Error:", error);
    throw error;
  }
};

// Lấy số phút làm bài kiểm tra
export const getExamMinutes = async (userId: number) => {
  try {
    console.log("⏰ [getExamMinutes] Calling API for userId:", userId);
    const response = await fetch(`/api/user-stats/${userId}/exam-minutes`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    console.log("⏰ [getExamMinutes] Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ [getExamMinutes] Failed:", response.status, errorText);
      throw new Error("Failed to fetch exam minutes");
    }

    const data = await response.json();
    console.log("✅ [getExamMinutes] Success:", data);
    return data;
  } catch (error) {
    console.error("❌ [getExamMinutes] Error:", error);
    throw error;
  }
};
