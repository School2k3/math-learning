import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { loginAPI, forgotPasswordAPI, resetPasswordAPI } from "../api/loginAPI";
import type { LoginRequest } from "../api/loginAPI"; // Thử import type
import { useAuth } from "../contexts/AuthContext";
import { trackLogin } from "../components/GoogleAnalytics";
import "../css/login.css";

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetForm, setResetForm] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showResetPasswords, setShowResetPasswords] = useState({
    newPassword: false,
    confirmPassword: false
  });
  const [forgotLoading, setForgotLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Lấy message từ OTP page
  const successMessage = location.state?.message || "";
  const prefillEmail = location.state?.email || "";

  useEffect(() => {
    // Prefill username nếu có email từ register
    if (prefillEmail) {
      setUsername(prefillEmail);
    }
  }, [prefillEmail]);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");
    setForgotSuccess("");

    // Validation
    if (!forgotEmail.trim()) {
      setForgotError("Vui lòng nhập email");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(forgotEmail)) {
      setForgotError("Email không hợp lệ");
      return;
    }

    try {
      setForgotLoading(true);
      const result = await forgotPasswordAPI(forgotEmail);

      if (result.success) {
        setForgotSuccess("Mã OTP đã được gửi đến email của bạn!");
        setTimeout(() => {
          setShowForgotModal(false);
          setShowResetModal(true);
          setResetForm({ ...resetForm, email: forgotEmail });
          setForgotEmail("");
          setForgotSuccess("");
          setForgotError("");
        }, 2000);
      } else {
        setForgotError(result.message || "Gửi OTP thất bại");
      }
    } catch (error: any) {
      console.error("Error sending forgot password:", error);
      setForgotError("Email không tồn tại trong hệ thống");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError("");
    setResetSuccess("");

    // Validation
    if (!resetForm.otp || !resetForm.newPassword || !resetForm.confirmPassword) {
      setResetError("Vui lòng điền đầy đủ các trường");
      return;
    }

    if (resetForm.newPassword !== resetForm.confirmPassword) {
      setResetError("Mật khẩu mới không khớp");
      return;
    }

    if (resetForm.newPassword.length < 6) {
      setResetError("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    try {
      setResetLoading(true);
      const result = await resetPasswordAPI({
        email: resetForm.email,
        otp: resetForm.otp,
        newPassword: resetForm.newPassword
      });

      if (result.success) {
        setResetSuccess("Đặt lại mật khẩu thành công!");
        setTimeout(() => {
          setShowResetModal(false);
          setResetForm({ email: "", otp: "", newPassword: "", confirmPassword: "" });
          setResetSuccess("");
        }, 2000);
      } else {
        setResetError(result.message || "Đặt lại mật khẩu thất bại");
      }
    } catch (error: any) {
      console.error("Error resetting password:", error);
      setResetError("Mã OTP không hợp lệ hoặc đã hết hạn");
    } finally {
      setResetLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const loginData: LoginRequest = {
        username: username,
        password: password,
      };

      const result = await loginAPI(loginData);

      if (result.success && result.data) {
        // Lưu token và user info vào context và localStorage
        login(result.data.user, result.data.accessToken, result.data.refreshToken);

        // Track login event
        trackLogin(result.data.user.role === "admin" ? "Admin Login" : "Student Login");

        // Kiểm tra role từ API response để điều hướng
        if (result.data.user.role === "admin") {
          navigate("/home-admin");
        } else {
          navigate("/");
        }
      } else {
        setError(result.message || "Đăng nhập thất bại");
      }
    } catch (error) {
      setError("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <img
          src="/img-auth.png"
          alt="Học tập dễ dàng với MEI"
          className="login-img"
        />
        <div className="login-img-caption">Học tập dễ dàng với MEI</div>
      </div>
      <div className="login-right">
        <div className="login-welcome">
          <button className="login-tab login-tab-active">Đăng nhập</button>
        </div>
        <div className="login-desc">
          Nền tảng tự học và ôn tập toán trực tuyến cho học sinh tiểu học
        </div>

        {successMessage && (
          <div
            style={{
              color: "green",
              marginBottom: 10,
              textAlign: "center",
            }}
          >
            {successMessage}
          </div>
        )}

        {error && (
          <div
            style={{
              color: "red",
              marginBottom: 10,
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        <form className="login-form" onSubmit={handleLogin}>
          <label className="login-label">Tên đăng nhập</label>
          <input
            type="text"
            className="login-input"
            placeholder="Enter your User name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <label className="login-label">Mật khẩu</label>
          <div className="login-password-row">
            <input
              type={showPassword ? "text" : "password"}
              className="login-input"
              placeholder="Enter your Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              className="login-eye"
              onClick={() => setShowPassword((v) => !v)}
              title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {showPassword ? "🙈" : "👁️"}
            </span>
          </div>
          <div className="login-options-row">
            <label>
              <input type="checkbox" /> Lưu người dùng
            </label>
            <a 
              href="#" 
              className="login-forgot"
              onClick={(e) => {
                e.preventDefault();
                setShowForgotModal(true);
              }}
            >
              Quên mật khẩu
            </a>
          </div>
          <button
            className="login-submit-btn"
            type="submit"
            disabled={loading}
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
          <button
            type="button"
            className="login-register-btn"
            onClick={() => navigate("/auth/register")}
          >
            Đăng ký
          </button>
        </form>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="modal-overlay" onClick={() => setShowForgotModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Quên mật khẩu</h2>
              <button 
                className="modal-close" 
                onClick={() => {
                  setShowForgotModal(false);
                  setForgotEmail("");
                  setForgotError("");
                  setForgotSuccess("");
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleForgotPassword} className="forgot-form">
              <p className="forgot-description">
                Nhập email của bạn để nhận mã OTP đặt lại mật khẩu
              </p>

              <div className="form-group">
                <label htmlFor="forgotEmail">Email</label>
                <input
                  type="email"
                  id="forgotEmail"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="Nhập email của bạn"
                  disabled={forgotLoading}
                />
              </div>

              {forgotError && <div className="error-message">{forgotError}</div>}
              {forgotSuccess && <div className="success-message">{forgotSuccess}</div>}

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => {
                    setShowForgotModal(false);
                    setForgotEmail("");
                    setForgotError("");
                    setForgotSuccess("");
                  }}
                  disabled={forgotLoading}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={forgotLoading}
                >
                  {forgotLoading ? "Đang gửi..." : "Gửi mã OTP"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetModal && (
        <div className="modal-overlay" onClick={() => setShowResetModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Đặt lại mật khẩu</h2>
              <button 
                className="modal-close" 
                onClick={() => {
                  setShowResetModal(false);
                  setResetForm({ email: "", otp: "", newPassword: "", confirmPassword: "" });
                  setResetError("");
                  setResetSuccess("");
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="forgot-form">
              <p className="forgot-description">
                Nhập mã OTP đã được gửi đến email <strong>{resetForm.email}</strong> và mật khẩu mới
              </p>

              <div className="form-group">
                <label htmlFor="otp">Mã OTP</label>
                <input
                  type="text"
                  id="otp"
                  value={resetForm.otp}
                  onChange={(e) => setResetForm({ ...resetForm, otp: e.target.value })}
                  placeholder="Nhập mã OTP (6 chữ số)"
                  disabled={resetLoading}
                  maxLength={6}
                />
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">Mật khẩu mới</label>
                <div className="password-input-wrapper">
                  <input
                    type={showResetPasswords.newPassword ? "text" : "password"}
                    id="newPassword"
                    value={resetForm.newPassword}
                    onChange={(e) => setResetForm({ ...resetForm, newPassword: e.target.value })}
                    placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                    disabled={resetLoading}
                  />
                  <span
                    className="password-toggle-icon"
                    onClick={() => setShowResetPasswords({ ...showResetPasswords, newPassword: !showResetPasswords.newPassword })}
                    title={showResetPasswords.newPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showResetPasswords.newPassword ? "🙈" : "👁️"}
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Xác nhận mật khẩu mới</label>
                <div className="password-input-wrapper">
                  <input
                    type={showResetPasswords.confirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    value={resetForm.confirmPassword}
                    onChange={(e) => setResetForm({ ...resetForm, confirmPassword: e.target.value })}
                    placeholder="Nhập lại mật khẩu mới"
                    disabled={resetLoading}
                  />
                  <span
                    className="password-toggle-icon"
                    onClick={() => setShowResetPasswords({ ...showResetPasswords, confirmPassword: !showResetPasswords.confirmPassword })}
                    title={showResetPasswords.confirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showResetPasswords.confirmPassword ? "🙈" : "👁️"}
                  </span>
                </div>
              </div>

              {resetError && <div className="error-message">{resetError}</div>}
              {resetSuccess && <div className="success-message">{resetSuccess}</div>}

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => {
                    setShowResetModal(false);
                    setResetForm({ email: "", otp: "", newPassword: "", confirmPassword: "" });
                    setResetError("");
                    setResetSuccess("");
                  }}
                  disabled={resetLoading}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={resetLoading}
                >
                  {resetLoading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;