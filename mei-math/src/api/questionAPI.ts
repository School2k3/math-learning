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
