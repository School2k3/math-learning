import React, { useState, useEffect } from "react";
import "../css/admin-css/user.css";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

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
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUser, setNewUser] = useState<Partial<User>>({});

  // Mock data
  const mockUsers: User[] = [
    {
      user_id: 1,
      username: "admin",
      password_hash: "$2b$10$Z6bXuEhr3U...",
      email: "zeroschool10@gmail.com",
      full_name: "Adminator",
      role: "admin",
      grade: 1,
      avatar_url: null,
      created_at: "2025-10-03 15:02:15.483",
      updated_at: "2025-10-03 15:02:46.713",
      is_verified: true,
    },
    {
      user_id: 2,
      username: "duong1234",
      password_hash: "$2b$10$P.Ne0QWSv...",
      email: "duongdhkpmi7ctt@gmail.com",
      full_name: "Nguyen Dinh Duong",
      role: "student",
      grade: 1,
      avatar_url: null,
      created_at: "2025-10-04 01:41:33.664",
      updated_at: "2025-10-04 01:42:20.987",
      is_verified: true,
    },
  ];

  // Load mock data
  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      // Giả lập API call
      setTimeout(() => {
        setUsers(mockUsers);
        setLoading(false);
      }, 500);
    } catch (error) {
      setError("Không thể tải dữ liệu: " + (error as Error).message);
      console.error("Error loading users:", error);
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

  // Thêm user mới
  const handleAdd = () => {
    if (
      !newUser.username ||
      !newUser.email ||
      !newUser.full_name ||
      !newUser.role
    ) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    const newId = Math.max(...users.map((u) => u.user_id)) + 1;
    const now = new Date().toISOString().replace("T", " ").slice(0, 19);

    // Cập nhật hàm handleAdd để tạo user với avatar null
    const userToAdd: User = {
      user_id: newId,
      username: newUser.username!,
      password_hash: "$2b$10$" + Math.random().toString(36).substring(2, 15), // Mock hash
      email: newUser.email!,
      full_name: newUser.full_name!,
      role: newUser.role as "student" | "teacher" | "admin",
      grade: newUser.grade || 1,
      avatar_url: null, // Đổi thành null thay vì auto-generate
      created_at: now,
      updated_at: now,
      is_verified: false,
    };

    setUsers([...users, userToAdd]);
    setNewUser({});
    setShowAddForm(false);
    alert("Thêm người dùng thành công!");
  };

  // Xóa user
  const handleDelete = (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
      setUsers(users.filter((user) => user.user_id !== id));
      alert("Xóa người dùng thành công!");
    }
  };

  // Bắt đầu chỉnh sửa
  const handleEdit = (user: User) => {
    setEditingId(user.user_id);
    setEditData({ ...user });
  };

  // Lưu chỉnh sửa
  const handleSave = () => {
    if (!editData.username || !editData.email || !editData.full_name) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    const updatedUsers = users.map((user) =>
      user.user_id === editingId
        ? {
            ...user,
            ...editData,
            updated_at: new Date().toISOString().replace("T", " ").slice(0, 19),
          }
        : user
    );

    setUsers(updatedUsers);
    setEditingId(null);
    setEditData({});
    alert("Cập nhật người dùng thành công!");
  };

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      logout();
      navigate("/auth/login");
    }
  };

  // Hủy chỉnh sửa
  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
    setShowAddForm(false);
    setNewUser({});
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
          <button className="btn-add" onClick={() => setShowAddForm(true)}>
            + Thêm mới
          </button>
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
              {/* Form thêm mới */}
              {showAddForm && (
                <tr className="add-row">
                  <td>-</td>
                  <td>
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        backgroundColor: "#ddd",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      👤
                    </div>
                  </td>
                  <td>
                    <input
                      type="text"
                      value={newUser.username || ""}
                      onChange={(e) =>
                        setNewUser({ ...newUser, username: e.target.value })
                      }
                      placeholder="Tên đăng nhập"
                      className="input-field"
                      required
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={newUser.full_name || ""}
                      onChange={(e) =>
                        setNewUser({ ...newUser, full_name: e.target.value })
                      }
                      placeholder="Họ và tên"
                      className="input-field"
                      required
                    />
                  </td>
                  <td>
                    <input
                      type="email"
                      value={newUser.email || ""}
                      onChange={(e) =>
                        setNewUser({ ...newUser, email: e.target.value })
                      }
                      placeholder="Email"
                      className="input-field"
                      required
                    />
                  </td>
                  <td>
                    <select
                      value={newUser.role || ""}
                      onChange={(e) =>
                        setNewUser({
                          ...newUser,
                          role: e.target.value as
                            | "student"
                            | "teacher"
                            | "admin",
                        })
                      }
                      className="select-field"
                      required
                    >
                      <option value="">Chọn vai trò</option>
                      <option value="student">Học sinh</option>
                      <option value="teacher">Giáo viên</option>
                      <option value="admin">Quản trị viên</option>
                    </select>
                  </td>
                  <td>
                    <select
                      value={newUser.grade || ""}
                      onChange={(e) =>
                        setNewUser({
                          ...newUser,
                          grade: Number(e.target.value),
                        })
                      }
                      className="select-field"
                    >
                      <option value="">Chọn lớp</option>
                      <option value={1}>1</option>
                      <option value={2}>2</option>
                      <option value={3}>3</option>
                      <option value={4}>4</option>
                      <option value={5}>5</option>
                    </select>
                  </td>
                  <td>
                    <span className="status-badge unverified">
                      Chưa xác thực
                    </span>
                  </td>
                  <td>-</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-save" onClick={handleAdd}>
                        💾 Lưu
                      </button>
                      <button className="btn-cancel" onClick={handleCancel}>
                        ❌ Hủy
                      </button>
                    </div>
                  </td>
                </tr>
              )}

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
                      <span
                        className={`status-badge ${
                          user.is_verified ? "verified" : "unverified"
                        }`}
                      >
                        {user.is_verified
                          ? "✅ Đã xác thực"
                          : "❌ Chưa xác thực"}
                      </span>
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
                          ✏️
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(user.user_id)}
                        >
                          🗑️
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
