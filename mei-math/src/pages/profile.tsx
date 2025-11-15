import React, { useState, useEffect } from "react";
import Header from "../components/header";
import { getUserInfo } from "../api/loginAPI";
import { useNavigate } from "react-router-dom";
import { trackViewProfile } from "../components/GoogleAnalytics";
import "../css/profile.css";

const Profile: React.FC = () => {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Track khi vào trang profile
    trackViewProfile();
    
    const loadUserInfo = async () => {
      try {
        const result = await getUserInfo();
        console.log("User info loaded:", result);
        setUserInfo(result.data || result.user);
      } catch (error) {
        console.error("Error loading user info:", error);
        // Nếu lỗi, có thể chuyển về trang login
        navigate("/auth/login");
      } finally {
        setLoading(false);
      }
    };

    loadUserInfo();
  }, [navigate]);

  if (loading) {
    return (
      <div className="profile-container">
        <Header bgWhite />
        <div className="loading-state">Đang tải thông tin...</div>
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div className="profile-container">
        <Header bgWhite />
        <div className="error-state">Không thể tải thông tin người dùng</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <Header bgWhite />
      
      <div className="profile-content">
        <div className="profile-header">
          <h1 className="profile-title">Thông tin cá nhân</h1>
          <button 
            className="back-btn"
            onClick={() => navigate(-1)}
          >
            ← Quay lại
          </button>
        </div>

        <div className="profile-card">
          <div className="profile-avatar-section">
            <div className="avatar-wrapper">
              <img 
                src={userInfo.avatarUrl || "https://via.placeholder.com/150"} 
                alt="Avatar"
                className="profile-avatar"
              />
            </div>
            <button className="change-avatar-btn">Đổi ảnh đại diện</button>
          </div>

          <div className="profile-info-section">
            <div className="info-group">
              <label className="info-label">Họ và tên</label>
              <div className="info-value">{userInfo.fullName || "Chưa cập nhật"}</div>
            </div>

            <div className="info-group">
              <label className="info-label">Tên đăng nhập</label>
              <div className="info-value">{userInfo.username}</div>
            </div>

            <div className="info-group">
              <label className="info-label">Email</label>
              <div className="info-value">{userInfo.email || "Chưa cập nhật"}</div>
            </div>

            <div className="info-group">
              <label className="info-label">Vai trò</label>
              <div className="info-value">
                <span className={`role-badge ${userInfo.role === 'admin' ? 'admin' : 'student'}`}>
                  {userInfo.role === 'admin' ? 'Quản trị viên' : 'Học sinh'}
                </span>
              </div>
            </div>

            <div className="info-group">
              <label className="info-label">Lớp</label>
              <div className="info-value">Lớp {userInfo.grade || "Chưa xác định"}</div>
            </div>

            <div className="info-group">
              <label className="info-label">ID người dùng</label>
              <div className="info-value">#{userInfo.id}</div>
            </div>
          </div>

          <div className="profile-actions">
            <button className="btn-edit">
              ✏️ Chỉnh sửa thông tin
            </button>
            <button className="btn-password">
              🔒 Đổi mật khẩu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
