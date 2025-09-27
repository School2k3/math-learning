import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/register.css";

const Register: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="register-page">
      <div className="register-left">
        <img src="/img-auth.png" alt="Học tập với MEI" className="register-img" />
        <div className="register-img-caption">Học Tập dễ dàng với MEI</div>
      </div>
      <div className="register-right">
        <div className="register-welcome">
          <button style={{ marginLeft: 180 }} className="register-tab register-tab-active">Đăng ký</button>
        </div>
        <div className="register-desc">
          Đăng ký tài khoản để bắt đầu học và luyện tập cùng MEI!
        </div>
        <form className="register-form">
          <label className="register-label">Họ và Tên</label>
          <input
            type="text"
            className="register-input"
            placeholder="Nhập họ tên của bạn"
          />
          <label className="register-label">Địa chỉ Email</label>
          <input
            type="email"
            className="register-input"
            placeholder="Nhập email của bạn"
          />
          <label className="register-label">Tên đăng nhập</label>
          <input
            type="text"
            className="register-input"
            placeholder="Nhập tên đăng nhập"
          />
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={{marginRight:150}} className="register-label">Mật khẩu</label>
              <div className="register-password-row">
                <input
                  type={showPassword ? "text" : "password"}
                  className="register-input"
                  placeholder="Nhập mật khẩu"
                />
                <span
                  className="register-eye"
                  onClick={() => setShowPassword((v) => !v)}
                  title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? "🙈" : "👁️"}
                </span>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{marginRight:100}} className="register-label">Nhập lại mật khẩu</label>
              <div className="register-password-row">
                <input
                  type={showRePassword ? "text" : "password"}
                  className="register-input"
                  placeholder="Nhập lại mật khẩu"
                />
                <span
                  className="register-eye"
                  onClick={() => setShowRePassword((v) => !v)}
                  title={showRePassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showRePassword ? "🙈" : "👁️"}
                </span>
              </div>
            </div>
          </div>
          <label className="register-label">Chọn khối</label>
          <select className="register-input">
            <option value="">Chọn khối học</option>
            <option value="1">Khối 1</option>
            <option value="2">Khối 2</option>
            <option value="3">Khối 3</option>
            <option value="4">Khối 4</option>
            <option value="5">Khối 5</option>
          </select>
          <label className="register-label">Địa chỉ</label>
          <input
            type="text"
            className="register-input"
            placeholder="Nhập địa chỉ"
          />
          <button className="register-submit-btn" type="submit">
            Đăng ký
          </button>
          <button
            type="button"
            className="register-login-btn"
            onClick={() => navigate("/auth/login")}
          >
            Đăng nhập
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;