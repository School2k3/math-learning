export async function fetchLessonsByChapter(chapterId: number) {
  const url = `/api/lessons?chapterId=${chapterId}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch lessons");
  }
  return response.json();
}
