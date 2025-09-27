import React from "react";
import { useNavigate, NavLink } from "react-router-dom"; // Thêm NavLink
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
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive && location.pathname !== "/" ? "active" : ""
            }
          >
            Trang chủ
          </NavLink>
          <NavLink to="/study" className={({ isActive }) => isActive ? "active" : ""}>Vào học</NavLink>
          <NavLink to="/no" className={({ isActive }) => isActive ? "active" : ""}>Đánh giá</NavLink>
          <NavLink to="/no" className={({ isActive }) => isActive ? "active" : ""}>Tin tức</NavLink>
          <NavLink to="/no" className={({ isActive }) => isActive ? "active" : ""}>Đổi quà</NavLink>
        </nav>
        <div className="header__actions">
          <button
            className="header__login"
            onClick={() => navigate("/auth/login")}
          >
            Đăng nhập
          </button>
          <button
            className="header__register"
            onClick={() => navigate("/auth/register")}
          >
            Đăng ký
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;