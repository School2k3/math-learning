import { buildApiUrl } from "../config/api";

// Interface cho admin statistics
export interface AdminStats {
  totalStudents: number;
  totalLessons: number;
  totalExams: number;
  totalChapters: number;
  activeStudents: {
    count: number;
    period: string;
  };
  lessonCompletion: {
    percentage: number;
    completed: number;
    total: number;
  };
  examPerformance: {
    avgScore: number;
    totalExams: number;
  };
}

export interface StudentsCountByGrade {
  byGrade: Array<{
    grade: number;
    count: number;
  }>;
}

export interface LessonsCount {
  totalLessons: number;
  byGrade: Array<{
    grade: number;
    count: number;
  }>;
}

export interface ExamsCount {
  totalExams: number;
  byGrade: Array<{
    grade: number;
    count: number;
  }>;
}

export interface ChaptersCount {
  totalChapters: number;
  byGrade: Array<{
    grade: number;
    count: number;
  }>;
}

export interface ActiveStudentsData {
  activeStudents: Array<{
    userId: number;
    username: string;
    email: string;
    grade: number;
    lastActivity: string;
  }>;
}

export interface LessonCompletionData {
  lessonCompletion: {
    totalLessons: number;
    completedLessons: number;
    completionRate: number;
    averageScore: number;
  };
}

export interface StudentGradeData {
  totalStudents: number;
  byGrade: Array<{
    grade: number;
    count: number;
  }>;
}

// New interfaces for additional APIs
export interface QuestionsAnsweredData {
  totalAnswers: number;
  totalQuestions: number;
  uniqueQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  accuracy: number;
}

export interface StudentsByGradeData {
  data: Array<{
    grade: number;
    count: number;
  }>;
}

export interface CompletionBreakdownData {
  completed: {
    count: number;
    percentage: number;
  };
  inProgress: {
    count: number;
    percentage: number;
  };
  total: number;
}

export interface MonthlyTrendData {
  data: Array<{
    month: string;
    avgScore: number;
    examCount: number;
  }>;
}

export interface PerformanceByTopicData {
  data: Array<{
    topic: string;
    averageScore: number;
    completionRate: number;
  }>;
}

export interface WeeklyActivityData {
  data: Array<{
    week: string;
    lessonCompletion: number;
    activeStudents: number;
    examRegistrations: number;
    examCompletion: number;
  }>;
}

export interface RecentActivityData {
  data: Array<{
    type: string;
    user: {
      id: number;
      username: string;
      fullName: string;
    };
    title: string;
    time: string;
    score?: number;
  }>;
}

export interface MostWrongAnswersData {
  data: Array<{
    questionId: number;
    questionText: string;
    questionImage?: string;
    grade: number;
    id: number;
    totalAttempts: number;
    wrongAnswers: number;
    wrongPercentage: number;
    correctAnswers: number;
    commonWrongAnswer?: string;
  }>;
}

// API functions
export const fetchAdminStats = async (date?: string): Promise<AdminStats> => {
  try {
    const params = date ? `?date=${date}` : "";
    const url = `/api/admin-stats${params}`;
    const response = await fetch(buildApiUrl(url), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to fetch admin stats");
    }

    return data.data;
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    throw error;
  }
};

export const fetchStudentsCount = async (): Promise<StudentsCountByGrade> => {
  try {
    const url = `/api/admin-stats/students`;
    const response = await fetch(buildApiUrl(url), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to fetch students count");
    }

    return {
      byGrade: data.data.byGrade,
    };
  } catch (error) {
    console.error("Error fetching students count:", error);
    throw error;
  }
};

export const fetchLessonsCount = async (): Promise<LessonsCount> => {
  try {
    const url = `/api/admin-stats/lessons`;
    const response = await fetch(buildApiUrl(url), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to fetch lessons count");
    }

    return data.data;
  } catch (error) {
    console.error("Error fetching lessons count:", error);
    throw error;
  }
};

export const fetchExamsCount = async (): Promise<ExamsCount> => {
  try {
    const url = `/api/admin-stats/exams`;
    const response = await fetch(buildApiUrl(url), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to fetch exams count");
    }

    return data.data;
  } catch (error) {
    console.error("Error fetching exams count:", error);
    throw error;
  }
};

export const fetchChaptersCount = async (): Promise<ChaptersCount> => {
  try {
    const url = `/api/admin-stats/chapters`;
    const response = await fetch(buildApiUrl(url), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to fetch chapters count");
    }

    return data.data;
  } catch (error) {
    console.error("Error fetching chapters count:", error);
    throw error;
  }
};

export const fetchActiveStudents = async (
  date?: string,
  days: number = 7
): Promise<ActiveStudentsData> => {
  try {
    const params = new URLSearchParams();
    if (date) params.append("date", date);
    params.append("days", days.toString());

    const url = `/api/admin-stats/active-students?${params.toString()}`;
    const response = await fetch(buildApiUrl(url), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to fetch active students");
    }

    return {
      activeStudents: data.data.activeStudents,
    };
  } catch (error) {
    console.error("Error fetching active students:", error);
    throw error;
  }
};

export const fetchLessonCompletion = async (
  date?: string
): Promise<LessonCompletionData> => {
  try {
    const params = date ? `?date=${date}` : "";
    const url = `/api/admin-stats/completion-rate${params}`;
    const response = await fetch(buildApiUrl(url), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to fetch lesson completion");
    }

    return data.data;
  } catch (error) {
    console.error("Error fetching lesson completion:", error);
    throw error;
  }
};

export const fetchStudentGrades = async (): Promise<StudentGradeData> => {
  try {
    const url = `/api/admin-stats/average-score`;
    const response = await fetch(buildApiUrl(url), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to fetch student grades");
    }

    return data.data;
  } catch (error) {
    console.error("Error fetching student grades:", error);
    throw error;
  }
};

// New API functions
export const fetchQuestionsAnswered =
  async (): Promise<QuestionsAnsweredData> => {
    try {
      const url = `/api/admin-stats/questions`;
      const response = await fetch(buildApiUrl(url), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch questions answered");
      }

      return data.data;
    } catch (error) {
      console.error("Error fetching questions answered:", error);
      throw error;
    }
  };

export const fetchStudentsByGrade = async (): Promise<StudentsByGradeData> => {
  try {
    const url = `/api/admin-stats/students-by-grade`;
    const response = await fetch(buildApiUrl(url), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to fetch students by grade");
    }

    return data;
  } catch (error) {
    console.error("Error fetching students by grade:", error);
    throw error;
  }
};

export const fetchCompletionBreakdown = async (
  fromDate?: string,
  toDate?: string
): Promise<CompletionBreakdownData> => {
  try {
    const params = new URLSearchParams();
    if (fromDate) params.append("fromDate", fromDate);
    if (toDate) params.append("toDate", toDate);

    const url = `/api/admin-stats/completion-breakdown${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    const response = await fetch(buildApiUrl(url), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to fetch completion breakdown");
    }

    return data.data;
  } catch (error) {
    console.error("Error fetching completion breakdown:", error);
    throw error;
  }
};

export const fetchMonthlyTrend = async (
  months: number = 6,
  fromDate?: string,
  toDate?: string
): Promise<MonthlyTrendData> => {
  try {
    const params = new URLSearchParams();
    params.append("months", months.toString());
    if (fromDate) params.append("fromDate", fromDate);
    if (toDate) params.append("toDate", toDate);

    const url = `/api/admin-stats/monthly-trend?${params.toString()}`;
    const response = await fetch(buildApiUrl(url), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to fetch monthly trend");
    }

    return data;
  } catch (error) {
    console.error("Error fetching monthly trend:", error);
    throw error;
  }
};

export const fetchPerformanceByTopic = async (
  fromDate?: string,
  toDate?: string
): Promise<PerformanceByTopicData> => {
  try {
    const params = new URLSearchParams();
    if (fromDate) params.append("fromDate", fromDate);
    if (toDate) params.append("toDate", toDate);

    const url = `/api/admin-stats/performance-by-topic${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    const response = await fetch(buildApiUrl(url), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to fetch performance by topic");
    }

    return data;
  } catch (error) {
    console.error("Error fetching performance by topic:", error);
    throw error;
  }
};

export const fetchWeeklyActivity = async (
  weeks: number = 4,
  fromDate?: string,
  toDate?: string
): Promise<WeeklyActivityData> => {
  try {
    const params = new URLSearchParams();
    params.append("weeks", weeks.toString());
    if (fromDate) params.append("fromDate", fromDate);
    if (toDate) params.append("toDate", toDate);

    const url = `/api/admin-stats/weekly-activity?${params.toString()}`;
    const response = await fetch(buildApiUrl(url), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to fetch weekly activity");
    }

    return data;
  } catch (error) {
    console.error("Error fetching weekly activity:", error);
    throw error;
  }
};

export const fetchRecentActivity = async (
  limit: number = 10
): Promise<RecentActivityData> => {
  try {
    const params = new URLSearchParams();
    params.append("limit", limit.toString());

    const url = `/api/admin-stats/recent-activity?${params.toString()}`;
    const response = await fetch(buildApiUrl(url), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to fetch recent activity");
    }

    return data;
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    throw error;
  }
};

export const fetchMostWrongAnswersPractice = async (
  limit: number = 20,
  fromDate?: string,
  toDate?: string
): Promise<MostWrongAnswersData> => {
  try {
    const params = new URLSearchParams();
    params.append("limit", limit.toString());
    if (fromDate) params.append("fromDate", fromDate);
    if (toDate) params.append("toDate", toDate);

    const url = `/api/admin-stats/most-wrong-answers-practice?${params.toString()}`;
    const response = await fetch(buildApiUrl(url), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(
        data.message || "Failed to fetch most wrong practice answers"
      );
    }

    return data;
  } catch (error) {
    console.error("Error fetching most wrong practice answers:", error);
    throw error;
  }
};

export const fetchMostWrongAnswersExam = async (
  limit: number = 20,
  fromDate?: string,
  toDate?: string
): Promise<MostWrongAnswersData> => {
  try {
    const params = new URLSearchParams();
    params.append("limit", limit.toString());
    if (fromDate) params.append("fromDate", fromDate);
    if (toDate) params.append("toDate", toDate);

    const url = `/api/admin-stats/most-wrong-answers-exam?${params.toString()}`;
    const response = await fetch(buildApiUrl(url), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(
        data.message || "Failed to fetch most wrong exam answers"
      );
    }

    return data;
  } catch (error) {
    console.error("Error fetching most wrong exam answers:", error);
    throw error;
  }
};
