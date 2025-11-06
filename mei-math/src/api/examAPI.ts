export async function fetchExamsByChapter(chapterId: number) {
  const url = `/api/exams?chapterId=${chapterId}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch exams");
  }
  const data = await response.json();
  console.log("fetchExamsByChapter response:", data); // Debug log
  return data;
}

// Lấy tất cả exams (không filter)
export async function fetchAllExams() {
  const url = `/api/exams`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch exams");
  }
  const data = await response.json();
  console.log("fetchAllExams response:", data);
  return data;
}

// Lấy exams theo grade
export async function fetchExamsByGrade(grade: number) {
  const url = `/api/exams?grade=${grade}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch exams");
  }
  return response.json();
}

// Hàm gọi POST /api/exams/start
export async function startExam(examId: number, userId: number) {
  const url = "/api/exams/start";
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ examId, userId }), // ĐÚNG tên trường như Swagger
  });
  if (!response.ok) {
    throw new Error("Không thể bắt đầu bài kiểm tra!");
  }
  return response.json();
}

// Hàm gọi GET /api/exams/{id}
export async function fetchExamById(id: number) {
  const url = `/api/exams/${id}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch exam");
  }
  return response.json();
}

// POST /api/exams - Tạo mới bài kiểm tra
export async function createExam(examData: {
  title: string;
  grade: number;
  chapterId: number;
  durationMinutes: number;
}) {
  const response = await fetch("/api/exams", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(examData),
  });
  if (!response.ok) {
    throw new Error("Failed to create exam");
  }
  return response.json();
}

// PUT /api/exams/{id} - Cập nhật bài kiểm tra
export async function updateExamById(
  id: number,
  examData: {
    title: string;
    grade: number;
    chapterId: number;
    durationMinutes: number;
  }
) {
  const response = await fetch(`/api/exams/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(examData),
  });
  if (!response.ok) {
    throw new Error("Failed to update exam");
  }
  return response.json();
}

// DELETE /api/exams/{id} - Xóa bài kiểm tra
export async function deleteExamById(id: number) {
  const response = await fetch(`/api/exams/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete exam");
  }
  return response.json();
}
