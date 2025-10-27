export async function fetchQuestionsByLesson(lessonId: number) {
  const url = `/api/questions/lesson/${lessonId}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch questions");
  }
  const data = await response.json();
  console.log("fetchQuestionsByLesson response:", data); // Debug log
  return data;
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

// Create or update a practice session
export async function createOrUpdatePracticeSession(
  userId: number,
  topic: string,
  lessonId?: number
) {
  const url = "/api/practice/session";
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, topic, lessonId }),
  });

  if (!response.ok) {
    throw new Error("Không thể tạo phiên luyện tập");
  }

  return response.json();
}

// Save an answer for a practice question
export async function savePracticeAnswer(
  practiceId: number,
  questionId: number,
  answerId: number
) {
  const url = "/api/practice/answer";
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ practiceId, questionId, answerId }),
  });

  if (!response.ok) {
    throw new Error("Không thể lưu câu trả lời");
  }

  return response.json();
}

// Get current score for a practice session
export async function getPracticeScore(practiceId: number) {
  const url = `/api/practice/session/${practiceId}/score`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Không thể lấy điểm luyện tập");
  }

  return response.json();
}

export async function getUserPracticeHistory(userId: number) {
  const url = `/api/practice/history/${userId}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Không thể lấy lịch sử luyện tập");
  }

  return response.json();
}

export async function createPracticeSession(lessonId: number) {
  const response = await fetch("/api/practice/session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      lessonId: lessonId,
      topic: "practiceSession",
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to create practice session");
  }

  return response.json();
}

export async function submitAnswer(
  practiceId: number,
  questionId: number,
  isCorrect: boolean
) {
  const response = await fetch("/api/practice/answer", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      practiceId: practiceId,
      questionId: questionId,
      isCorrect: isCorrect,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to submit answer");
  }

  return response.json();
}

export async function completePracticeSession(practiceId: number) {
  const response = await fetch(`/api/practice/session/${practiceId}/complete`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to complete practice session");
  }

  return response.json();
}

// API để lấy progress của user cho lesson
export async function getLessonProgress(lessonId: number) {
  const response = await fetch(`/api/practice/progress/lesson/${lessonId}`);

  if (!response.ok) {
    return { progress: 0, completed: false };
  }

  return response.json();
}
