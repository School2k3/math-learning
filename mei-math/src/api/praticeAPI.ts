export async function fetchQuestionsByLesson(lessonId: number) {
  const url = `/api/questions/lesson/${lessonId}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch questions");
  }
  return response.json();
}
