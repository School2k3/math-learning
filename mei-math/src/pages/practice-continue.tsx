import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Header from "../components/header";
import { fetchPracticeHistoryByUser } from "../api/praticeAPI";
import { fetchLessonsByChapter } from "../api/lessonAPI";
import { fetchAllChapters } from "../api/chapterAPI";
import "../css/practice-continue.css";

interface IncompletePractice {
  id: number;
  lessonId?: number;
  lessonTitle?: string;
  chapterTitle?: string;
  chapterId?: number;
  startedAt?: string;
  lastActivityAt?: string;
  score?: number;
  completed?: boolean;
}

const PracticeContinue: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [incompletePractices, setIncompletePractices] = useState<IncompletePractice[]>([]);
  const [loading, setLoading] = useState(true);

  // Refresh data when user comes back to this page
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Page is visible again, refresh data
        loadIncompletePractices();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const loadIncompletePractices = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetchPracticeHistoryByUser(user.id);
      const allPractices = response.practiceHistory || response.sessions || [];
      
      console.log("Raw practice data from API:", allPractices);
      
      // Lọc các practice sessions chưa hoàn thành (score < 100 hoặc completed = false)
      const incomplete = allPractices.filter((practice: any) => {
        const isIncomplete = !practice.completed || (practice.score !== undefined && practice.score < 100);
        const hasStarted = practice.startedAt && !practice.finishedAt;
        console.log("Practice item:", practice, "isIncomplete:", isIncomplete, "hasStarted:", hasStarted);
        return isIncomplete && hasStarted;
      });

      console.log("Filtered incomplete practices:", incomplete);
      
      // Fetch tất cả chapters một lần để map tên
      const chaptersResponse = await fetchAllChapters();
      const allChapters = chaptersResponse.chapters || [];
      
      // Map để đảm bảo có đủ thông tin cần thiết với tên lesson và chapter thực tế
      const enrichedPractices = await Promise.all(
        incomplete.map(async (practice: any) => {
          let lessonTitle = "Bài thực hành";
          let chapterTitle = "Không xác định";
          let chapterId = practice.chapterId;
          
          // Nếu có lessonId, fetch thông tin lesson từ tất cả chapters
          if (practice.lessonId) {
            for (const chapter of allChapters) {
              try {
                const lessonsResponse = await fetchLessonsByChapter(chapter.id);
                const lessons = lessonsResponse.data?.lessons || [];
                const lesson = lessons.find((l: any) => l.id === practice.lessonId);
                
                if (lesson) {
                  lessonTitle = lesson.title;
                  chapterTitle = chapter.title;
                  chapterId = chapter.id;
                  break;
                }
              } catch (error) {
                console.warn(`Error fetching lessons for chapter ${chapter.id}:`, error);
              }
            }
          }
          
          return {
            id: practice.id,
            lessonId: practice.lessonId,
            lessonTitle,
            chapterTitle,
            chapterId,
            startedAt: practice.startedAt,
            lastActivityAt: practice.lastActivityAt || practice.updatedAt,
            score: practice.score || 0,
            completed: practice.completed || false
          };
        })
      );

      setIncompletePractices(enrichedPractices);
    } catch (error) {
      console.error("Error loading incomplete practice sessions:", error);
      setIncompletePractices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await loadIncompletePractices();
    };

    loadData();
  }, [user]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleContinuePractice = (practice: IncompletePractice) => {
    // Kiểm tra các thuộc tính cần thiết trước khi navigate
    if (!practice.lessonId || !practice.id) {
      console.error("Missing required practice data:", practice);
      alert("Không thể tiếp tục bài thực hành này. Vui lòng thử lại.");
      return;
    }

    // Navigate với practiceSessionId để tiếp tục session cũ
    const params = new URLSearchParams({
      title: practice.lessonTitle || "Bài thực hành",
      lessonId: practice.lessonId.toString(),
      practiceSessionId: practice.id.toString()
    });

    // Chỉ thêm chapterId nếu có
    if (practice.chapterId) {
      params.append('chapterId', practice.chapterId.toString());
    }

    navigate(`/pratice?${params.toString()}`);
  };

  const handleStartNewPractice = () => {
    navigate("/study");
  };

  if (!user) {
    return (
      <div>
        <Header bgWhite />
        <div className="exams-history-container">
          <div className="exams-history-title">
            Vui lòng đăng nhập để xem bài thực hành đang dở
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="header-margin">
        <Header bgWhite />
      </div>
      <div className="exams-history-container">
        <div className="exams-history-title">
          📝 Tiếp tục bài thực hành đang dở
        </div>

        {loading ? (
          <div className="loading-message">Đang tải...</div>
        ) : incompletePractices.length === 0 ? (
          <div className="no-history-container">
            <div className="no-history-icon">📚</div>
            <h3>Không có bài thực hành nào đang dở</h3>
            <p>Bạn chưa có phiên thực hành nào đang dang dở. Hãy bắt đầu làm bài thực hành mới!</p>
            <button 
              className="start-new-btn"
              onClick={handleStartNewPractice}
            >
              🎯 Bắt đầu thực hành mới
            </button>
          </div>
        ) : (
          <div className="practice-list">
            {incompletePractices.map((practice) => (
              <div key={practice.id} className="practice-card">
                <div className="practice-header">
                  <h3 className="lesson-title">📖 {practice.lessonTitle || "Bài thực hành"}</h3>
                  <div className="chapter-badge">
                    Chương: {practice.chapterTitle || "Không xác định"}
                  </div>
                </div>

                <div className="practice-content">
                  <div className="practice-stats">
                    <div className="stat-group">
                      <div className="stat-item score">
                        <span className="stat-icon">🎯</span>
                        <span className="stat-label">Điểm hiện tại:</span>
                        <span className="stat-value">{practice.score || 0}/100</span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          data-width={`${Math.min(practice.score || 0, 100)}%`}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="practice-dates">
                    <div className="date-item">
                      <span className="date-label">🕐 Bắt đầu:</span>
                      <span className="date-value">{practice.startedAt ? formatTime(practice.startedAt) : "N/A"}</span>
                    </div>
                    {practice.lastActivityAt && (
                      <div className="date-item">
                        <span className="date-label">⏰ Lần cuối:</span>
                        <span className="date-value">{formatTime(practice.lastActivityAt)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="practice-actions">
                  <button 
                    className="continue-practice-btn"
                    onClick={() => handleContinuePractice(practice)}
                  >
                    🚀 Tiếp tục làm bài
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="bottom-actions">
          <button 
            className="new-practice-btn"
            onClick={handleStartNewPractice}
          >
            📚 Bắt đầu bài thực hành mới
          </button>
        </div>
      </div>
    </div>
  );
};

export default PracticeContinue;