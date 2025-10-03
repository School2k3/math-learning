export async function fetchQuestionsByLesson(lessonId: number) {
  const url = `/api/questions/lesson/${lessonId}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch questions");
  }
  return response.json();
}

export async function fetchPracticeQuestionsByLesson(lessonId: number) {
  const url = `/api/questions/lesson/${lessonId}/practice`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch practice questions");
  }
  return response.json();
}

export async function fetchQuestionAudio(questionId: number) {
  const url = `/api/questions/${questionId}/audio`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch question audio");
  }
  return response.json();
}
