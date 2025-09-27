import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/login.css";

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="login-page">
      <div className="login-left">
        <img src="/img-auth.png" alt="Học tập dễ dàng với MEI" className="login-img" />
        <div className="login-img-caption">Học tập dễ dàng với MEI</div>
      </div>
      <div className="login-right">
        <div className="login-welcome">
          <button className="login-tab login-tab-active">Đăng nhập</button>
        </div>
        <div className="login-desc">
          Nền tảng tự học và ôn tập toán trực tuyến cho học sinh tiểu học
        </div>
        <form className="login-form">
          <label className="login-label">Tên đăng nhập</label>
          <input
            type="text"
            className="login-input"
            placeholder="Enter your User name"
          />
          <label className="login-label">Mật khẩu</label>
          <div className="login-password-row">
            <input
              type={showPassword ? "text" : "password"}
              className="login-input"
              placeholder="Enter your Password"
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
          <button className="login-submit-btn" type="submit">
            Đăng nhập
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