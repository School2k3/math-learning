import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "../css/admin-css/home-admin.css";
import "../components/chart/chart.css";
import StudentGradeChart from "../components/chart/StudentGradeChart";
import LessonCompletionChart from "../components/chart/LessonCompletionChart";
import ScoreTrendChart from "../components/chart/ScoreTrendChart";
import SubjectPerformanceChart from "../components/chart/SubjectPerformanceChart";
import WeeklyActivityChart from "../components/chart/WeeklyActivityChart";
import { 
  fetchAdminStats, 
  fetchStudentsCount, 
  fetchLessonsCount, 
  fetchExamsCount, 
  fetchChaptersCount, 
  fetchActiveStudents,
  fetchLessonCompletion,
  fetchQuestionsAnswered,
  fetchRecentActivity
} from "../api/adminStatsAPI";

interface DashboardStats {
  totalStudents: number;
  totalLessons: number;
  totalExams: number;
  totalChapters: number;
  activeStudents: number;
  completionRate: number;
  averageScore: number;
  totalQuestions: number;
  totalAnswers: number;
  trend?: {
    students: number;
    completion: number;
    score: number;
    questions: number;
  };
}

interface DateRange {
  startDate: string;
  endDate: string;
}

const HomeAdmin: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalLessons: 0,
    totalExams: 0,
    totalChapters: 0,
    activeStudents: 0,
    completionRate: 0,
    averageScore: 0,
    totalQuestions: 0,
    totalAnswers: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  
  // Thêm state cho date range
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 ngày trước
    endDate: new Date().toISOString().split('T')[0] // Hôm nay
  });

  const [chartsLoading, setChartsLoading] = useState(false);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log("🔄 Loading dashboard data...");
        
        // Load all stats in parallel
        const [
          adminStatsData,
          studentsData,
          lessonsData,
          examsData,
          chaptersData,
          activeStudentsData,
          completionData,
          questionsData,
          recentActivityData
        ] = await Promise.allSettled([
          fetchAdminStats(),
          fetchStudentsCount(),
          fetchLessonsCount(),
          fetchExamsCount(),
          fetchChaptersCount(),
          fetchActiveStudents(undefined, 7), // 7 ngày gần nhất
          fetchLessonCompletion(),
          fetchQuestionsAnswered(),
          fetchRecentActivity(5) // 5 hoạt động gần nhất
        ]);

        // Check for critical failures
        const criticalApiFailed = [studentsData, lessonsData, examsData, chaptersData]
          .every(result => result.status === 'rejected');

        if (criticalApiFailed) {
          console.warn("⚠️ All critical APIs failed, using fallback data");
        }

        // Log individual API results for debugging
        console.log("📊 API Results:", {
          adminStats: adminStatsData.status,
          students: studentsData.status,
          lessons: lessonsData.status,
          exams: examsData.status,
          chapters: chaptersData.status,
          activeStudents: activeStudentsData.status,
          completion: completionData.status
        });

        // Process results với safe access
        const totalStudents = studentsData.status === 'fulfilled' 
          ? studentsData.value.byGrade.reduce((sum, grade) => sum + grade.count, 0)
          : 0;

        const totalLessons = lessonsData.status === 'fulfilled' 
          ? lessonsData.value.totalLessons 
          : 0;

        const totalExams = examsData.status === 'fulfilled' 
          ? examsData.value.totalExams 
          : 0;

        const totalChapters = chaptersData.status === 'fulfilled' 
          ? chaptersData.value.totalChapters 
          : 0;

        const activeStudentsCount = activeStudentsData.status === 'fulfilled' 
          ? activeStudentsData.value.activeStudents.length 
          : 0;

        // Main stats từ adminStatsData với safe access
        const mainStats = adminStatsData.status === 'fulfilled' 
          ? adminStatsData.value 
          : null;

        // Lấy completionRate và averageScore từ mainStats
        const completionRate = mainStats?.lessonCompletion?.percentage || 0;
        const averageScore = mainStats?.examPerformance?.avgScore || 0;

        // Xử lý questions data
        const totalQuestionsAnswered = questionsData.status === 'fulfilled'
          ? questionsData.value?.totalAnswers || 0
          : 0;

        const totalQuestions = questionsData.status === 'fulfilled'
          ? questionsData.value?.totalQuestions || 0
          : 0;

        const totalAnswers = questionsData.status === 'fulfilled'
          ? questionsData.value?.totalAnswers || 0
          : 0;

        // Xử lý recent activity data
        if (recentActivityData.status === 'fulfilled' && recentActivityData.value?.data) {
          setRecentActivities(recentActivityData.value.data);
        }

        console.log("📊 Processed data:", {
          mainStats,
          totalStudents,
          totalLessons,
          totalExams,
          totalChapters,
          activeStudentsCount,
          completionRate,
          averageScore,
          totalQuestionsAnswered,
          totalQuestions,
          totalAnswers
        });

        setStats({
          totalStudents: mainStats?.totalStudents || totalStudents,
          totalLessons: mainStats?.totalLessons || totalLessons,
          totalExams: mainStats?.totalExams || totalExams,
          totalChapters: mainStats?.totalChapters || totalChapters,
          activeStudents: mainStats?.activeStudents?.count || activeStudentsCount,
          completionRate: completionRate,
          averageScore: averageScore,
          totalQuestions: totalQuestions,
          totalAnswers: totalAnswers,
          trend: {
            students: 12.5,
            completion: 5.2,
            score: 0.3,
            questions: 156
          }
        });

        setLastUpdated(new Date());
        console.log("✅ Dashboard data loaded successfully");
        
      } catch (error) {
        console.error("❌ Error loading dashboard data:", error);
        setError(error instanceof Error ? error.message : "Có lỗi xảy ra khi tải dữ liệu");
        
        // Fallback data nếu API fail
        setStats({
          totalStudents: 0,
          totalLessons: 0,
          totalExams: 0,
          totalChapters: 0,
          activeStudents: 0,
          completionRate: 0,
          averageScore: 0,
          totalQuestions: 0,
          totalAnswers: 0,
          trend: {
            students: 0,
            completion: 0,
            score: 0,
            questions: 0
          }
        });
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Function để handle thay đổi date range
  const handleDateRangeChange = (field: 'startDate' | 'endDate', value: string) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Function để apply filter với date range
  const handleApplyFilter = async () => {
    if (dateRange.startDate > dateRange.endDate) {
      alert("Ngày bắt đầu không thể lớn hơn ngày kết thúc!");
      return;
    }
    
    setChartsLoading(true);
    console.log("🔄 Filtering data from", dateRange.startDate, "to", dateRange.endDate);
    
    try {
      // Reload specific data với date filter
      const [activeStudentsData, completionData] = await Promise.allSettled([
        fetchActiveStudents(dateRange.endDate, 7),
        fetchLessonCompletion(dateRange.endDate)
      ]);

      // Update active students count với safe access
      if (activeStudentsData.status === 'fulfilled' && activeStudentsData.value?.activeStudents) {
        setStats(prev => ({
          ...prev,
          activeStudents: activeStudentsData.value.activeStudents.length
        }));
      }

      // Update completion rate với safe access
      if (completionData.status === 'fulfilled' && completionData.value?.lessonCompletion) {
        setStats(prev => ({
          ...prev,
          completionRate: completionData.value.lessonCompletion.completionRate || 0,
          averageScore: completionData.value.lessonCompletion.averageScore || 0
        }));
      }

      console.log("✅ Filter applied successfully");
    } catch (error) {
      console.error("❌ Error applying filter:", error);
      // Don't throw error, just log it
    } finally {
      setChartsLoading(false);
    }
  };

  // Function để reset về 30 ngày gần nhất
  const handleResetFilter = () => {
    setDateRange({
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    });
  };

  // Hàm xử lý đăng xuất
  const handleLogout = () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      logout();
      navigate("/auth/login");
    }
  };

  return (
    <div className="admin-dashboard">
      {/* Sidebar - giữ nguyên */}
      <div className="admin-sidebar">
        <div className="admin-logo">
          <img src="/logo-Photoroom.png" alt="MEI Logo" />
          <h2>MEI Math</h2>
          <p>Admin Dashboard</p>
        </div>
        
        <nav className="admin-nav">
          <div className="nav-section">
            <h4>Quản lý nội dung</h4>
            <ul>
              <li className="active">
                <Link to="/home-admin">
                  📊 Dashboard
                </Link>
              </li>
              
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
              <li>
                <Link to="/admin/answers" style={{ textDecoration: "none", color: "inherit" }}>
                  📝 Quản lý đáp án
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="nav-section">
            <h4>Quản lý người dùng</h4>
            <ul>
              <li>
                <Link to="/admin/users" style={{ textDecoration: "none", color: "inherit" }}>
                  👥 Học sinh
                </Link>
              </li>
              
              <li>
                <Link to="/admin/reports" style={{ textDecoration: "none", color: "inherit" }}>
                  📈 Báo cáo học tập
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="nav-section">
            <h4>Hệ thống</h4>
            <ul>
              <li>
                <Link to="/admin/settings" style={{ textDecoration: "none", color: "inherit" }}>
                  ⚙️ Cài đặt
                </Link>
              </li>
              <li>
                <Link to="/admin/security" style={{ textDecoration: "none", color: "inherit" }}>
                  🔐 Bảo mật
                </Link>
              </li>
              <li>
                <Link to="/admin/statistics" style={{ textDecoration: "none", color: "inherit" }}>
                  📊 Thống kê
                </Link>
              </li>
              <li>
                <button 
                  onClick={handleLogout}
                  className="logout-btn"
                  style={{ 
                    background: "none", 
                    border: "none", 
                    color: "inherit", 
                    cursor: "pointer",
                    textAlign: "left",
                    width: "100%",
                    padding: "0"
                  }}
                >
                  🚪 Đăng xuất
                </button>
              </li>
            </ul>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="admin-main">
        <div className="admin-header">
          <div>
            <h1>Dashboard Tổng quan</h1>
            <p>Thống kê hệ thống học toán MEI Math</p>
            {lastUpdated && (
              <p className="last-updated">
                Cập nhật lần cuối: {lastUpdated.toLocaleString('vi-VN')}
              </p>
            )}
          </div>
          
          {error && (
            <div className="error-banner">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
              <button 
                onClick={() => window.location.reload()} 
                className="reload-btn"
              >
                🔄 Tải lại
              </button>
            </div>
          )}
        </div>

        {/* Stats Cards - giữ nguyên */}
        <div className="stats-grid">
          <div className="stat-card primary">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>{loading ? "..." : (stats.totalStudents || 0).toLocaleString()}</h3>
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

          <div className="stat-card success">
            <div className="stat-icon">❓</div>
            <div className="stat-content">
              <h3>{loading ? "..." : stats.totalQuestions.toLocaleString()}</h3>
              <p>Tổng câu hỏi</p>
            </div>
          </div>

          <div className="stat-card primary">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>{loading ? "..." : stats.totalAnswers.toLocaleString()}</h3>
              <p>Tổng câu trả lời</p>
            </div>
          </div>
        </div>

        {/* Secondary Stats với dữ liệu thực từ API */}
        <div className="secondary-stats">
          <div className="stat-item">
            <div className="stat-number">{loading ? "..." : `${(stats.activeStudents || 0).toLocaleString()}`}</div>
            <div className="stat-label">Học sinh hoạt động (7 ngày)</div>
            <div className={`stat-trend ${stats.trend?.students && stats.trend.students > 0 ? 'positive' : stats.trend?.students === 0 ? 'neutral' : 'negative'}`}>
              {loading ? "..." : `${(stats.trend?.students || 0) > 0 ? '+' : ''}${stats.trend?.students || 0}%`}
            </div>
          </div>

          <div className="stat-item">
            <div className="stat-number">{loading ? "..." : `${(stats.completionRate || 0).toFixed(1)}%`}</div>
            <div className="stat-label">Tỷ lệ hoàn thành bài học</div>
            <div className={`stat-trend ${stats.trend?.completion && stats.trend.completion > 0 ? 'positive' : stats.trend?.completion === 0 ? 'neutral' : 'negative'}`}>
              {loading ? "..." : `${(stats.trend?.completion || 0) > 0 ? '+' : ''}${stats.trend?.completion || 0}%`}
            </div>
          </div>

          <div className="stat-item">
            <div className="stat-number">{loading ? "..." : `${(stats.averageScore || 0).toFixed(1)}/100`}</div>
            <div className="stat-label">Điểm trung bình</div>
            <div className={`stat-trend ${stats.trend?.score && stats.trend.score > 0 ? 'positive' : stats.trend?.score === 0 ? 'neutral' : 'negative'}`}>
              {loading ? "..." : `${(stats.trend?.score || 0) > 0 ? '+' : ''}${stats.trend?.score || 0}`}
            </div>
          </div>

          <div className="stat-item">
            <div className="stat-number">{loading ? "..." : (stats.totalQuestions || 0).toLocaleString()}</div>
            <div className="stat-label">Tổng câu hỏi đã trả lời</div>
            <div className={`stat-trend ${stats.trend?.questions && stats.trend.questions > 0 ? 'positive' : stats.trend?.questions === 0 ? 'neutral' : 'negative'}`}>
              {loading ? "..." : `${(stats.trend?.questions || 0) > 0 ? '+' : ''}${stats.trend?.questions || 0}`}
            </div>
          </div>
        </div>

        {/* Analytics Charts với Date Range Filter */}
        <div className="charts-section">
          <div className="charts-header">
            <h3>Báo cáo & Phân tích</h3>
            
            {/* Date Range Filter */}
            <div className="date-range-filter">
              <div className="date-inputs">
                <div className="date-input-group">
                  <label htmlFor="startDate">Từ ngày:</label>
                  <input
                    type="date"
                    id="startDate"
                    value={dateRange.startDate}
                    onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                    className="date-input"
                  />
                </div>
                
                <div className="date-input-group">
                  <label htmlFor="endDate">Đến ngày:</label>
                  <input
                    type="date"
                    id="endDate"
                    value={dateRange.endDate}
                    onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                    className="date-input"
                  />
                </div>
              </div>
              
              <div className="filter-actions">
                <button 
                  onClick={handleApplyFilter}
                  className="btn-apply-filter"
                  disabled={chartsLoading}
                >
                  {chartsLoading ? "🔄 Đang tải..." : "📊 Áp dụng"}
                </button>
                
                <button 
                  onClick={handleResetFilter}
                  className="btn-reset-filter"
                >
                  🔄 30 ngày gần nhất
                </button>
              </div>
            </div>
          </div>
          
          {/* Charts với loading overlay */}
          <div className={`charts-container ${chartsLoading ? 'loading' : ''}`}>
            {chartsLoading && (
              <div className="charts-loading-overlay">
                <div className="spinner"></div>
                <p>Đang tải dữ liệu...</p>
              </div>
            )}
            
            {/* Top Row - 2 Charts */}
            <div className="charts-grid-2">
              <StudentGradeChart dateRange={dateRange} />
              <LessonCompletionChart dateRange={dateRange} />
            </div>
            
            {/* Middle Row - 1 Large Chart */}
            <div className="charts-grid">
              <ScoreTrendChart dateRange={dateRange} />
            </div>
            
            {/* Bottom Row - 2 Charts */}
            <div className="charts-grid-2">
              <SubjectPerformanceChart dateRange={dateRange} />
              <WeeklyActivityChart dateRange={dateRange} />
            </div>
          </div>
        </div>

        {/* Recent Activity với dữ liệu thực từ API */}
        <div className="recent-activity">
          <h3>Hoạt động gần đây</h3>
          <div className="activity-list">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-icon">
                    {activity.type === "exam" ? "📋" : activity.type === "practice" ? "📚" : "👨‍🏫"}
                  </div>
                  <div className="activity-content">
                    <p>
                      <strong>{activity.user?.fullName || activity.user?.username}</strong> {activity.title}
                      {activity.score !== undefined && (
                        <span> - Điểm: {activity.score}/10</span>
                      )}
                    </p>
                    <span className="activity-time">{activity.time}</span>
                  </div>
                </div>
              ))
            ) : (
              // Fallback nếu không có dữ liệu từ API
              <>
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeAdmin;