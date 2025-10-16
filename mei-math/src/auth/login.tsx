import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { loginAPI } from "../api/loginAPI";
import type { LoginRequest } from "../api/loginAPI"; // Thử import type
import { useAuth } from "../contexts/AuthContext";
import "../css/login.css";

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Kiểm tra tài khoản admin trước khi gọi API
      if (username === "admin" && password === "admin") {
        // Tạo user admin giả lập
        const adminUser = {
          id: 0,
          username: "admin",
          email: "admin@mei.com",
          role: "admin",
          fullName: "Administrator",
        };

        login(adminUser, "admin-token", "admin-refresh-token");
        navigate("/home-admin");
        return;
      }

      const loginData: LoginRequest = {
        username: username,
        password: password,
      };

      const result = await loginAPI(loginData);

      if (result.success && result.data) {
        login(result.data.user, result.data.token, result.data.refreshToken);

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
            <a href="#" className="login-forgot">
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
    </div>
  );
};

export default Login;