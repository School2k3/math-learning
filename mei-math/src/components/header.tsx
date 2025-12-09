import React, { useState, useEffect, useRef } from "react";
import { useNavigate, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { fetchAllChapters } from "../api/chapterAPI";
import "../css/header.css";

const Header: React.FC<{ bgWhite?: boolean }> = ({ bgWhite }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Load all chapters for search
  useEffect(() => {
    const loadChapters = async () => {
      try {
        const response = await fetchAllChapters();
        const chapters = response.chapters || [];
        
        // Lọc chapters theo lớp của user nếu đã đăng nhập
        const filteredByGrade = user?.grade 
          ? chapters.filter((ch: any) => ch.gradeId === user.grade)
          : chapters;
        
        setSearchResults(filteredByGrade);
      } catch (error) {
        console.error("Error loading chapters:", error);
      }
    };
    loadChapters();
  }, [user?.grade]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setShowSearchResults(query.length > 0);
  };

  const filteredChapters = searchResults.filter((chapter) =>
    chapter.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleChapterClick = (chapter: any) => {
    // Navigate to study page with chapter, grade, and semester params
    if (!chapter || !chapter.id) return;
    
    const params = new URLSearchParams();
    params.append("chapterId", chapter.id.toString());
    if (chapter.gradeId) params.append("gradeId", chapter.gradeId.toString());
    if (chapter.volume) params.append("semester", chapter.volume.toString());
    navigate(`/study?${params.toString()}`);
    setSearchQuery("");
    setShowSearchResults(false);
  };

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
          src="/logo-Photoroom.png"
          alt="MEI Logo"
          className="header__logo"
        />
        <div className="header__search-container" ref={searchRef}>
          <input
            type="text"
            className="header__search"
            placeholder="Tìm kiếm chương học"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => setShowSearchResults(searchQuery.length > 0)}
          />
          {showSearchResults && filteredChapters.length > 0 && (
            <div className="header__search-results">
              {filteredChapters.map((chapter) => (
                <div
                  key={chapter.id}
                  className="header__search-item"
                  onClick={() => handleChapterClick(chapter)}
                >
                  <div className="header__search-item-title">{chapter.title}</div>
                  <div className="header__search-item-info">
                    Lớp {chapter.gradeId} - Học kỳ {chapter.volume}
                  </div>
                </div>
              ))}
            </div>
          )}
          {showSearchResults && searchQuery.length > 0 && filteredChapters.length === 0 && (
            <div className="header__search-results">
              <div className="header__search-item header__search-item--empty">
                Không tìm thấy chương học nào
              </div>
            </div>
          )}
        </div>
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
            to="/dashboard"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Đánh giá
          </NavLink>
          <NavLink
            to="/news"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Tin tức
          </NavLink>
          <NavLink
            to="/rewards"
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
                src={user.avatarUrl || "/public/defaut_avatar.jpg"}
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
                  <button onClick={() => navigate("/practice-continue")}>
                    📝 Tiếp tục thực hành
                  </button>
                  <button onClick={() => navigate("/exams-history")}>
                    📊 Lịch sử kiểm tra
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
