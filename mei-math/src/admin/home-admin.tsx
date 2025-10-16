import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../css/admin-css/home-admin.css";
import "../components/chart/chart.css";
import StudentGradeChart from "../components/chart/StudentGradeChart";
import LessonCompletionChart from "../components/chart/LessonCompletionChart";
import ScoreTrendChart from "../components/chart/ScoreTrendChart";
import SubjectPerformanceChart from "../components/chart/SubjectPerformanceChart";
import WeeklyActivityChart from "../components/chart/WeeklyActivityChart";

interface DashboardStats {
  totalStudents: number;
  totalLessons: number;
  totalExams: number;
  totalChapters: number;
  activeStudents: number;
  completionRate: number;
  averageScore: number;
  totalQuestions: number;
}

const HomeAdmin: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalLessons: 0,
    totalExams: 0,
    totalChapters: 0,
    activeStudents: 0,
    completionRate: 0,
    averageScore: 0,
    totalQuestions: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Giả lập fetch data từ API
    setTimeout(() => {
      setStats({
        totalStudents: 1247,
        totalLessons: 156,
        totalExams: 45,
        totalChapters: 28,
        activeStudents: 892,
        completionRate: 78.5,
        averageScore: 7.8,
        totalQuestions: 2890
      });
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="admin-logo">
          <img src="/public/logo-Photoroom.png" alt="MEI Logo" />
          <h2>MEI Math</h2>
          <p>Admin Dashboard</p>
        </div>
        
        <nav className="admin-nav">
          <div className="nav-section">
            <h4>Quản lý nội dung</h4>
            <ul>
              <li className="active">
                <Link to="/home-admin" >
                  📊 Dashboard
                </Link>
              </li>
              <li>📚 Quản lý lớp học</li>
              <li>
                <Link to="/admin/chapters" style={{ textDecoration: "none", color: "inherit" }}>
                  📖 Quản lý chương
                </Link>
              </li>
              <li>
                <Link to="/admin/lessons" style={{ textDecoration: "none", color: "inherit" }}>
                  📝 Quản lý bài học
                </Link>
              </li>
              <li>
                <Link to="/admin/questions" style={{ textDecoration: "none", color: "inherit" }}>
                  ❓ Quản lý câu hỏi
                </Link>
              </li>
              <li>
                <Link to="/admin/exams" style={{ textDecoration: "none", color: "inherit" }}>
                  📋 Quản lý bài kiểm tra
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="nav-section">
            <h4>Quản lý người dùng</h4>
            <ul>
              <li>👥 Học sinh</li>
              <li>👨‍🏫 Giáo viên</li>
              <li>📈 Báo cáo học tập</li>
            </ul>
          </div>
          
          <div className="nav-section">
            <h4>Hệ thống</h4>
            <ul>
              <li>⚙️ Cài đặt</li>
              <li>🔐 Bảo mật</li>
              <li>📊 Thống kê</li>
            </ul>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="admin-main">
        <div className="admin-header">
          <h1>Dashboard Tổng quan</h1>
          <p>Thống kê hệ thống học toán MEI Math</p>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card primary">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>{loading ? "..." : stats.totalStudents.toLocaleString()}</h3>
              <p>Tổng học sinh</p>
            </div>
          </div>

          <div className="stat-card success">
            <div className="stat-icon">📚</div>
            <div className="stat-content">
              <h3>{loading ? "..." : stats.totalLessons}</h3>
              <p>Tổng bài học</p>
            </div>
          </div>

          <div className="stat-card warning">
            <div className="stat-icon">📋</div>
            <div className="stat-content">
              <h3>{loading ? "..." : stats.totalExams}</h3>
              <p>Tổng bài kiểm tra</p>
            </div>
          </div>

          <div className="stat-card info">
            <div className="stat-icon">📖</div>
            <div className="stat-content">
              <h3>{loading ? "..." : stats.totalChapters}</h3>
              <p>Tổng chương học</p>
            </div>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="secondary-stats">
          <div className="stat-item">
            <div className="stat-number">{loading ? "..." : `${stats.activeStudents.toLocaleString()}`}</div>
            <div className="stat-label">Học sinh hoạt động (7 ngày)</div>
            <div className="stat-trend positive">+12.5%</div>
          </div>

          <div className="stat-item">
            <div className="stat-number">{loading ? "..." : `${stats.completionRate}%`}</div>
            <div className="stat-label">Tỷ lệ hoàn thành bài học</div>
            <div className="stat-trend positive">+5.2%</div>
          </div>

          <div className="stat-item">
            <div className="stat-number">{loading ? "..." : `${stats.averageScore}/10`}</div>
            <div className="stat-label">Điểm trung bình</div>
            <div className="stat-trend neutral">+0.3</div>
          </div>

          <div className="stat-item">
            <div className="stat-number">{loading ? "..." : stats.totalQuestions.toLocaleString()}</div>
            <div className="stat-label">Tổng câu hỏi</div>
            <div className="stat-trend positive">+156</div>
          </div>
        </div>

        {/* Analytics Charts */}
        <div className="charts-section">
          <h3>Báo cáo & Phân tích</h3>
          
          {/* Top Row - 2 Charts */}
          <div className="charts-grid-2">
            <StudentGradeChart />
            <LessonCompletionChart />
          </div>
          
          {/* Middle Row - 1 Large Chart */}
          <div className="charts-grid">
            <ScoreTrendChart />
          </div>
          
          {/* Bottom Row - 2 Charts */}
          <div className="charts-grid-2">
            <SubjectPerformanceChart />
            <WeeklyActivityChart />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="recent-activity">
          <h3>Hoạt động gần đây</h3>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon">📚</div>
              <div className="activity-content">
                <p><strong>Nguyễn Văn An</strong> đã hoàn thành bài học "Phép cộng trong phạm vi 100"</p>
                <span className="activity-time">5 phút trước</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">📋</div>
              <div className="activity-content">
                <p><strong>Trần Thị Bình</strong> đã làm bài kiểm tra "Kiểm tra chương 1" - Điểm: 9/10</p>
                <span className="activity-time">12 phút trước</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">👨‍🏫</div>
              <div className="activity-content">
                <p><strong>Giáo viên Lan</strong> đã thêm 5 câu hỏi mới vào chương "Phép trừ"</p>
                <span className="activity-time">1 giờ trước</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeAdmin;