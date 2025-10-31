import React, { useState } from "react";
import { useNavigate, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "../css/header.css";

const Header: React.FC<{ bgWhite?: boolean }> = ({ bgWhite }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    navigate("/auth/login");
  };

  return (
    <header className={`header${bgWhite ? " header--white" : ""}`}>
      <div className="header__container">
        <img
          style={{ width: "100px", height: "100px", marginLeft: "20px" }}
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
          <NavLink
            to="/study"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Vào học
          </NavLink>
          <NavLink
            to="/no"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Đánh giá
          </NavLink>
          <NavLink
            to="/no"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Tin tức
          </NavLink>
          <NavLink
            to="/no"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Đổi quà
          </NavLink>
        </nav>
        <div className="header__actions">
          {isAuthenticated && user ? (
            <div
              className="header__user"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <img
                src={user.avatar || "/public/defaut_avatar.jpg"}
                alt="User Avatar"
                className="header__avatar"
              />
              <div className="header__user-info">
                <span className="header__username">{user.fullName}</span>
                <span className="header__grade">Lớp {user.grade}</span>
              </div>
              <span className="header__dropdown-arrow">▼</span>

              {showDropdown && (
                <div className="header__dropdown">
                  <button onClick={() => navigate("/profile")}>
                    Thông tin cá nhân
                  </button>
                  <button onClick={() => navigate("/settings")}>Cài đặt</button>
                  <button onClick={handleLogout}>Đăng xuất</button>
                </div>
              )}
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
