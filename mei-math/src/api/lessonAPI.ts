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

export async function createLesson(lessonData: {
  chapterId: number;
  title: string;
  videoUrl?: string;
  imageUrl?: string;
}) {
  const response = await fetch("/api/lessons", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(lessonData),
  });

  if (!response.ok) {
    throw new Error("Failed to create lesson");
  }

  const data = await response.json();
  return data;
}

export async function updateLesson(
  id: number,
  lessonData: {
    chapterId: number;
    title: string;
    videoUrl?: string;
    imageUrl?: string;
  }
) {
  const response = await fetch(`/api/lessons/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(lessonData),
  });

  if (!response.ok) {
    throw new Error("Failed to update lesson");
  }

  const data = await response.json();
  return data;
}

export async function deleteLesson(id: number) {
  const response = await fetch(`/api/lessons/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error("Failed to delete lesson");
  }

  const data = await response.json();
  return data;
}
