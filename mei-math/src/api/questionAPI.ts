// Lấy tất cả questions (không filter)
export async function fetchAllQuestions() {
  const url = `/api/questions`;
  const response = await fetch(url);
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
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch questions");
  }
  return response.json();
}

// Lấy questions theo type
export async function fetchQuestionsByType(type: string) {
  const url = `/api/questions?type=${type}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch questions");
  }
  return response.json();
}

// Lấy questions theo answerType
export async function fetchQuestionsByAnswerType(answerType: string) {
  const url = `/api/questions?answerType=${answerType}`;
  const response = await fetch(url);
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
  const response = await fetch(url);
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
  const response = await fetch(url);
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
  const response = await fetch("/api/questions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(questionData),
  });
  if (!response.ok) {
    console.log("Failed to create question with answers:", await response.text());
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
  const response = await fetch("/api/answers/batch", {
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
  const response = await fetch(`/api/questions/${id}`, {
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
  const response = await fetch(`/api/questions/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(questionData),
  });
  if (!response.ok) {
    throw new Error("Failed to update question");
  }
  return response.json();
}
