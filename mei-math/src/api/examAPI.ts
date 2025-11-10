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

// Lấy tiến trình hiện tại của một exam (GET /api/exams/progress/{resultId})
export async function fetchExamProgress(resultId: number) {
  const url = `/api/exams/progress/${resultId}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch exam progress");
  }
  return response.json();
}

// Lấy bài kiểm tra đang active cho user (GET /api/exams/active/{userId})
export async function fetchActiveExamByUser(userId: number) {
  const url = `/api/exams/active/${userId}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch active exam for user");
  }
  return response.json();
}

// Kết thúc bài kiểm tra (POST /api/exams/finish/{resultId})
export async function finishExam(resultId: number) {
  const url = `/api/exams/finish/${resultId}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    throw new Error("Failed to finish exam");
  }
  return response.json();
}

// Lưu đáp án cho 1 câu hỏi trong bài kiểm tra (POST /api/exams/answer)
export async function saveExamAnswer({
  resultId,
  questionId,
  chosenAnswerId,
  isFlagged = false,
}: {
  resultId: number;
  questionId: number;
  chosenAnswerId: number;
  isFlagged?: boolean;
}) {
  const url = `/api/exams/answer`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resultId, questionId, chosenAnswerId, isFlagged }),
  });
  if (!response.ok) {
    let bodyText = "";
    try {
      bodyText = await response.text();
    } catch {}
    throw new Error(`Failed to save exam answer: ${bodyText}`);
  }
  return response.json();
}

// Lấy lịch sử các bài kiểm tra của user
export async function fetchExamHistory(userId: number) {
  const url = `/api/exams/history/${userId}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch exam history");
  }
  return response.json();
}

// Lấy chi tiết kết quả một bài kiểm tra đã làm
export async function fetchExamResultDetail(resultId: number) {
  const url = `/api/exams/result/${resultId}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch exam result detail");
  }
  return response.json();
}

// Lấy tất cả kết quả (attempts) của một bài kiểm tra (GET /api/exams/{examId}/results)
export async function fetchExamResultsByExamId(
  examId: number,
  options?: { includeFinished?: boolean; includeActive?: boolean }
) {
  let url = `/api/exams/${examId}/results`;
  const params: string[] = [];
  if (options?.includeFinished !== undefined) {
    params.push(`includeFinished=${options.includeFinished}`);
  }
  if (options?.includeActive !== undefined) {
    params.push(`includeActive=${options.includeActive}`);
  }
  if (params.length > 0) {
    url += "?" + params.join("&");
  }
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch exam results by examId");
  }
  return response.json();
}

// Lấy chi tiết một kết quả bài kiểm tra theo resultId (GET /api/exams/results/{id})
export async function fetchExamResultById(resultId: number) {
  const url = `/api/exams/results/${resultId}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch exam result by id");
  }
  return response.json();
}

// ============ QUẢN LÝ CÂU HỎI TRONG BÀI KIỂM TRA ============

// GET /api/questions/exam/{examId} - Lấy danh sách câu hỏi trong bài kiểm tra
export async function fetchExamQuestions(examId: number) {
  const url = `/api/questions/exam/${examId}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch exam questions");
  }
  return response.json();
}

// POST /api/exams/questions - Thêm câu hỏi vào bài kiểm tra
export async function addQuestionToExam(data: {
  examId: number;
  questionId: number;
}) {
  console.log("addQuestionToExam data:", data);
  const response = await fetch("/api/exams/questions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  console.log("addQuestionToExam response status:", response.status);
  if (!response.ok) {
    const errorText = await response.text();
    console.error("addQuestionToExam error:", errorText);
    throw new Error(`Failed to add question to exam: ${errorText}`);
  }
  return response.json();
}

// DELETE /api/exams/questions/{id} - Xóa câu hỏi khỏi bài kiểm tra
export async function removeQuestionFromExam(id: number) {
  const response = await fetch(`/api/exams/questions/${id}`, {
    method: "DELETE",
  });
  console.log("removeQuestionFromExam response status:", id);
  if (!response.ok) {
    throw new Error("Failed to remove question from exam");
  }
  return response.json();
}
