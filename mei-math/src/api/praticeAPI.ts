import { buildApiUrl } from "../config/api";

export async function fetchQuestionsByLesson(lessonId: number) {
  const url = `/api/questions/lesson/${lessonId}`;
  const response = await fetch(buildApiUrl(url));
  if (!response.ok) {
    throw new Error("Failed to fetch questions");
  }
  const data = await response.json();
  console.log("fetchQuestionsByLesson response:", data); // Debug log
  return data;
}

export async function fetchPracticeQuestionsByLesson(lessonId: number) {
  const url = `/api/questions/lesson/${lessonId}/practice`;
  const response = await fetch(buildApiUrl(url));
  if (!response.ok) {
    throw new Error("Failed to fetch practice questions");
  }
  return response.json();
}

export async function fetchQuestionAudio(questionId: number) {
  const url = `/api/questions/${questionId}/audio`;
  const response = await fetch(buildApiUrl(url));
  if (!response.ok) {
    throw new Error("Failed to fetch question audio");
  }
  return response.json();
}

// Create or update a practice session
export async function createOrUpdatePracticeSession(
  userId: number,
  lessonId?: number
) {
  const url = "/api/practice/session";
  const response = await fetch(buildApiUrl(url), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, lessonId }),
  });

  if (!response.ok) {
    throw new Error("Không thể tạo phiên luyện tập");
  }

  return response.json();
}

// Create a new practice session (always creates new)
export async function createNewPracticeSession(
  userId: number,
  lessonId?: number
) {
  const url = "/api/practice/session/new";
  const response = await fetch(buildApiUrl(url), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, lessonId }),
  });

  if (!response.ok) {
    throw new Error("Không thể tạo phiên luyện tập mới");
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
  const response = await fetch(buildApiUrl(url), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ practiceId, questionId, answerId }),
  });

  if (!response.ok) {
    // Try to extract response body to provide more context for caller
    let bodyText = "";
    try {
      bodyText = await response.text();
      // If body is JSON, keep it readable
      try {
        const parsed = JSON.parse(bodyText);
        bodyText = JSON.stringify(parsed);
      } catch (e) {
        // keep raw text
      }
    } catch (e) {
      bodyText = "(no response body)";
    }
    throw new Error(`HTTP ${response.status}: ${bodyText}`);
  }

  return response.json();
}

// Complete a practice session
export async function completePracticeSession(practiceId: number) {
  const response = await fetch(
    buildApiUrl(`/api/practice/session/${practiceId}/complete`),
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to complete practice session");
  }

  return response.json();
}

// API để lấy progress của user cho lesson
export async function getLessonProgress(lessonId: number) {
  const response = await fetch(
    buildApiUrl(`/api/practice/progress/lesson/${lessonId}`)
  );

  if (!response.ok) {
    return { progress: 0, completed: false };
  }

  return response.json();
}

// Lấy điểm và thông tin phiên luyện tập
export async function fetchPracticeSessionScore(practiceId: number) {
  const url = `/api/practice/session/${practiceId}/score`;
  const response = await fetch(buildApiUrl(url));
  if (!response.ok) {
    throw new Error("Failed to fetch practice session score");
  }
  return response.json();
}

// Lấy lịch sử luyện tập của user
export async function fetchPracticeHistoryByUser(userId: number) {
  const url = `/api/practice/history/${userId}`;
  const response = await fetch(buildApiUrl(url));
  if (!response.ok) {
    throw new Error("Failed to fetch practice history");
  }
  return response.json();
}

// Kiểm tra trạng thái của practice session
export async function checkPracticeSessionStatus(practiceId: number) {
  const response = await fetch(
    buildApiUrl(`/api/practice/session/${practiceId}/status`)
  );

  if (!response.ok) {
    throw new Error("Failed to check practice session status");
  }

  return response.json();
}
