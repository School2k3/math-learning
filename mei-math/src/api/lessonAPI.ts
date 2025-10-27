export async function fetchLessonsByChapter(chapterId: number) {
  const url = `/api/lessons?chapterId=${chapterId}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch lessons");
  }
  const data = await response.json();
  console.log("fetchLessonsByChapter response:", data); // Debug log
  return data;
}

// Lấy tất cả lessons bằng cách lấy từ tất cả chapters
export async function fetchAllLessons() {
  try {
    // Lấy tất cả chapters trước
    const chaptersResponse = await fetch("/api/chapters");
    if (!chaptersResponse.ok) {
      throw new Error("Failed to fetch chapters");
    }
    const chaptersData = await chaptersResponse.json();
    const chapters = chaptersData.data?.chapters || chaptersData.chapters || [];

    // Lấy lessons từ từng chapter
    const allLessonsPromises = chapters.map((chapter: any) =>
      fetchLessonsByChapter(chapter.id)
    );

    const allLessonsResponses = await Promise.all(allLessonsPromises);

    // Gộp tất cả lessons lại - sửa để lấy từ data.lessons
    const allLessons = allLessonsResponses.flatMap(
      (response) => response.data?.lessons || response.lessons || []
    );

    console.log("fetchAllLessons - total lessons:", allLessons.length);
    return { lessons: allLessons };
  } catch (error) {
    console.error("Error fetching all lessons:", error);
    throw error;
  }
}
