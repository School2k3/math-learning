import React, { useState, useEffect } from "react";
import Header from "../components/header";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchExamResultsByExamId } from "../api/examAPI";
import { useAuth } from "../contexts/AuthContext";
import "../css/exams-history.css";

const ExamsHistory: React.FC = () => {
  const [examHistory, setExamHistory] = useState<any[]>([]);
  const [examInfo, setExamInfo] = useState<any>(null);
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const loadHistory = async () => {
      // Lấy examId từ location.state hoặc có thể hardcode tạm
      const examId = location.state?.examId || 201; // Tạm thời dùng 201, sau này có thể truyền qua navigation

      console.log("📊 Loading exam history for examId:", examId);

      try {
        const result = await fetchExamResultsByExamId(examId, {
          includeFinished: true,
          includeActive: true
        });
        
        console.log("✅ Exam results loaded:", result);
        
        setExamHistory(result.examResults || []);
        setExamInfo(result.exam || null);
        setStatistics(result.statistics || null);
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
            onClick={() => navigate("/study")}
          >
            ← Quay lại
          </button>
        </div>

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
              <span className="stat-value">{(statistics.passRate * 100).toFixed(0)}%</span>
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
                  <th>Xem lại</th>
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
                    <td>
                      <button
                        className="review-btn"
                        onClick={() => navigate(`/exams/review/${exam.id}`)}
                      >
                        Xem chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamsHistory;
