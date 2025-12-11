import React, { useState, useEffect } from "react";
import Header from "../components/header";
import { getUserInfo } from "../api/loginAPI";
import { changePassword, updateUserName } from "../api/userAPI";
import { useNavigate } from "react-router-dom";
import { trackViewProfile } from "../components/GoogleAnalytics";
import "../css/profile.css";

const Profile: React.FC = () => {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: ""
  });
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showPasswords, setShowPasswords] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [updatingName, setUpdatingName] = useState(false);
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

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    // Validation
    if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError("Vui lòng điền đầy đủ các trường");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("Mật khẩu mới không khớp");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    try {
      setChangingPassword(true);
      const result = await changePassword({
        userId: userInfo.id,
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
      });

      if (result.success) {
        setPasswordSuccess("Đổi mật khẩu thành công!");
        setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
        setTimeout(() => {
          setShowPasswordModal(false);
          setPasswordSuccess("");
        }, 2000);
      } else {
        setPasswordError(result.message || "Đổi mật khẩu thất bại");
      }
    } catch (error: any) {
      console.error("Error changing password:", error);
      setPasswordError(error.message || "Có lỗi xảy ra khi đổi mật khẩu");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleCloseModal = () => {
    setShowPasswordModal(false);
    setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    setShowPasswords({ oldPassword: false, newPassword: false, confirmPassword: false });
    setPasswordError("");
    setPasswordSuccess("");
  };

  const handleEditInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError("");
    setEditSuccess("");

    // Validation
    if (!editForm.fullName.trim()) {
      setEditError("Vui lòng nhập họ và tên");
      return;
    }

    try {
      setUpdatingName(true);
      const result = await updateUserName(userInfo.id, {
        fullName: editForm.fullName
      });

      if (result.success) {
        setEditSuccess("Cập nhật thông tin thành công!");
        // Update local userInfo
        if (result.data) {
          setUserInfo(result.data);
        }
        setTimeout(() => {
          setShowEditModal(false);
          setEditSuccess("");
        }, 2000);
      } else {
        setEditError(result.message || "Cập nhật thông tin thất bại");
      }
    } catch (error: any) {
      console.error("Error updating user info:", error);
      setEditError(error.message || "Có lỗi xảy ra khi cập nhật thông tin");
    } finally {
      setUpdatingName(false);
    }
  };

  const handleOpenEditModal = () => {
    setEditForm({ fullName: userInfo.fullName || "" });
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditForm({ fullName: "" });
    setEditError("");
    setEditSuccess("");
  };

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
            <button
              className="change-avatar-btn"
              onClick={() => navigate("/rewards")}
            >
              Đổi ảnh đại diện
            </button>
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
            <button 
              className="btn-edit"
              onClick={handleOpenEditModal}
            >
              ✏️ Chỉnh sửa thông tin
            </button>
            <button 
              className="btn-password"
              onClick={() => setShowPasswordModal(true)}
            >
              🔒 Đổi mật khẩu
            </button>
          </div>
        </div>
      </div>

      {/* Edit Info Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={handleCloseEditModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Chỉnh sửa thông tin</h2>
              <button className="modal-close" onClick={handleCloseEditModal}>
                ×
              </button>
            </div>

            <form onSubmit={handleEditInfo} className="password-form">
              <div className="form-group">
                <label htmlFor="fullName">Họ và tên</label>
                <input
                  type="text"
                  id="fullName"
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ fullName: e.target.value })}
                  placeholder="Nhập họ và tên"
                  disabled={updatingName}
                />
              </div>

              <div className="info-note">
                <p>📌 Lưu ý:</p>
                <ul>
                  <li>Chỉ có thể thay đổi họ và tên</li>
                  <li>Lớp học sẽ tự động tăng vào ngày 5/9 hàng năm</li>
                  <li>Các thông tin khác không thể thay đổi</li>
                </ul>
              </div>

              {editError && <div className="error-message">{editError}</div>}
              {editSuccess && <div className="success-message">{editSuccess}</div>}

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={handleCloseEditModal}
                  disabled={updatingName}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={updatingName}
                >
                  {updatingName ? "Đang cập nhật..." : "Cập nhật"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Đổi mật khẩu</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                ×
              </button>
            </div>

            <form onSubmit={handlePasswordChange} className="password-form">
              <div className="form-group">
                <label htmlFor="oldPassword">Mật khẩu hiện tại</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPasswords.oldPassword ? "text" : "password"}
                    id="oldPassword"
                    value={passwordForm.oldPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                    placeholder="Nhập mật khẩu hiện tại"
                    disabled={changingPassword}
                  />
                  <span
                    className="password-toggle-icon"
                    onClick={() => setShowPasswords({ ...showPasswords, oldPassword: !showPasswords.oldPassword })}
                    title={showPasswords.oldPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPasswords.oldPassword ? "🙈" : "👁️"}
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">Mật khẩu mới</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPasswords.newPassword ? "text" : "password"}
                    id="newPassword"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                    disabled={changingPassword}
                  />
                  <span
                    className="password-toggle-icon"
                    onClick={() => setShowPasswords({ ...showPasswords, newPassword: !showPasswords.newPassword })}
                    title={showPasswords.newPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPasswords.newPassword ? "🙈" : "👁️"}
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Xác nhận mật khẩu mới</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPasswords.confirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    placeholder="Nhập lại mật khẩu mới"
                    disabled={changingPassword}
                  />
                  <span
                    className="password-toggle-icon"
                    onClick={() => setShowPasswords({ ...showPasswords, confirmPassword: !showPasswords.confirmPassword })}
                    title={showPasswords.confirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPasswords.confirmPassword ? "🙈" : "👁️"}
                  </span>
                </div>
              </div>

              {passwordError && <div className="error-message">{passwordError}</div>}
              {passwordSuccess && <div className="success-message">{passwordSuccess}</div>}

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={handleCloseModal}
                  disabled={changingPassword}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={changingPassword}
                >
                  {changingPassword ? "Đang xử lý..." : "Đổi mật khẩu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
