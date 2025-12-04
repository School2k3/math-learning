import React, { useState, useEffect } from "react";
import "../css/admin-css/user.css";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getAllUsers, updateUser, toggleUserVerification } from "../api/userAPI";
import type { User as ApiUser } from "../api/userAPI";

interface User {
  user_id: number;
  username: string;
  password_hash: string;
  email: string;
  full_name: string;
  role: "student" | "teacher" | "admin";
  grade: number;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  is_verified: boolean;
}

const UserAdmin: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Filter states
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterGrade, setFilterGrade] = useState<string>("all");
  const [filterVerified, setFilterVerified] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<User>>({});

  // Load data from API
  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      console.log("🔵 Bắt đầu tải danh sách users từ API...");
      
      // Build params from filters
      const params: any = {};
      if (filterRole !== "all") params.role = filterRole;
      if (filterGrade !== "all") params.grade = Number(filterGrade);
      if (filterVerified !== "all") params.isVerified = filterVerified === "true";
      if (searchTerm) params.search = searchTerm;
      
      const response = await getAllUsers(params);
      
      console.log("✅ API response:", response);
      
      if (response.success && response.data.users) {
        // Map API data to component's User interface
        const mappedUsers: User[] = response.data.users.map((user: ApiUser) => ({
          user_id: user.id,
          username: user.username,
          password_hash: "***", // Don't show password hash
          email: user.email,
          full_name: user.fullName,
          role: user.role as "student" | "teacher" | "admin",
          grade: user.grade || 1,
          avatar_url: user.avatarUrl || null,
          created_at: user.createdAt || new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_verified: user.isVerified,
        }));
        
        setUsers(mappedUsers);
        console.log("✅ Đã load", mappedUsers.length, "users");
      } else {
        console.error("❌ API response không hợp lệ:", response);
        setError("Dữ liệu trả về không hợp lệ");
        setUsers([]);
      }
      
      setLoading(false);
    } catch (error) {
      const errorMessage = (error as Error).message;
      
      // Nếu token hết hạn, redirect về login
      if (errorMessage.includes("401")) {
        console.error("🔴 Token hết hạn, chuyển về trang đăng nhập...");
        alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        logout();
        navigate("/auth/login");
        return;
      }
      
      setError("Không thể tải dữ liệu: " + errorMessage);
      console.error("🔴 Error loading users:", error);
      setUsers([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter users
  const filteredUsers = users.filter((user) => {
    if (filterRole !== "all" && user.role !== filterRole) return false;
    if (filterGrade !== "all" && user.grade !== Number(filterGrade))
      return false;
    if (filterVerified !== "all") {
      const isVerified = filterVerified === "true";
      if (user.is_verified !== isVerified) return false;
    }
    if (
      searchTerm &&
      !user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !user.username.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !user.email.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    return true;
  });



  // Bắt đầu chỉnh sửa
  const handleEdit = (user: User) => {
    setEditingId(user.user_id);
    setEditData({ ...user });
  };

  // Lưu chỉnh sửa
  const handleSave = async () => {
    if (!editData.username || !editData.email || !editData.full_name) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    try {
      console.log("🔵 Đang cập nhật user ID:", editingId);
      
      // Prepare update data
      const updateData = {
        username: editData.username,
        email: editData.email,
        fullName: editData.full_name,
        role: editData.role === 'teacher' ? 'student' : editData.role as 'student' | 'admin',
        grade: editData.grade,
        isVerified: editData.is_verified,
      };
      
      console.log("📤 Update data:", updateData);
      
      const response = await updateUser(editingId!, updateData);
      
      console.log("✅ Update response:", response);
      
      if (response.success) {
        alert("Cập nhật người dùng thành công!");
        setEditingId(null);
        setEditData({});
        
        // Reload data from API
        await loadData();
      } else {
        alert("Cập nhật thất bại: " + response.message);
      }
    } catch (error) {
      console.error("🔴 Lỗi khi cập nhật user:", error);
      alert("Lỗi khi cập nhật: " + (error as Error).message);
    }
  };

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      logout();
      navigate("/auth/login");
    }
  };

  // Toggle verification status
  const handleToggleVerification = async (userId: number, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    const confirmMessage = newStatus 
      ? "Xác nhận đánh dấu người dùng này là đã xác minh?"
      : "Xác nhận bỏ xác minh người dùng này?";
    
    if (!window.confirm(confirmMessage)) return;

    try {
      console.log(`🔵 Toggle verification for user ${userId}: ${currentStatus} -> ${newStatus}`);
      
      const response = await toggleUserVerification(userId, newStatus);
      
      if (response.success) {
        alert(`✅ ${response.message}`);
        // Reload data to reflect changes
        await loadData();
      } else {
        alert(`❌ Lỗi: ${response.message}`);
      }
    } catch (error) {
      console.error("🔴 Lỗi khi toggle verification:", error);
      alert("❌ Lỗi khi cập nhật trạng thái xác minh: " + (error as Error).message);
    }
  };



  // Format datetime
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN");
  };

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="admin-logo">
          <img src="/logo-Photoroom.png" alt="MEI Logo" />
          <h2>MEI Math</h2>
          <p>Admin Dashboard</p>
        </div>

        <nav className="admin-nav">
          <div className="nav-section">
            <h4>QUẢN LÝ NỘI DUNG</h4>
            <ul>
              <li>
                <Link
                  to="/home-admin"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  📊 Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/chapters"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  📖 Quản lý chương
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/lessons"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  📝 Quản lý bài học
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/questions"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  ❓ Quản lý câu hỏi
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/exams"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  📋 Quản lý bài kiểm tra
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/answers"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  📝 Quản lý đáp án
                </Link>
              </li>
            </ul>
          </div>

          <div className="nav-section">
            <h4>QUẢN LÝ NGƯỜI DÙNG</h4>
            <ul>
              <li className="active">
                <Link
                  to="/admin/users"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  👥 Quản lý người dùng
                </Link>
              </li>
              <li>📈 Báo cáo học tập</li>
            </ul>
          </div>

          <div className="nav-section">
            <h4>HỆ THỐNG</h4>
            <ul>
              <li>⚙️ Cài đặt</li>
              <li>🔐 Bảo mật</li>
              <li>📊 Thống kê</li>
              <li>
                <button
                  onClick={handleLogout}
                  className="logout-btn"
                  style={{
                    background: "none",
                    backgroundColor: "red",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    color: "white",
                    width: "100%",
                    padding: "8px",
                    borderRadius: "4px",
                  }}
                >
                  🚪 Đăng xuất
                </button>
              </li>
            </ul>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="admin-main">
        <div className="user-header">
          <div className="user-title">
            <h1>Quản lý người dùng</h1>
            <p>{filteredUsers.length} người dùng</p>
          </div>
        </div>

        {/* Filter Section */}
        <div
          className="filter-section"
          style={{
            display: "flex",
            gap: "16px",
            marginBottom: "20px",
            padding: "16px",
            backgroundColor: "#f8f9fa",
            borderRadius: "8px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "4px",
                fontWeight: "500",
              }}
            >
              Tìm kiếm:
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tên, username hoặc email..."
              style={{
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ddd",
                width: "200px",
              }}
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "4px",
                fontWeight: "500",
              }}
            >
              Vai trò:
            </label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              style={{
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ddd",
              }}
            >
              <option value="all">Tất cả vai trò</option>
              <option value="student">Học sinh</option>
              <option value="teacher">Giáo viên</option>
              <option value="admin">Quản trị viên</option>
            </select>
          </div>
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "4px",
                fontWeight: "500",
              }}
            >
              Lớp:
            </label>
            <select
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value)}
              style={{
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ddd",
              }}
            >
              <option value="all">Tất cả lớp</option>
              <option value="1">Lớp 1</option>
              <option value="2">Lớp 2</option>
              <option value="3">Lớp 3</option>
              <option value="4">Lớp 4</option>
              <option value="5">Lớp 5</option>
            </select>
          </div>
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "4px",
                fontWeight: "500",
              }}
            >
              Xác thực:
            </label>
            <select
              value={filterVerified}
              onChange={(e) => setFilterVerified(e.target.value)}
              style={{
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ddd",
              }}
            >
              <option value="all">Tất cả</option>
              <option value="true">Đã xác thực</option>
              <option value="false">Chưa xác thực</option>
            </select>
          </div>
          {loading && (
            <div style={{ alignSelf: "flex-end", color: "#666" }}>
              Đang tải...
            </div>
          )}
          {error && (
            <div style={{ alignSelf: "flex-end", color: "#d32f2f" }}>
              Lỗi: {error}
            </div>
          )}
        </div>

        <div className="user-table-container">
          <table className="user-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Avatar</th>
                <th>Tên đăng nhập</th>
                <th>Họ tên</th>
                <th>Email</th>
                <th>Vai trò</th>
                <th>Lớp</th>
                <th>Xác thực</th>
                <th>Ngày tạo</th>
                <th>Chức năng</th>
              </tr>
            </thead>
            <tbody>
              {/* Danh sách người dùng */}
              {filteredUsers.map((user) => (
                <tr key={user.user_id}>
                  <td>{user.user_id}</td>
                  <td>
                    <img
                      src={
                        user.avatar_url ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          user.full_name
                        )}&background=random`
                      }
                      alt={user.full_name}
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          user.full_name
                        )}&background=random`;
                      }}
                    />
                  </td>
                  <td>
                    {editingId === user.user_id ? (
                      <input
                        type="text"
                        value={editData.username || ""}
                        onChange={(e) =>
                          setEditData({ ...editData, username: e.target.value })
                        }
                        className="input-field"
                      />
                    ) : (
                      user.username
                    )}
                  </td>
                  <td>
                    {editingId === user.user_id ? (
                      <input
                        type="text"
                        value={editData.full_name || ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            full_name: e.target.value,
                          })
                        }
                        className="input-field"
                      />
                    ) : (
                      user.full_name
                    )}
                  </td>
                  <td>
                    {editingId === user.user_id ? (
                      <input
                        type="email"
                        value={editData.email || ""}
                        onChange={(e) =>
                          setEditData({ ...editData, email: e.target.value })
                        }
                        className="input-field"
                      />
                    ) : (
                      user.email
                    )}
                  </td>
                  <td>
                    {editingId === user.user_id ? (
                      <select
                        value={editData.role || ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            role: e.target.value as
                              | "student"
                              | "teacher"
                              | "admin",
                          })
                        }
                        className="select-field"
                      >
                        <option value="student">Học sinh</option>
                        <option value="teacher">Giáo viên</option>
                        <option value="admin">Quản trị viên</option>
                      </select>
                    ) : (
                      <span className={`role-badge ${user.role}`}>
                        {user.role === "student"
                          ? "👨‍🎓 Học sinh"
                          : user.role === "teacher"
                          ? "👨‍🏫 Giáo viên"
                          : "👨‍💼 Quản trị viên"}
                      </span>
                    )}
                  </td>
                  <td>
                    {editingId === user.user_id ? (
                      <select
                        value={editData.grade || ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            grade: Number(e.target.value),
                          })
                        }
                        className="select-field"
                      >
                        <option value={1}>1</option>
                        <option value={2}>2</option>
                        <option value={3}>3</option>
                        <option value={4}>4</option>
                        <option value={5}>5</option>
                      </select>
                    ) : user.grade ? (
                      `Lớp ${user.grade}`
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>
                    {editingId === user.user_id ? (
                      <select
                        value={editData.is_verified ? "true" : "false"}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            is_verified: e.target.value === "true",
                          })
                        }
                        className="select-field"
                      >
                        <option value="true">Đã xác thực</option>
                        <option value="false">Chưa xác thực</option>
                      </select>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          className={`status-badge ${
                            user.is_verified ? "verified" : "unverified"
                          }`}
                        >
                          {user.is_verified
                            ? "✅ Đã xác thực"
                            : "❌ Chưa xác thực"}
                        </span>
                        <button
                          onClick={() => handleToggleVerification(user.user_id, user.is_verified)}
                          style={{
                            padding: '4px 8px',
                            fontSize: '11px',
                            backgroundColor: user.is_verified ? '#ff9800' : '#4caf50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                          title={user.is_verified ? "Bỏ xác minh" : "Xác minh"}
                        >
                          {user.is_verified ? "🔓" : "🔒"}
                        </button>
                      </div>
                    )}
                  </td>
                  <td>{formatDateTime(user.created_at)}</td>
                  <td>
                    {editingId === user.user_id ? (
                      <div className="action-buttons">
                        <button className="btn-save" onClick={handleSave}>
                          💾
                        </button>
                        <button
                          className="btn-cancel"
                          onClick={() => setEditingId(null)}
                        >
                          ❌
                        </button>
                      </div>
                    ) : (
                      <div className="action-buttons">
                        <button
                          className="btn-edit"
                          onClick={() => handleEdit(user)}
                        >
                          ✏️ Sửa
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserAdmin;
