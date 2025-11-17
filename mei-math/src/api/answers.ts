import { buildApiUrl } from "../config/api";

export async function fetchAnswersByQuestionId(questionId: number) {
  const response = await fetch(buildApiUrl(`/api/answers/question/${questionId}`));
  if (!response.ok) {
    throw new Error("Failed to fetch answers");
  }
  return response.json();
}

export async function updateAnswerById(
  id: number,
  answerData: {
    answerText: string;
    isCorrect: boolean;
  }
) {
  const response = await fetch(`/api/answers/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(answerData),
  });
  if (!response.ok) {
    throw new Error("Failed to update answer");
  }
  return response.json();
}
