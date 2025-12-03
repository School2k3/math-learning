import { buildApiUrl } from "../config/api";

export interface GenerateAudioResponse {
  id: number;
  audioUrl: string;
  cached: boolean;
  mimeType: string;
}

/**
 * Generate audio for a question using Gemini TTS
 * POST /api/questions/{id}/audio/generate
 */
export const generateQuestionAudio = async (
  questionId: number,
  force: boolean = false
): Promise<GenerateAudioResponse> => {
  try {
    const url = buildApiUrl(
      `/api/questions/${questionId}/audio/generate${force ? "?force=true" : ""}`
    );

    console.log("🔵 Generate Question Audio API URL:", url);
    console.log("📝 Question ID:", questionId);

    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    // Thêm timeout 30 giây
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    console.log("🟢 Generate Audio response status:", response.status);

    if (!response.ok) {
      let errorMessage = `Generate Audio failed: ${response.status}`;
      try {
        const errorData = await response.json();
        console.error("❌ Generate Audio failed:", response.status, errorData);
        errorMessage = errorData.message || errorMessage;
      } catch {
        const errorText = await response.text();
        console.error("❌ Generate Audio failed:", response.status, errorText);
      }
      throw new Error(errorMessage);
    }

    const result: GenerateAudioResponse = await response.json();
    console.log("✅ generateQuestionAudio response:", result);
    return result;
  } catch (error: any) {
    if (error.name === "AbortError") {
      console.error("🔴 Request timeout (30s)");
      throw new Error("Tạo audio quá lâu, vui lòng thử lại");
    }
    console.error("🔴 Lỗi khi generate audio:", error);
    throw error;
  }
};
