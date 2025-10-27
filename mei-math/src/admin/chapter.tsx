import React, { useState, useEffect } from "react";
import "../css/admin-css/chapter.css";
import { Link, useNavigate } from "react-router-dom";
import { fetchAllChapters, fetchChaptersByGrade, createChapter, updateChapter, deleteChapter } from "../api/chapterAPI";
import { useAuth } from "../contexts/AuthContext";
interface Chapter {
  id: number;
  grade: number;
  volume: number;
  title: string;
}

const ChapterAdmin: React.FC = () => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  // Filter states
  const [filterGrade, setFilterGrade] = useState<string>("all");
  const [filterVolume, setFilterVolume] = useState<string>("all");
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Chapter>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newChapter, setNewChapter] = useState<Partial<Chapter>>({});

  const [sortField, setSortField] = useState<"title" | "grade" | "volume" | "">("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Load data từ API
  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetchAllChapters();
      setChapters(response.chapters || []);
    } catch (error) {
      setError("Không thể tải dữ liệu: " + (error as Error).message);
      console.error("Error loading chapters:", error);
      setChapters([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter chapters
  const filteredChapters = chapters.filter(chapter => {
    if (filterGrade !== "all" && chapter.grade !== Number(filterGrade)) return false;
    if (filterVolume !== "all" && chapter.volume !== Number(filterVolume)) return false;
    return true;
  });

  // Sort chapters
  const sortedChapters = [...filteredChapters].sort((a, b) => {
    if (!sortField) return 0;
    if (sortField === "title") {
      return sortOrder === "asc"
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title);
    }
    if (sortField === "grade" || sortField === "volume") {
      return sortOrder === "asc"
        ? a[sortField] - b[sortField]
        : b[sortField] - a[sortField];
    }
    return 0;
  });

  // Thêm chương mới (tạm thời vô hiệu hóa - chỉ có API GET)
  const handleAdd = async () => {
    if (!newChapter.title || !newChapter.grade || !newChapter.volume) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    try {
      setLoading(true);
      await createChapter({
        grade: newChapter.grade!,
        volume: newChapter.volume!,
        title: newChapter.title!,
      });
      
      // Reload data sau khi thêm thành công
      await loadData();
      setNewChapter({});
      setShowAddForm(false);
      alert("Thêm chương thành công!");
    } catch (error) {
      console.error("Error creating chapter:", error);
      alert("Lỗi khi thêm chương: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Xóa chương (tạm thời vô hiệu hóa - chỉ có API GET)
  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa chương này? Hành động này không thể hoàn tác!")) {
      return;
    }

    try {
      setLoading(true);
      await deleteChapter(id);
      
      // Reload data sau khi xóa thành công
      await loadData();
      alert("Xóa chương thành công!");
    } catch (error) {
      console.error("Error deleting chapter:", error);
      alert("Lỗi khi xóa chương: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Bắt đầu chỉnh sửa
  const handleEdit = (chapter: Chapter) => {
    setEditingId(chapter.id);
    setEditData({ ...chapter });
  };

  // Lưu chỉnh sửa (tạm thời vô hiệu hóa - chỉ có API GET)
  const handleSave = async () => {
    if (!editData.title || !editData.grade || !editData.volume) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    try {
      setLoading(true);
      await updateChapter(editingId!, {
        grade: editData.grade!,
        volume: editData.volume!,
        title: editData.title!,
      });
      
      // Reload data sau khi cập nhật thành công
      await loadData();
      setEditingId(null);
      setEditData({});
      alert("Cập nhật chương thành công!");
    } catch (error) {
      console.error("Error updating chapter:", error);
      alert("Lỗi khi cập nhật chương: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
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
    setNewChapter({});
  };

  // Handle sort
  const handleSort = (field: "title" | "grade" | "volume") => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="admin-logo">
          <img src="/public/logo-Photoroom.png" alt="MEI Logo" />
          <h2>MEI Math</h2>
          <p>Admin Dashboard</p>
        </div>
        
        <nav className="admin-nav">
          <div className="nav-section">
            <h4>QUẢN LÝ NỘI DUNG</h4>
                        <ul>
                                      <li>
                                        <Link to="/home-admin" style={{ textDecoration: "none", color: "inherit" }}>
                                          📊 Dashboard
                                        </Link>
                                      </li>

                                      <li className="active">
                                        <Link to="/admin/chapters" style={{ textDecoration: "none", color: "inherit" }}>
                                          📖 Quản lý chương
                                        </Link>
                                      </li>
                                      <li>
                                        <Link to="/admin/lessons" style={{ textDecoration: "none", color: "inherit" }}>
                                          📝 Quản lý bài học
                                        </Link>
                                      </li>
                                      <li>
                                        <Link to="/admin/questions" style={{ textDecoration: "none", color: "inherit" }}>
                                          ❓ Quản lý câu hỏi
                                        </Link>
                                      </li>
                                      <li ><Link to="/admin/exams" style={{ textDecoration: "none", color: "inherit" }}>
                                                        📋 Quản lý bài kiểm tra
                                                      </Link></li>
                                    </ul>
          </div>
          
          <div className="nav-section">
            <h4>QUẢN LÝ NGƯỜI DÙNG</h4>
            <ul>
              <Link to="/admin/users" style={{ textDecoration: "none", color: "inherit" }}>
                                👥 Học sinh
                              </Link>
             
              <li>📈 Báo cáo học tập</li>
            </ul>
          </div>
          
          <div className="nav-section">
            <h4>HỆ THỐNG</h4>
            <ul>
              <li>⚙️ Cài đặt</li>
              <li>🔐 Bảo mật</li>
              <li>📊 Thống kê</li>
              <li >
                <button 
                  onClick={handleLogout}
                  className="logout-btn"
                  style={{ 
                    background: "none",
                    backgroundColor: "red", 
                    border: "none",  
                    cursor: "pointer",
                    textAlign: "left",
                    color:"red",
                    width: "100%",
                    padding: "0"
                    
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
        <div className="chapter-header">
          <div className="chapter-title">
            <h1>Chương học</h1>
            <p>{filteredChapters.length} chương</p>
          </div>
          <button 
            className="btn-add"
            onClick={() => setShowAddForm(true)}
            disabled={loading}
            style={{ 
              opacity: loading ? 0.6 : 1,
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "⏳ Đang xử lý..." : "+ Thêm mới"}
          </button>
        </div>

        {/* Filter Section */}
        <div className="filter-section" style={{ 
          display: "flex", 
          gap: "16px", 
          marginBottom: "20px", 
          padding: "16px", 
          backgroundColor: "#f8f9fa", 
          borderRadius: "8px" 
        }}>
          <div>
            <label style={{ display: "block", marginBottom: "4px", fontWeight: "500" }}>Lọc theo lớp:</label>
            <select 
              value={filterGrade} 
              onChange={(e) => setFilterGrade(e.target.value)}
              style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
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
            <label style={{ display: "block", marginBottom: "4px", fontWeight: "500" }}>Lọc theo học kỳ:</label>
            <select 
              value={filterVolume} 
              onChange={(e) => setFilterVolume(e.target.value)}
              style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
            >
              <option value="all">Tất cả học kỳ</option>
              <option value="1">Học kỳ 1</option>
              <option value="2">Học kỳ 2</option>
            </select>
          </div>
          {loading && <div style={{ alignSelf: "flex-end", color: "#666" }}>Đang tải...</div>}
          {error && <div style={{ alignSelf: "flex-end", color: "#d32f2f" }}>Lỗi: {error}</div>}
        </div>

        <div className="chapter-table-container">
          <table className="chapter-table">
            <thead>
              <tr>
                <th>#</th>
                <th style={{ cursor: "pointer" }} onClick={() => handleSort("title")}>
                  Tên chương {sortField === "title" ? (sortOrder === "asc" ? "↑" : "↓") : "↑"}
                </th>
                <th style={{ cursor: "pointer" }} onClick={() => handleSort("grade")}>
                  Lớp {sortField === "grade" ? (sortOrder === "asc" ? "↑" : "↓") : "↑"}
                </th>
                <th style={{ cursor: "pointer" }} onClick={() => handleSort("volume")}>
                  Học kỳ {sortField === "volume" ? (sortOrder === "asc" ? "↑" : "↓") : "↑"}
                </th>
                <th>Chức năng</th>
              </tr>
            </thead>
            <tbody>
              {/* Form thêm mới */}
              {showAddForm && (
                <tr className="add-row">
                  <td>-</td>
                  <td>
                    <input
                      type="text"
                      value={newChapter.title || ""}
                      onChange={(e) => setNewChapter({...newChapter, title: e.target.value})}
                      placeholder="Nhập tên chương"
                      className="input-field"
                    />
                  </td>
                  <td>
                    <select
                      value={newChapter.grade || ""}
                      onChange={(e) => setNewChapter({...newChapter, grade: Number(e.target.value)})}
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
                    <select
                      value={newChapter.volume || ""}
                      onChange={(e) => setNewChapter({...newChapter, volume: Number(e.target.value)})}
                      className="select-field"
                    >
                      <option value="">Chọn kỳ</option>
                      <option value={1}>1</option>
                      <option value={2}>2</option>
                    </select>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-save" 
                        onClick={handleAdd}
                        disabled={loading}
                      >
                        {loading ? "⏳" : "💾"} Lưu
                      </button>
                      <button 
                        className="btn-cancel" 
                        onClick={handleCancel}
                        disabled={loading}
                      >
                        ❌ Hủy
                      </button>
                    </div>
                  </td>
                </tr>
              )}

              {/* Danh sách chương */}
              {sortedChapters.map((chapter, index) => (
                <tr key={chapter.id}>
                  <td>{index + 1}</td>
                  <td>
                    {editingId === chapter.id ? (
                      <input
                        type="text"
                        value={editData.title || ""}
                        onChange={(e) => setEditData({...editData, title: e.target.value})}
                        className="input-field"
                      />
                    ) : (
                      chapter.title
                    )}
                  </td>
                  <td>
                    {editingId === chapter.id ? (
                      <select
                        value={editData.grade || ""}
                        onChange={(e) => setEditData({...editData, grade: Number(e.target.value)})}
                        className="select-field"
                      >
                        <option value={1}>1</option>
                        <option value={2}>2</option>
                        <option value={3}>3</option>
                        <option value={4}>4</option>
                        <option value={5}>5</option>
                      </select>
                    ) : (
                      chapter.grade
                    )}
                  </td>
                  <td>
                    {editingId === chapter.id ? (
                      <select
                        value={editData.volume || ""}
                        onChange={(e) => setEditData({...editData, volume: Number(e.target.value)})}
                        className="select-field"
                      >
                        <option value={1}>1</option>
                        <option value={2}>2</option>
                      </select>
                    ) : (
                      chapter.volume
                    )}
                  </td>
                  <td>
                    {editingId === chapter.id ? (
                      <div className="action-buttons">
                        <button 
                          className="btn-save" 
                          onClick={handleSave}
                          disabled={loading}
                          style={{ opacity: loading ? 0.6 : 1 }}
                        >
                          {loading ? "⏳" : "💾"}
                        </button>
                        <button 
                          className="btn-cancel" 
                          onClick={() => setEditingId(null)}
                          disabled={loading}
                        >
                          ❌
                        </button>
                      </div>
                    ) : (
                      <div className="action-buttons">
                        <button className="btn-edit" onClick={() => handleEdit(chapter)}>
                          ✏️
                        </button>
                        <button 
                          className="btn-delete" 
                          onClick={() => handleDelete(chapter.id)}
                          disabled={loading}
                          style={{ opacity: loading ? 0.6 : 1 }}
                        >
                          {loading ? "⏳" : "🗑️"}
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

export default ChapterAdmin;