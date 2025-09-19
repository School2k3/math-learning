export async function fetchExamsByChapter(chapterId: number) {
  const url = `/api/exams/chapter/${chapterId}`;
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
