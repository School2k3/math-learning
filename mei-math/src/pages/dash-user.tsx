import React, { useState, useEffect } from "react";
import Header from "../components/header";
import "../css/dash-user.css";
import { useAuth } from "../contexts/AuthContext";
import { fetchChaptersByGrade } from "../api/chapterAPI";
import { fetchLessonsByChapter } from "../api/lessonAPI";

const DashUser: React.FC = () => {
  const [activeTab, setActiveTab] = useState("Đánh giá chung");
  const [startDate, setStartDate] = useState("2025-10-25");
  const [endDate, setEndDate] = useState("2025-11-01");
  const [chapters, setChapters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth(); // Lấy user từ AuthContext

  const tabs = [
    "Đánh giá chung",
    "Lịch sử luyện tập", 
    "Tiến độ học tập",
    "Bài kiểm tra vui học"
  ];

  const stats = [
    {
      icon: "📝",
      value: 0,
      label: "Câu hỏi đã trả lời",
      color: "#49BBBD"
    },
    {
      icon: "⏱️", 
      value: 0,
      label: "Số phút đã luyện tập",
      color: "#FF6B6B"
    },
    {
      icon: "📊",
      value: 0,
      label: "Số bài kiểm tra đã làm",
      color: "#4ECDC4"
    },
    {
      icon: "⏰",
      value: 0,
      label: "Số phút đã làm kiểm tra",
      color: "#FFE66D"
    },
    {
      icon: "⭐",
      value: 0,
      label: "Chủ điểm đã thực hành",
      color: "#A8E6CF"
    }
  ];

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

        // Load lessons cho mỗi chapter
        const chaptersWithLessons = await Promise.all(
          chaptersArray.map(async (chapter: any) => {
            try {
              const lessonsData = await fetchLessonsByChapter(chapter.id);
              const lessons = lessonsData.data?.lessons || lessonsData.lessons || [];
              
              // Thêm trạng thái random cho demo (sau này sẽ lấy từ API progress)
              const lessonsWithStatus = lessons.map((lesson: any) => ({
                ...lesson,
                status: getRandomStatus() // Tạm thời random, sau sẽ lấy từ API
              }));
              
              return {
                ...chapter,
                lessons: lessonsWithStatus
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

        setChapters(chaptersWithLessons);
      } catch (error) {
        console.error("❌ Error loading chapters:", error);
      } finally {
        setLoading(false);
      }
    };

    loadChaptersAndLessons();
  }, [user]);

  // Hàm tạo status random cho demo
  const getRandomStatus = () => {
    const statuses = ["completed", "not-done", "in-progress", "not-started"];
    return statuses[Math.floor(Math.random() * statuses.length)];
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
          {/* Time Period Section */}
          <div className="time-period-section">
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
          </div>

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
              <div className="semester-title">HỌC KỲ 1</div>
              
              {chapters.map((chapter) => (
                <div key={chapter.id} className="chapter-section">
                  <h3 className="chapter-title">{chapter.title}</h3>
                  
                  <div className="lessons-grid">
                    {chapter.lessons && chapter.lessons.length > 0 ? (
                      chapter.lessons.map((lesson: any) => (
                        <div
                          key={lesson.id}
                          className={`lesson-circle ${lesson.status}`}
                          title={lesson.title}
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
        </div>
      </div>
    </div>
  );
};

export default DashUser;
