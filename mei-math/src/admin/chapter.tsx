import React, { useState, useEffect } from "react";
import "../css/admin-css/chapter.css";
import { Link } from "react-router-dom";
interface Chapter {
  chapter_id: number;
  grade: number;
  volume: number;
  title: string;
}

const initialChapters: Chapter[] = [
  { chapter_id: 1, grade: 1, volume: 1, title: "Các số từ 0 đến 10" },
  { chapter_id: 2, grade: 1, volume: 1, title: "Làm quen với một số hình phẳng" },
  { chapter_id: 3, grade: 1, volume: 1, title: "Phép cộng, phép trừ trong phạm vi 10" },
  { chapter_id: 4, grade: 1, volume: 1, title: "Làm quen với một số hình khối" },
  { chapter_id: 5, grade: 1, volume: 2, title: "Các số đến 100" },
  { chapter_id: 6, grade: 1, volume: 2, title: "Đồ dài và đo độ dài" },
  { chapter_id: 7, grade: 1, volume: 2, title: "Phép cộng, phép trừ (không nhớ) trong phạm vi 100" },
  { chapter_id: 8, grade: 1, volume: 2, title: "Thời gian. Giờ và lịch" },
  { chapter_id: 9, grade: 2, volume: 1, title: "Phép cộng, phép trừ trong phạm vi 20" },
  { chapter_id: 10, grade: 2, volume: 1, title: "Làm quen với khối lượng, dung tích" },
  { chapter_id: 11, grade: 2, volume: 1, title: "Phép cộng, phép trừ (có nhớ) trong phạm vi 100" },
  { chapter_id: 12, grade: 2, volume: 1, title: "Làm quen với hình phẳng" },
  { chapter_id: 13, grade: 2, volume: 1, title: "Ngày – giờ, giờ – phút, ngày – tháng" },
];

const ChapterAdmin: React.FC = () => {
  const [chapters, setChapters] = useState<Chapter[]>(initialChapters);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Chapter>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newChapter, setNewChapter] = useState<Partial<Chapter>>({});

  // Thêm chương mới
  const handleAdd = () => {
    if (!newChapter.title || !newChapter.grade || !newChapter.volume) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }
    
    const newId = Math.max(...chapters.map(c => c.chapter_id)) + 1;
    setChapters([...chapters, {
      chapter_id: newId,
      grade: Number(newChapter.grade),
      volume: Number(newChapter.volume),
      title: newChapter.title
    }]);
    
    setNewChapter({});
    setShowAddForm(false);
  };

  // Xóa chương
  const handleDelete = (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa chương này?")) {
      setChapters(chapters.filter(c => c.chapter_id !== id));
    }
  };

  // Bắt đầu chỉnh sửa
  const handleEdit = (chapter: Chapter) => {
    setEditingId(chapter.chapter_id);
    setEditData({ ...chapter });
  };

  // Lưu chỉnh sửa
  const handleSave = () => {
    if (!editData.title || !editData.grade || !editData.volume) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    setChapters(chapters.map(c => 
      c.chapter_id === editingId 
        ? { ...c, ...editData } 
        : c
    ));
    
    setEditingId(null);
    setEditData({});
  };

  // Hủy chỉnh sửa
  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
    setShowAddForm(false);
    setNewChapter({});
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
                                      <li>📚 Quản lý lớp học</li>
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
              <li>👥 Học sinh</li>
              <li>👨‍🏫 Giáo viên</li>
              <li>📈 Báo cáo học tập</li>
            </ul>
          </div>
          
          <div className="nav-section">
            <h4>HỆ THỐNG</h4>
            <ul>
              <li>⚙️ Cài đặt</li>
              <li>🔐 Bảo mật</li>
              <li>📊 Thống kê</li>
            </ul>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="admin-main">
        <div className="chapter-header">
          <div className="chapter-title">
            <h1>Chương học</h1>
            <p>{chapters.length} chương</p>
          </div>
          <button 
            className="btn-add"
            onClick={() => setShowAddForm(true)}
          >
            + Thêm mới
          </button>
        </div>

        <div className="chapter-table-container">
          <table className="chapter-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Tên chương ↑</th>
                <th>Lớp ↑</th>
                <th>Học kỳ ↑</th>
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

              {/* Danh sách chương */}
              {chapters.map((chapter, index) => (
                <tr key={chapter.chapter_id}>
                  <td>{index + 1}</td>
                  <td>
                    {editingId === chapter.chapter_id ? (
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
                    {editingId === chapter.chapter_id ? (
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
                    {editingId === chapter.chapter_id ? (
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
                    {editingId === chapter.chapter_id ? (
                      <div className="action-buttons">
                        <button className="btn-save" onClick={handleSave}>
                          💾
                        </button>
                        <button className="btn-cancel" onClick={handleCancel}>
                          ❌
                        </button>
                      </div>
                    ) : (
                      <div className="action-buttons">
                        <button className="btn-edit" onClick={() => handleEdit(chapter)}>
                          ✏️
                        </button>
                        <button className="btn-delete" onClick={() => handleDelete(chapter.chapter_id)}>
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

export default ChapterAdmin;