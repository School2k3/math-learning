import { buildApiUrl } from "../config/api";

export async function fetchChapters(grade: number, volume: number) {
  const url = `/api/chapters?grade=${grade}&volume=${volume}`;
  const response = await fetch(buildApiUrl(url));
  if (!response.ok) {
    throw new Error("Failed to fetch chapters");
  }
  return response.json();
}

// Lấy tất cả chapters (không filter)
export async function fetchAllChapters() {
  const url = `/api/chapters`;
  const response = await fetch(buildApiUrl(url));
  if (!response.ok) {
    throw new Error("Failed to fetch chapters");
  }
  const data = await response.json();
  console.log("fetchAllChapters response:", data);
  return data;
}

// Lấy chapters theo grade
export async function fetchChaptersByGrade(grade: number) {
  const url = `/api/chapters?grade=${grade}`;
  const response = await fetch(buildApiUrl(url));
  if (!response.ok) {
    throw new Error("Failed to fetch chapters");
  }
  return response.json();
}

// Thêm chapter mới
export async function createChapter(chapterData: {
  grade: number;
  volume: number;
  title: string;
}) {
  try {
    console.log("createChapter data:", chapterData);

    const response = await fetch(buildApiUrl("/api/chapters"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(chapterData),
    });

    console.log("createChapter response status:", response.status);

    if (!response.ok) {
      const errorData = await response.text();
      console.error("createChapter error response:", errorData);
      throw new Error(`Failed to create chapter: ${response.status}`);
    }

    const result = await response.json();
    console.log("createChapter success:", result);
    return result;
  } catch (error) {
    console.error("Error in createChapter:", error);
    throw error;
  }
}

// Cập nhật chapter theo ID
export async function updateChapter(
  chapterId: number,
  chapterData: {
    grade: number;
    volume: number;
    title: string;
  }
) {
  try {
    console.log("updateChapter ID:", chapterId, "data:", chapterData);

    const response = await fetch(buildApiUrl(`/api/chapters/${chapterId}`), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(chapterData),
    });

    console.log("updateChapter response status:", response.status);

    if (!response.ok) {
      const errorData = await response.text();
      console.error("updateChapter error response:", errorData);
      throw new Error(`Failed to update chapter: ${response.status}`);
    }

    const result = await response.json();
    console.log("updateChapter success:", result);
    return result;
  } catch (error) {
    console.error("Error in updateChapter:", error);
    throw error;
  }
}

// Xóa chapter theo ID
export async function deleteChapter(chapterId: number) {
  try {
    console.log("deleteChapter ID:", chapterId);

    const response = await fetch(buildApiUrl(`/api/chapters/${chapterId}`), {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("deleteChapter response status:", response.status);

    if (!response.ok) {
      const errorData = await response.text();
      console.error("deleteChapter error response:", errorData);
      throw new Error(`Failed to delete chapter: ${response.status}`);
    }

    const result = await response.json();
    console.log("deleteChapter success:", result);
    return result;
  } catch (error) {
    console.error("Error in deleteChapter:", error);
    throw error;
  }
}
