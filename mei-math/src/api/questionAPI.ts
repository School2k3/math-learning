import { buildApiUrl } from "../config/api";

// Lấy tất cả questions (không filter)
export async function fetchAllQuestions() {
  const url = `/api/questions`;
  const response = await fetch(buildApiUrl(url));
  if (!response.ok) {
    throw new Error("Failed to fetch questions");
  }
  const data = await response.json();
  console.log("fetchAllQuestions response:", data);
  return data;
}

// Lấy questions theo grade
export async function fetchQuestionsByGrade(grade: number) {
  const url = `/api/questions?grade=${grade}`;
  const response = await fetch(buildApiUrl(url));
  if (!response.ok) {
    throw new Error("Failed to fetch questions");
  }
  return response.json();
}

// Lấy questions theo type
export async function fetchQuestionsByType(type: string) {
  const url = `/api/questions?type=${type}`;
  const response = await fetch(buildApiUrl(url));
  if (!response.ok) {
    throw new Error("Failed to fetch questions");
  }
  return response.json();
}

// Lấy questions theo answerType
export async function fetchQuestionsByAnswerType(answerType: string) {
  const url = `/api/questions?answerType=${answerType}`;
  const response = await fetch(buildApiUrl(url));
  if (!response.ok) {
    throw new Error("Failed to fetch questions");
  }
  return response.json();
}

// Lấy questions với multiple filters
export async function fetchQuestionsWithFilters(filters: {
  grade?: number;
  type?: string;
  answerType?: string;
}) {
  const params = new URLSearchParams();
  if (filters.grade) params.append("grade", filters.grade.toString());
  if (filters.type) params.append("type", filters.type);
  if (filters.answerType) params.append("answerType", filters.answerType);

  const url = `/api/questions?${params.toString()}`;
  const response = await fetch(buildApiUrl(url));
  if (!response.ok) {
    throw new Error("Failed to fetch questions");
  }
  return response.json();
}

// Lấy questions theo grade, type, answerType
export async function fetchQuestionsByGradeTypeAnswerType(
  grade: number,
  type: string,
  answerType: string
) {
  const params = new URLSearchParams();
  params.append("grade", grade.toString());
  params.append("type", type);
  params.append("answerType", answerType);

  const url = `/api/questions?${params.toString()}`;
  const response = await fetch(buildApiUrl(url));
  if (!response.ok) {
    throw new Error("Failed to fetch questions");
  }
  return response.json();
}

// Tạo mới câu hỏi kèm đáp án
export async function createQuestionWithAnswers(questionData: {
  questionText: string;
  imageUrl?: string;
  audioUrl?: string;
  explanationText?: string;
  explanationImg?: string;
  grade: number;
  type: string;
  answerType: string;
  lessonId: number;
  answers: { answerText: string; isCorrect: boolean }[];
}) {
  const response = await fetch(buildApiUrl("/api/questions"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(questionData),
  });
  if (!response.ok) {
    console.log(
      "Failed to create question with answers:",
      await response.text()
    );
    throw new Error("Failed to create question with answers");
  }
  return response.json();
}

// Tạo nhiều đáp án cho nhiều câu hỏi
export async function createAnswersBatch(
  answers: {
    questionId: number;
    answerText: string;
    isCorrect: boolean;
  }[]
) {
  const response = await fetch(buildApiUrl("/api/answers/batch"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(answers),
  });
  if (!response.ok) {
    throw new Error("Failed to create answers batch");
  }
  return response.json();
}

// Xóa câu hỏi theo ID
export async function deleteQuestionById(id: number) {
  const response = await fetch(buildApiUrl(`/api/questions/${id}`), {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete question");
  }
  return response.json();
}

// Cập nhật câu hỏi theo ID
export async function updateQuestionById(
  id: number,
  questionData: {
    questionText: string;
    imageUrl?: string;
    audioUrl?: string;
    explanationText?: string;
    explanationImg?: string;
    grade: number;
    type: string;
    answerType: string;
    lessonId: number;
  }
) {
  const response = await fetch(buildApiUrl(`/api/questions/${id}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(questionData),
  });
  if (!response.ok) {
    throw new Error("Failed to update question");
  }
  return response.json();
}

/**
 * Download Excel template for importing questions
 * GET /api/questions/import/template
 */
export async function downloadQuestionTemplate() {
  try {
    const url = buildApiUrl("/api/questions/import/template");
    console.log("🔵 Download template URL:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });

    console.log("🟢 Download template response status:", response.status);

    if (!response.ok) {
      throw new Error(`Failed to download template: ${response.status}`);
    }

    // Get blob from response
    const blob = await response.blob();

    // Create download link
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `questions_template_${new Date().getTime()}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);

    console.log("✅ Template downloaded successfully");
    return { success: true, message: "Template downloaded successfully" };
  } catch (error) {
    console.error("🔴 Error downloading template:", error);
    throw error;
  }
}

/**
 * Import questions from Excel file
 * POST /api/questions/import
 */
export async function importQuestionsFromExcel(file: File) {
  try {
    const url = buildApiUrl("/api/questions/import");
    console.log("🔵 Import questions URL:", url);
    console.log("📤 File:", file.name, file.size, "bytes");
    console.log(
      "⚠️ Lưu ý: Backend phải đọc sheet 'Questions', không phải sheet 'Instructions'"
    );

    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    console.log("🟢 Import response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error("❌ Import failed:", errorData);
      throw new Error(errorData.message || `Import failed: ${response.status}`);
    }

    const result = await response.json();
    console.log("✅ Import result:", result);
    return result;
  } catch (error) {
    console.error("🔴 Error importing questions:", error);
    throw error;
  }
}
