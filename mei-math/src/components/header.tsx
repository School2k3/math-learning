import React from "react";
import { useNavigate } from "react-router-dom";
import "../css/header.css";


const Header: React.FC<{ bgWhite?: boolean }> = ({ bgWhite }) => {
  const navigate = useNavigate();

  return (
    <header className={`header${bgWhite ? " header--white" : ""}`}>
      <div className="header__container">
        <img
          src="/public/logo-Photoroom.png"
          alt="MEI Logo"
          className="header__logo"
        />
        <input
          type="text"
          className="header__search"
          placeholder="Tìm kiếm chủ điểm"
        />
        <nav className="header__nav">
          <a href="/">Trang chủ</a>
          <a href="/study">Vào học</a>
          <a href="#">Đánh giá</a>
          <a href="#">Tin tức</a>
          <a href="#">Đổi quà</a>
        </nav>
        <div className="header__actions">
          <button
            className="header__login"
            onClick={() => navigate("/auth?mode=login")}
          >
            Đăng nhập
          </button>
          <button
            className="header__register"
            onClick={() => navigate("/src/auth/auth?mode=register")}
          >
            Đăng ký
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;