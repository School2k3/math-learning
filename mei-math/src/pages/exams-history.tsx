import React, { useState, useEffect } from "react";
import Header from "../components/header";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchExamResultsByExamId, fetchExamById } from "../api/examAPI";
import { trackViewExamHistory } from "../components/GoogleAnalytics";
import { useAuth } from "../contexts/AuthContext";
import "../css/exams-history.css";

const ExamsHistory: React.FC = () => {
  const { user } = useAuth();
  const [examHistory, setExamHistory] = useState<any[]>([]);
  const [examInfo, setExamInfo] = useState<any>(null);
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Track khi vào trang exam history
    trackViewExamHistory();
    
    const loadHistory = async () => {
      // Lấy examId từ location.state
      const examId = location.state?.examId;

      if (!examId) {
        console.error("❌ No examId provided");
        setLoading(false);
        return;
      }

      console.log("📊 Loading exam history for examId:", examId);

      try {
        const result = await fetchExamResultsByExamId(examId, {
          includeFinished: true,
          includeActive: true
        });
        
        console.log("✅ Exam results loaded:", result);
        
        // Lọc chỉ lấy kết quả của user hiện tại
        const userResults = result.examResults?.filter(
          (examResult: any) => examResult.userId === user?.id
        ) || [];
        
        console.log("👤 Filtered results for current user:", userResults);
        
        // Tính lại statistics chỉ cho user hiện tại
        const finishedResults = userResults.filter((r: any) => r.finishedAt);
        const totalAttempts = finishedResults.length;
        const avgScore = totalAttempts > 0 
          ? finishedResults.reduce((sum: number, r: any) => sum + (r.score || 0), 0) / totalAttempts 
          : 0;
        const passRate = totalAttempts > 0
          ? (finishedResults.filter((r: any) => (r.score || 0) >= 50).length / totalAttempts) * 100
          : 0;
        
        const userStatistics = {
          totalAttempts,
          averageScore: Math.round(avgScore * 10) / 10,
          passRate: Math.round(passRate * 10) / 10
        };
        
        console.log("📈 User statistics:", userStatistics);
        
        setExamHistory(userResults);
        setExamInfo(result.exam || null);
        setStatistics(userStatistics);
      } catch (error) {
        console.error("❌ Error loading exam history:", error);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [location.state]);

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

  const formatDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    return `${diffMins} phút`;
  };

  return (
    <div className="exams-history-container">
      <Header bgWhite />
      
      <div className="exams-history-content">
        <div className="history-header">
          <h1 className="history-title">
            {examInfo ? examInfo.title : "Lịch sử bài kiểm tra"}
          </h1>
          <button 
            className="back-btn"
            onClick={() => {
              // Ưu tiên quay lại dashboard nếu có grade và chapterId trong state
              const grade = location.state?.grade;
              const chapterId = location.state?.chapterId || examInfo?.chapterId;
              
              if (grade && chapterId) {
                navigate("/dashboard", { state: { activeTab: "Bài kiểm tra vui học" } });
              } else if (chapterId) {
                navigate(`/study?chapterId=${chapterId}`);
              } else {
                navigate("/dashboard");
              }
            }}
          >
            ← Quay lại
          </button>
        </div>

        {!location.state?.examId ? (
          <div className="empty-state">
            <p>Vui lòng chọn bài kiểm tra từ trang học tập.</p>
            <button 
              className="start-exam-btn"
              onClick={() => navigate("/study")}
            >
              Quay lại trang học tập
            </button>
          </div>
        ) : (
          <>
            {/* Thống kê */}
            {statistics && (
              <div className="statistics-summary">
                <div className="stat-item">
                  <span className="stat-label">Tổng lần làm:</span>
                  <span className="stat-value">{statistics.totalAttempts}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Điểm trung bình:</span>
                  <span className="stat-value">{statistics.averageScore?.toFixed(1)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Tỷ lệ đạt:</span>
                  <span className="stat-value">{statistics.passRate?.toFixed(1)}%</span>
                </div>
              </div>
            )}

        {loading ? (
          <div className="loading-state">Đang tải lịch sử...</div>
        ) : examHistory.length === 0 ? (
          <div className="empty-state">
            <p>Bạn chưa làm bài kiểm tra nào.</p>
            <button 
              className="start-exam-btn"
              onClick={() => navigate("/study")}
            >
              Bắt đầu làm bài
            </button>
          </div>
        ) : (
          <div className="history-table-wrapper">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Tên bài</th>
                  <th>Ngày làm</th>
                  <th>Thời gian</th>
                  <th>Số điểm</th>
                  <th>Kết quả</th>
                  {/* <th>Hành động</th> */}
                </tr>
              </thead>
              <tbody>
                {examHistory.map((exam) => (
                  <tr key={exam.id}>
                    <td className="exam-title">
                      {examInfo?.title || `Bài kiểm tra #${exam.examId}`}
                    </td>
                    <td>{formatDate(exam.startedAt)}</td>
                    <td>
                      {exam.finishedAt 
                        ? formatDuration(exam.startedAt, exam.finishedAt)
                        : "Chưa hoàn thành"
                      }
                    </td>
                    <td className="score">
                      <span className={`score-badge ${exam.score >= 80 ? 'high' : exam.score >= 50 ? 'medium' : 'low'}`}>
                        {exam.score || 0} điểm
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${exam.finishedAt ? 'completed' : 'in-progress'}`}>
                        {exam.finishedAt ? 'Hoàn thành' : 'Đang làm'}
                      </span>
                    </td>
                    {/* 
                    <td>
                      {!exam.finishedAt ? (
                        // Bài đang làm dở → Nút "Làm tiếp"
                        <button
                          className="continue-btn"
                          onClick={async () => {
                            try {
                              // Lấy thông tin exam
                              const examDetail = await fetchExamById(exam.examId);
                              const grade = location.state?.grade || examInfo?.grade;
                              const semester = location.state?.semester || examInfo?.semester;
                              const chapterId = location.state?.chapterId || examInfo?.chapterId;
                              
                              // Navigate với examResult hiện tại để resume
                              navigate("/exams", {
                                state: {
                                  exam: examDetail.exam,
                                  examResult: exam, // Resume session hiện tại
                                  chapterId: chapterId,
                                  chapterTitle: location.state?.chapterTitle || "",
                                  gradeId: grade,
                                  semester: semester,
                                },
                              });
                            } catch (error) {
                              console.error("Error resuming exam:", error);
                              alert("Không thể tiếp tục bài kiểm tra!");
                            }
                          }}
                        >
                          Làm tiếp →
                        </button>
                      ) : (
                        // Bài đã hoàn thành → Nút "Xem chi tiết"
                        <button
                          className="review-btn"
                          onClick={() => {
                            const grade = location.state?.grade;
                            const chapterId = location.state?.chapterId || examInfo?.chapterId;
                            navigate(`/exams/review/${exam.id}`, {
                              state: { grade, chapterId }
                            });
                          }}
                        >
                          Xem chi tiết
                        </button>
                      )}
                    </td>
                    */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
          </>
        )}
      </div>
    </div>
  );
};

export default ExamsHistory;
