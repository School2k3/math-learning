import React, { useState, useEffect } from "react";
import Header from "../components/header";
import "../css/dash-user.css";
import { useAuth } from "../contexts/AuthContext";
import { fetchChaptersByGrade } from "../api/chapterAPI";
import { fetchLessonsByChapter } from "../api/lessonAPI";
import { fetchPracticeHistoryByUser } from "../api/praticeAPI";
import { fetchExamsByChapter } from "../api/examAPI";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  getUserStats, 
  getPracticeStats, 
  getExamStats, 
  getQuestionStats,
  getPracticeMinutes,
  getExamMinutes
} from "../api/userStatsAPI";
import { getMostWrongAnswersPractice } from "../api/practiceStatsAPI";
import type { WrongAnswerQuestion } from "../api/practiceStatsAPI";


const DashUser: React.FC = () => {
  const [activeTab, setActiveTab] = useState("Đánh giá chung");
  // const [startDate, setStartDate] = useState("2025-10-25");
  // const [endDate, setEndDate] = useState("2025-11-01");
  const [chapters, setChapters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [practiceHistory, setPracticeHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [lessonsMap, setLessonsMap] = useState<{[key: number]: any}>({});
  const [_lessonProgress, setLessonProgress] = useState<{[key: number]: {progress: number, completed: boolean}}>({});
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);
  const [exams, setExams] = useState<any[]>([]);
  const [loadingExams, setLoadingExams] = useState(false);
  
  // State cho câu hỏi sai nhiều nhất
  const [wrongAnswers, setWrongAnswers] = useState<WrongAnswerQuestion[]>([]);
  const [loadingWrongAnswers, setLoadingWrongAnswers] = useState(false);
  const [wrongAnswersLimit, setWrongAnswersLimit] = useState(10);
  const [selectedQuestion, setSelectedQuestion] = useState<WrongAnswerQuestion | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // State cho thống kê
  const [statsData, setStatsData] = useState({
    questionsAnswered: 0,
    practiceMinutes: 0,
    examsCompleted: 0,
    examMinutes: 0,
    topicsPracticed: 0,
    trophies: 0
  });

  const { user } = useAuth(); // Lấy user từ AuthContext
  const navigate = useNavigate();
  const location = useLocation();

  // Xử lý activeTab từ location.state khi quay lại từ exams-history
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
      // Clear state để tránh lặp lại khi refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const tabs = [
    "Đánh giá chung",
    "Lịch sử luyện tập", 
    "Tiến độ học tập",
    "Bài kiểm tra vui học"
  ];

  const stats = [
    {
      icon: "📝",
      value: statsData.questionsAnswered,
      label: "Câu hỏi đã trả lời",
      color: "#49BBBD"
    },
    {
      icon: "⏱️", 
      value: statsData.practiceMinutes,
      label: "Số phút đã luyện tập",
      color: "#FF6B6B"
    },
    {
      icon: "📊",
      value: statsData.examsCompleted,
      label: "Số bài kiểm tra đã làm",
      color: "#4ECDC4"
    },
    {
      icon: "⏰",
      value: statsData.examMinutes,
      label: "Số phút đã làm kiểm tra",
      color: "#FFE66D"
    },
    {
      icon: "⭐",
      value: statsData.topicsPracticed,
      label: "Chủ điểm đã thực hành",
      color: "#A8E6CF"
    },
    {
      icon: "🏆",
      value: statsData.trophies,
      label: "Cúp vàng",
      color: "#FFD700"
    }
  ];

  // Load stats data khi component mount
  useEffect(() => {
    const loadStatsData = async () => {
      if (!user?.id) {
        console.warn("⚠️ [loadStatsData] No user ID available");
        return;
      }

      console.log("📊 [loadStatsData] Starting to load stats for userId:", user.id);

      try {
        // Gọi tất cả các API thống kê song song
        console.log("🔄 [loadStatsData] Calling all stats APIs in parallel...");
        const [
          userStatsRes,
          practiceStatsRes,
          examStatsRes,
          questionStatsRes,
          practiceMinutesRes,
          examMinutesRes
        ] = await Promise.all([
          getUserStats(user.id),
          getPracticeStats(user.id),
          getExamStats(user.id),
          getQuestionStats(user.id),
          getPracticeMinutes(user.id),
          getExamMinutes(user.id)
        ]);

        console.log("📦 [loadStatsData] All API responses received:", {
          userStats: userStatsRes,
          practiceStats: practiceStatsRes,
          examStats: examStatsRes,
          questionStats: questionStatsRes,
          practiceMinutes: practiceMinutesRes,
          examMinutes: examMinutesRes
        });

        // Cập nhật state với dữ liệu từ API
        const newStatsData = {
          questionsAnswered: questionStatsRes.data?.totalAnswered || 0,
          practiceMinutes: practiceMinutesRes.data?.totalMinutes || 0,
          examsCompleted: examStatsRes.data?.completedExams || 0,
          examMinutes: examMinutesRes.data?.totalMinutes || 0,
          topicsPracticed: practiceStatsRes.data?.completedSessions || 0,
          trophies: userStatsRes.data?.trophies || 0
        };

        console.log("✅ [loadStatsData] Updating state with:", newStatsData);
        setStatsData(newStatsData);

        console.log("🎉 [loadStatsData] Stats loaded successfully!");
      } catch (error) {
        console.error("❌ [loadStatsData] Error loading stats:", error);
      }
    };

    loadStatsData();
  }, [user?.id]);

  // Load chapters và lessons khi component mount
  useEffect(() => {
    const loadChaptersAndLessons = async () => {
      if (!user?.grade) {
        setLoading(false);
        return;
      }

      try {
        console.log("📚 Loading chapters for grade:", user.grade);
        
        const chaptersData = await fetchChaptersByGrade(user.grade);
        const chaptersArray = chaptersData.data?.chapters || chaptersData.chapters || [];
        
        console.log("✅ Chapters loaded:", chaptersArray);

        // Tạo map lessons để dễ lookup
        const lessonsMapTemp: {[key: number]: any} = {};
        const userId = user?.id || 1;

        // Load lessons cho mỗi chapter
        const chaptersWithLessons = await Promise.all(
          chaptersArray.map(async (chapter: any) => {
            try {
              const lessonsData = await fetchLessonsByChapter(chapter.id);
              const lessons = lessonsData.data?.lessons || lessonsData.lessons || [];
              
              // Lưu vào map
              lessons.forEach((lesson: any) => {
                lessonsMapTemp[lesson.id] = lesson;
              });
              
              return {
                ...chapter,
                lessons: lessons
              };
            } catch (error) {
              console.error(`Error loading lessons for chapter ${chapter.id}:`, error);
              return {
                ...chapter,
                lessons: []
              };
            }
          })
        );

        // Load progress cho tất cả lessons
        try {
          const historyData = await fetchPracticeHistoryByUser(userId);
          const progressMap: {[key: number]: {progress: number, completed: boolean}} = {};
          
          // Tạo map từ practiceHistory
          Object.keys(lessonsMapTemp).forEach((lessonIdStr) => {
            const lessonId = parseInt(lessonIdStr);
            const sessions = historyData.practiceHistory.filter(
              (s: any) => s.lessonId === lessonId
            );
            
            if (sessions.length > 0) {
              // Lấy session mới nhất - sort theo finishedAt
              const latestSession = sessions.sort((a: any, b: any) => {
                const dateA = a.finishedAt ? new Date(a.finishedAt).getTime() : 0;
                const dateB = b.finishedAt ? new Date(b.finishedAt).getTime() : 0;
                return dateB - dateA;
              })[0];
              
              const score = latestSession ? latestSession.score : 0;
              // Completed if the session has finishedAt
              const completed = latestSession ? latestSession.finishedAt !== null : false;
              // Progress should be 100% if completed, otherwise show actual score
              const progress = completed ? 100 : score;
              
              progressMap[lessonId] = { progress, completed };
            } else {
              progressMap[lessonId] = { progress: 0, completed: false };
            }
          });
          
          setLessonProgress(progressMap);
          
          // Add status based on progress
          const chaptersWithProgress = chaptersWithLessons.map(chapter => ({
            ...chapter,
            lessons: chapter.lessons.map((lesson: any) => {
              const prog = progressMap[lesson.id];
              let status = 'not-started';
              
              if (prog) {
                if (prog.progress === 100) {
                  status = 'completed';
                } else if (prog.progress >= 50) {
                  status = 'in-progress';
                } else if (prog.progress > 0) {
                  status = 'not-done';
                }
              }
              
              return {
                ...lesson,
                status
              };
            })
          }));
          
          setChapters(chaptersWithProgress);
        } catch (error) {
          console.error("Error loading progress:", error);
          setChapters(chaptersWithLessons);
        }
        
        setLessonsMap(lessonsMapTemp);
      } catch (error) {
        console.error("❌ Error loading chapters:", error);
      } finally {
        setLoading(false);
      }
    };

    loadChaptersAndLessons();
  }, [user]);

  // Load wrong answers khi chuyển tab
  useEffect(() => {
    if (activeTab === "Tiến độ học tập" && user?.id) {
      const loadWrongAnswers = async () => {
        setLoadingWrongAnswers(true);
        try {
          const result = await getMostWrongAnswersPractice(user.id, wrongAnswersLimit);
          console.log("✅ Wrong answers loaded:", result);
          if (result.success && result.data) {
            setWrongAnswers(result.data);
          }
        } catch (error) {
          console.error("❌ Error loading wrong answers:", error);
          setWrongAnswers([]);
        } finally {
          setLoadingWrongAnswers(false);
        }
      };

      loadWrongAnswers();
    }
  }, [activeTab, wrongAnswersLimit, user]);

  // Load exams khi chuyển tab
  useEffect(() => {
    if (activeTab === "Bài kiểm tra vui học" && chapters.length > 0) {
      const loadExams = async () => {
        setLoadingExams(true);
        try {
          // Load exams cho tất cả chapters
          const allExamsPromises = chapters.map(async (chapter) => {
            try {
              const data = await fetchExamsByChapter(chapter.id);
              return data.exams || [];
            } catch (error) {
              console.error(`Error loading exams for chapter ${chapter.id}:`, error);
              return [];
            }
          });
          
          const allExamsArrays = await Promise.all(allExamsPromises);
          const allExams = allExamsArrays.flat();
          setExams(allExams);
        } catch (error) {
          console.error("Error loading exams:", error);
          setExams([]);
        } finally {
          setLoadingExams(false);
        }
      };

      loadExams();
    }
  }, [activeTab, chapters]);

  // Load practice history khi chuyển tab
  useEffect(() => {
    if (activeTab === "Lịch sử luyện tập" && user?.id) {
      const loadPracticeHistory = async () => {
        setLoadingHistory(true);
        try {
          const result = await fetchPracticeHistoryByUser(user.id);
          console.log("✅ Practice history loaded:", result);
          console.log("📊 Sample practice data:", result.practiceHistory?.[0]);
          if (result.practiceHistory?.[0]) {
            const sample = result.practiceHistory[0];
            console.log("🕐 Time data:", {
              startedAt: sample.startedAt,
              finishedAt: sample.finishedAt,
              createdAt: sample.createdAt,
              updatedAt: sample.updatedAt,
              calculated: formatDuration(sample.startedAt || sample.createdAt, sample.finishedAt || sample.updatedAt)
            });
          }
          setPracticeHistory(result.practiceHistory || []);
        } catch (error) {
          console.error("❌ Error loading practice history:", error);
          setPracticeHistory([]);
        } finally {
          setLoadingHistory(false);
        }
      };

      loadPracticeHistory();
    }
  }, [activeTab, user]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (startDate: string, endDate: string | null) => {
    if (!endDate) {
      // Nếu không có endDate, kiểm tra xem có phải session cũ không
      if (!startDate) return "N/A";
      
      const start = new Date(startDate);
      const now = new Date();
      const diffMs = now.getTime() - start.getTime();
      
      // Nếu session cũ hơn 1 ngày, có thể dữ liệu bị thiếu
      if (diffMs > 24 * 60 * 60 * 1000) {
        return "N/A";
      }
      
      return "Đang luyện tập";
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffMs = end.getTime() - start.getTime();
    
    // Nếu thời gian âm hoặc quá lớn (> 24h), có thể dữ liệu sai
    if (diffMs < 0 || diffMs > 24 * 60 * 60 * 1000) {
      return "N/A";
    }
    
    const diffSecs = Math.floor(diffMs / 1000);
    const hours = Math.floor(diffSecs / 3600);
    const mins = Math.floor((diffSecs % 3600) / 60);
    const secs = diffSecs % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    } else if (mins > 0) {
      return `${mins}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const handleLessonClick = (lessonId: number) => {
    setSelectedLessonId(lessonId);
    setActiveTab("Lịch sử luyện tập");
  };

  const renderContent = () => {
    if (activeTab === "Lịch sử luyện tập") {
      // Lọc lịch sử theo lessonId nếu có chọn
      const filteredHistory = selectedLessonId 
        ? practiceHistory.filter(p => p.lessonId === selectedLessonId)
        : practiceHistory;

      return (
        <div className="practice-history-section">
          <div className="practice-history-header">
            <h2 className={selectedLessonId ? "section-title section-title-no-margin" : "section-title"}>
              Lịch sử luyện tập
              {selectedLessonId && lessonsMap[selectedLessonId] && (
                <span className="lesson-filter-text">
                  - {lessonsMap[selectedLessonId].title}
                </span>
              )}
            </h2>
            {selectedLessonId && (
              <button 
                className="clear-filter-btn"
                onClick={() => setSelectedLessonId(null)}
              >
                Xem tất cả
              </button>
            )}
          </div>
          
          {loadingHistory ? (
            <div className="loading-state">Đang tải lịch sử...</div>
          ) : filteredHistory.length === 0 ? (
            <div className="empty-state">
              <p>
                {selectedLessonId 
                  ? `Bạn chưa có lịch sử luyện tập cho bài học này.`
                  : `Bạn chưa có lịch sử luyện tập nào.`
                }
              </p>
              <button 
                className="start-practice-btn"
                onClick={() => navigate("/study")}
              >
                Bắt đầu luyện tập
              </button>
            </div>
          ) : (
            <div className="history-table-wrapper">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Bài học</th>
                    <th>Ngày luyện tập</th>
                    <th>Thời gian</th>
                    <th>Điểm số</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map((practice) => (
                    <tr key={practice.id}>
                      <td className="practice-title">
                        {lessonsMap[practice.lessonId]?.title || practice.lessonTitle || `Bài học #${practice.lessonId}`}
                      </td>
                      <td>{formatDate(practice.startedAt || practice.createdAt)}</td>
                      <td>
                        {formatDuration(
                          practice.startedAt || practice.createdAt, 
                          practice.finishedAt || practice.updatedAt
                        )}
                      </td>
                      <td className="score">
                        <span className={`score-badge ${practice.score >= 80 ? 'high' : practice.score >= 50 ? 'medium' : 'low'}`}>
                          {practice.score || 0}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${practice.finishedAt ? 'completed' : 'in-progress'}`}>
                          {practice.finishedAt ? 'Hoàn thành' : 'Đang luyện tập'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      );
    }

    // Tab "Tiến độ học tập" - Hiển thị câu hỏi sai nhiều nhất
    if (activeTab === "Tiến độ học tập") {
      return (
        <div className="wrong-answers-section">
          <div className="section-header">
            <h2 className="section-title">Các câu hỏi bạn hay sai nhất</h2>
            <div className="filters-container">
              <div className="filter-group">
                <label htmlFor="limit-select">Hiển thị:</label>
                <select 
                  id="limit-select"
                  value={wrongAnswersLimit}
                  onChange={(e) => setWrongAnswersLimit(Number(e.target.value))}
                  className="filter-select"
                >
                  <option value={5}>5 câu</option>
                  <option value={10}>10 câu</option>
                  <option value={15}>15 câu</option>
                  <option value={20}>20 câu</option>
                </select>
              </div>
            </div>
          </div>
          
          {loadingWrongAnswers ? (
            <div className="loading-state">Đang tải dữ liệu...</div>
          ) : wrongAnswers.length === 0 ? (
            <div className="empty-state">
              <p>Chưa có dữ liệu về câu hỏi sai. Hãy bắt đầu luyện tập!</p>
              <button 
                className="start-practice-btn"
                onClick={() => navigate("/study")}
              >
                Bắt đầu luyện tập
              </button>
            </div>
          ) : (
            <div className="wrong-answers-grid">
              {wrongAnswers.map((item, index) => (
                <div key={item.questionId} className="wrong-answer-card">
                  <div className="card-header">
                    <div className="rank-badge">#{index + 1}</div>
                    <div className="wrong-count">
                      <span className="count-number">{item.wrongCount}</span>
                      <span className="count-label">lần sai</span>
                    </div>
                  </div>
                  
                  <div 
                    className="card-body"
                    onClick={() => {
                      setSelectedQuestion(item);
                      setShowDetailModal(true);
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="lesson-info">
                      <span className="lesson-badge grade-badge">Lớp {item.grade}</span>
                      <span className="chapter-badge" title={item.lesson.chapter.title}>
                        📚 {item.lesson.chapter.title.length > 25 
                          ? item.lesson.chapter.title.substring(0, 25) + '...' 
                          : item.lesson.chapter.title}
                      </span>
                    </div>
                    
                    <div className="question-content">
                      <p className="question-text">{item.questionText}</p>
                      {item.questionImage && (
                        <img 
                          src={item.questionImage} 
                          alt="Câu hỏi"
                          className="question-image-preview"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      )}
                    </div>
                    
                    <div className="click-hint">👆 Click để xem chi tiết</div>
                  </div>
                  
                  <button 
                    className="practice-again-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Tìm chapterId từ lessonsMap hoặc từ item.lesson.chapter.id
                      const lesson = lessonsMap[item.lesson.id];
                      const chapterId = item.lesson.chapter.id || lesson?.chapterId;
                      
                      // Xác định học kỳ từ lesson hoặc chapter
                      const chapter = chapterId ? chapters.find(c => c.id === chapterId) : null;
                      const semester = chapter?.volume || 1;
                      
                      console.log("🔵 Navigate to practice:", {
                        lessonId: item.lesson.id,
                        chapterId,
                        grade: item.grade,
                        semester
                      });
                      
                      // Navigate với đầy đủ params để focus vào đúng chương
                      navigate(`/study?gradeId=${item.grade}&semester=${semester}&chapterId=${chapterId}`);
                    }}
                  >
                    Luyện tập lại
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    // Tab "Bài kiểm tra vui học"
    if (activeTab === "Bài kiểm tra vui học") {
      return (
        <div className="exams-section">
          <h2 className="section-title">Danh sách bài kiểm tra</h2>
          
          {loadingExams ? (
            <div className="loading-state">Đang tải danh sách bài kiểm tra...</div>
          ) : exams.length === 0 ? (
            <div className="empty-state">
              <p>Chưa có bài kiểm tra nào.</p>
            </div>
          ) : (
            <div className="exams-grid">
              {exams.map((exam) => (
                <div key={exam.id} className="exam-card">
                  <div className="exam-card-header">
                    <h3 className="exam-card-title">{exam.title}</h3>
                    <span className="exam-card-chapter">{chapters.find(c => c.id === exam.chapterId)?.title || 'Chương'}</span>
                  </div>
                  <div className="exam-card-info">
                    {/* <div className="exam-info-item">
                      <span className="exam-info-label">Số câu hỏi:</span>
                      <span className="exam-info-value">{exam.questionCount || 0}</span>
                    </div>
                    <div className="exam-info-item">
                      <span className="exam-info-label">Thời gian:</span>
                      <span className="exam-info-value">{exam.duration || 0} phút</span>
                    </div> */}
                  </div>
                  <button 
                    className="exam-history-btn"
                    onClick={() => navigate("/exams-history", { 
                      state: { 
                        examId: exam.id,
                        grade: user?.grade,
                        chapterId: exam.chapterId 
                      } 
                    })}
                  >
                    Xem lịch sử
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    // Nội dung tab "Đánh giá chung" (mặc định)
    return (
      <>
        {/* Time Period Section */}
        {/* <div className="time-period-section">
          <h2 className="period-title">Trong 7 ngày qua...</h2>
          
          <div className="date-range-picker">
            <span className="date-label">Từ</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="date-input"
              title="Chọn ngày bắt đầu"
              aria-label="Ngày bắt đầu"
            />
            <span className="date-label">đến</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="date-input"
              title="Chọn ngày kết thúc"
              aria-label="Ngày kết thúc"
            />
          </div>

          <div className="review-note">
            <span className="review-text">
              Bạn có thể xem lại đánh giá của năm học cũ{" "}
              <span 
                className="review-link"
                onClick={() => {
                  // Navigate to historical review or show modal
                  console.log("Show historical review");
                }}
              >
                tại đây
              </span>
            </span>
          </div>
        </div> */}

        {/* Statistics Cards */}
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-icon-container">
                <span className="stat-icon">{stat.icon}</span>
                <span className="stat-value">{stat.value}</span>
              </div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Student Summary */}
        <div className="student-summary">
          <h3 className="summary-title">
            TỔNG QUAN TOÀN BỘ KIẾN THỨC - <span className="student-name">{user?.fullName?.toUpperCase() || "STUDENT"}</span>
          </h3>
          
          <div className="legend">
            <div className="legend-item">
              <span className="legend-dot completed"></span>
              <span>Hoàn thành</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot not-done"></span>
              <span>Chưa tốt</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot in-progress"></span>
              <span>Đang thực hành</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot not-started"></span>
              <span>Chưa thực hành</span>
            </div>
          </div>
        </div>

        {/* Chapters và Lessons */}
        {loading ? (
          <div className="loading-chapters">Đang tải nội dung học tập...</div>
        ) : (
          <div className="chapters-container">
            {/* Học kỳ 1 */}
            <div className="semester-title">HỌC KỲ 1</div>
            {chapters.filter((chapter: any) => chapter.volume === 1).map((chapter) => (
              <div key={chapter.id} className="chapter-section">
                <h3 className="chapter-title">{chapter.title}</h3>
                
                <div className="lessons-grid">
                  {chapter.lessons && chapter.lessons.length > 0 ? (
                    chapter.lessons.map((lesson: any) => (
                      <div
                        key={lesson.id}
                        className={`lesson-circle ${lesson.status}`}
                        title={lesson.title}
                        onClick={() => handleLessonClick(lesson.id)}
                      >
                        {/* Có thể hiển thị số thứ tự hoặc để trống */}
                      </div>
                    ))
                  ) : (
                    <div className="no-lessons">Chưa có bài học</div>
                  )}
                </div>
              </div>
            ))}

            {/* Học kỳ 2 */}
            <div className="semester-title semester-2">HỌC KỲ 2</div>
            {chapters.filter((chapter: any) => chapter.volume === 2).map((chapter) => (
              <div key={chapter.id} className="chapter-section">
                <h3 className="chapter-title">{chapter.title}</h3>
                
                <div className="lessons-grid">
                  {chapter.lessons && chapter.lessons.length > 0 ? (
                    chapter.lessons.map((lesson: any) => (
                      <div
                        key={lesson.id}
                        className={`lesson-circle ${lesson.status}`}
                        title={lesson.title}
                        onClick={() => handleLessonClick(lesson.id)}
                      >
                        {/* Có thể hiển thị số thứ tự hoặc để trống */}
                      </div>
                    ))
                  ) : (
                    <div className="no-lessons">Chưa có bài học</div>
                  )}
                </div>
              </div>
            ))}

            {chapters.length === 0 && !loading && (
              <div className="no-chapters">
                Không có chương học nào cho lớp {user?.grade || "của bạn"}
              </div>
            )}
          </div>
        )}
      </>
    );
  };

  return (
    <div className="dash-user-container">
      <Header bgWhite />
      
      <div className="dash-user-content">
        {/* Tabs */}
        <div className="dash-user-tabs">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`dash-tab ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="dash-user-main">
          {renderContent()}
        </div>
      </div>
      
      {/* Modal chi tiết câu hỏi */}
      {showDetailModal && selectedQuestion && (
        <div className="question-detail-modal" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowDetailModal(false)}>✕</button>
            
            <div className="modal-header">
              <h3>Chi tiết câu hỏi</h3>
              <div className="modal-badges">
                <span className="badge grade">Lớp {selectedQuestion.grade}</span>
                <span className="badge chapter">{selectedQuestion.lesson.chapter.title}</span>
                <span className="badge lesson">{selectedQuestion.lesson.title}</span>
              </div>
            </div>
            
            <div className="modal-body">
              {/* Câu hỏi */}
              <div className="modal-section">
                <h4>📝 Câu hỏi</h4>
                <p className="question-text-large">{selectedQuestion.questionText}</p>
                {selectedQuestion.questionImage && (
                  <img 
                    src={selectedQuestion.questionImage} 
                    alt="Câu hỏi"
                    className="question-image-large"
                  />
                )}
              </div>
              
              {/* Thống kê */}
              <div className="modal-section stats-section">
                <h4>📊 Thống kê</h4>
                <div className="stats-grid">
                  <div className="stat-box error">
                    <div className="stat-number">{selectedQuestion.wrongCount}</div>
                    <div className="stat-label">Số lần sai</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-number">{selectedQuestion.totalAttempts}</div>
                    <div className="stat-label">Tổng số lần làm</div>
                  </div>
                  <div className="stat-box warning">
                    <div className="stat-number">{selectedQuestion.wrongPercentage.toFixed(1)}%</div>
                    <div className="stat-label">Tỷ lệ sai</div>
                  </div>
                </div>
              </div>
              
              {/* Đáp án đúng */}
              <div className="modal-section correct-section">
                <h4>✅ Đáp án đúng</h4>
                <div className="answer-box correct">
                  {selectedQuestion.correctAnswer.answerText}
                </div>
              </div>
              
              {/* Đáp án sai phổ biến */}
              {selectedQuestion.commonWrongAnswers && selectedQuestion.commonWrongAnswers.length > 0 && (
                <div className="modal-section wrong-section">
                  <h4>❌ Đáp án sai thường gặp</h4>
                  <div className="wrong-answers-modal-list">
                    {selectedQuestion.commonWrongAnswers.map((ans) => (
                      <div key={ans.id} className="answer-box wrong">
                        <span className="answer-text">{ans.answerText}</span>
                        <span className="answer-stats">{ans.count} lần ({ans.percentage}%)</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Giải thích */}
              {selectedQuestion.explanationText && (
                <div className="modal-section explanation-section">
                  <h4>💡 Giải thích</h4>
                  <p className="explanation-text-large">{selectedQuestion.explanationText}</p>
                  {selectedQuestion.explanationImg && (
                    <img 
                      src={selectedQuestion.explanationImg} 
                      alt="Giải thích"
                      className="explanation-image-large"
                    />
                  )}
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              <button 
                className="modal-btn secondary"
                onClick={() => setShowDetailModal(false)}
              >
                Đóng
              </button>
              <button 
                className="modal-btn primary"
                onClick={() => {
                  const lesson = lessonsMap[selectedQuestion.lesson.id];
                  const chapterId = selectedQuestion.lesson.chapter.id || lesson?.chapterId;
                  const chapter = chapterId ? chapters.find(c => c.id === chapterId) : null;
                  const semester = chapter?.volume || 1;
                  
                  setShowDetailModal(false);
                  navigate(`/study?gradeId=${selectedQuestion.grade}&semester=${semester}&chapterId=${chapterId}`);
                }}
              >
                Luyện tập lại
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashUser;
