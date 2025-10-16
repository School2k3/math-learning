import React, { useState, useEffect } from "react";
import "../css/admin-css/lesson.css";
import { Link } from "react-router-dom";

interface Lesson {
  lesson_id: number;
  chapter_id: number;
  title: string;
  video_url?: string;
  image_url?: string;
}

interface Chapter {
  chapter_id: number;
  title: string;
  grade: number;
  volume: number;
}

const initialLessons: Lesson[] = [
  { lesson_id: 1, chapter_id: 1, title: "Các số 0, 1, 2, 3, 4, 5", video_url: "", image_url: "https://res.cloudinary.com/dqbluifmd/image/u..." },
  { lesson_id: 2, chapter_id: 1, title: "Các số 6, 7, 8, 9, 10", video_url: "", image_url: "https://res.cloudinary.com/dqbluifmd/image/u..." },
  { lesson_id: 3, chapter_id: 1, title: "Nhiều hơn, ít hơn, bằng nhau", video_url: "", image_url: "https://res.cloudinary.com/dqbluifmd/image/u..." },
  { lesson_id: 4, chapter_id: 1, title: "So sánh số", video_url: "", image_url: "https://res.cloudinary.com/dqbluifmd/image/u..." },
  { lesson_id: 5, chapter_id: 1, title: "Máy và máy", video_url: "", image_url: "https://res.cloudinary.com/dqbluifmd/image/u..." },
  { lesson_id: 6, chapter_id: 2, title: "Hình vuông, hình tròn, hình tam giác, hình chữ nhật", video_url: "", image_url: "" },
  { lesson_id: 7, chapter_id: 2, title: "Thực hành lắp ghép, xếp hình", video_url: "", image_url: "" },
  { lesson_id: 8, chapter_id: 3, title: "Phép cộng trong phạm vi 10", video_url: "", image_url: "" },
  { lesson_id: 9, chapter_id: 3, title: "Phép trừ trong phạm vi 10", video_url: "", image_url: "" },
  { lesson_id: 10, chapter_id: 3, title: "Bảng cộng, bảng trừ trong phạm vi 10", video_url: "", image_url: "" },
  { lesson_id: 27, chapter_id: 9, title: "Bảng cộng (qua 10)", video_url: "https://res.cloudinary.com/dv3gofhee/video/up...", image_url: "https://res.cloudinary.com/dqbluifmd/image/u..." },
  { lesson_id: 30, chapter_id: 9, title: "Bảng trừ (qua 10)", video_url: "https://res.cloudinary.com/dv3gofhee/video/up...", image_url: "https://res.cloudinary.com/dqbluifmd/image/u..." },
];

const initialChapters: Chapter[] = [
  { chapter_id: 1, title: "Các số từ 0 đến 10", grade: 1, volume: 1 },
  { chapter_id: 2, title: "Làm quen với một số hình phẳng", grade: 1, volume: 1 },
  { chapter_id: 3, title: "Phép cộng, phép trừ trong phạm vi 10", grade: 1, volume: 1 },
  { chapter_id: 4, title: "Làm quen với một số hình khối", grade: 1, volume: 1 },
  { chapter_id: 5, title: "Các số đến 100", grade: 1, volume: 2 },
  { chapter_id: 9, title: "Phép cộng, phép trừ trong phạm vi 20", grade: 2, volume: 1 },
];

const LessonAdmin: React.FC = () => {
  const [lessons, setLessons] = useState<Lesson[]>(initialLessons);
  const [chapters] = useState<Chapter[]>(initialChapters);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Lesson>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLesson, setNewLesson] = useState<Partial<Lesson>>({});

  // Lấy tên chương theo ID
  const getChapterTitle = (chapterId: number) => {
    const chapter = chapters.find(c => c.chapter_id === chapterId);
    return chapter ? `${chapter.title} (Lớp ${chapter.grade} - HK${chapter.volume})` : `Chương ${chapterId}`;
  };

  // Thêm bài học mới
  const handleAdd = () => {
    if (!newLesson.title || !newLesson.chapter_id) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }
    
    const newId = Math.max(...lessons.map(l => l.lesson_id)) + 1;
    setLessons([...lessons, {
      lesson_id: newId,
      chapter_id: Number(newLesson.chapter_id),
      title: newLesson.title,
      video_url: newLesson.video_url || "",
      image_url: newLesson.image_url || ""
    }]);
    
    setNewLesson({});
    setShowAddForm(false);
  };

  // Xóa bài học
  const handleDelete = (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bài học này?")) {
      setLessons(lessons.filter(l => l.lesson_id !== id));
    }
  };

  // Bắt đầu chỉnh sửa
  const handleEdit = (lesson: Lesson) => {
    setEditingId(lesson.lesson_id);
    setEditData({ ...lesson });
  };

  // Lưu chỉnh sửa
  const handleSave = () => {
    if (!editData.title || !editData.chapter_id) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    setLessons(lessons.map(l => 
      l.lesson_id === editingId 
        ? { ...l, ...editData } 
        : l
    ));
    
    setEditingId(null);
    setEditData({});
  };

  // Hủy chỉnh sửa
  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
    setShowAddForm(false);
    setNewLesson({});
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
                          <li>
                            <Link to="/admin/chapters" style={{ textDecoration: "none", color: "inherit" }}>
                              📖 Quản lý chương
                            </Link>
                          </li>
                          <li className="active">
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
        <div className="lesson-header">
          <div className="lesson-title">
            <h1>Bài học</h1>
            <p>{lessons.length} bài học</p>
          </div>
          <button 
            className="btn-add"
            onClick={() => setShowAddForm(true)}
          >
            + Thêm mới
          </button>
        </div>

        <div className="lesson-table-container">
          <table className="lesson-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Tên bài học ↑</th>
                <th>Chương ↑</th>
                <th>Video ↑</th>
                <th>Hình ảnh ↑</th>
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
                      value={newLesson.title || ""}
                      onChange={(e) => setNewLesson({...newLesson, title: e.target.value})}
                      placeholder="Nhập tên bài học"
                      className="input-field"
                    />
                  </td>
                  <td>
                    <select
                      value={newLesson.chapter_id || ""}
                      onChange={(e) => setNewLesson({...newLesson, chapter_id: Number(e.target.value)})}
                      className="select-field"
                    >
                      <option value="">Chọn chương</option>
                      {chapters.map(chapter => (
                        <option key={chapter.chapter_id} value={chapter.chapter_id}>
                          {getChapterTitle(chapter.chapter_id)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      type="url"
                      value={newLesson.video_url || ""}
                      onChange={(e) => setNewLesson({...newLesson, video_url: e.target.value})}
                      placeholder="URL video (tùy chọn)"
                      className="input-field"
                    />
                  </td>
                  <td>
                    <input
                      type="url"
                      value={newLesson.image_url || ""}
                      onChange={(e) => setNewLesson({...newLesson, image_url: e.target.value})}
                      placeholder="URL hình ảnh (tùy chọn)"
                      className="input-field"
                    />
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

              {/* Danh sách bài học */}
              {lessons.map((lesson, index) => (
                <tr key={lesson.lesson_id}>
                  <td>{index + 1}</td>
                  <td>
                    {editingId === lesson.lesson_id ? (
                      <input
                        type="text"
                        value={editData.title || ""}
                        onChange={(e) => setEditData({...editData, title: e.target.value})}
                        className="input-field"
                      />
                    ) : (
                      <div className="lesson-title-cell">
                        {lesson.title}
                      </div>
                    )}
                  </td>
                  <td>
                    {editingId === lesson.lesson_id ? (
                      <select
                        value={editData.chapter_id || ""}
                        onChange={(e) => setEditData({...editData, chapter_id: Number(e.target.value)})}
                        className="select-field"
                      >
                        {chapters.map(chapter => (
                          <option key={chapter.chapter_id} value={chapter.chapter_id}>
                            {getChapterTitle(chapter.chapter_id)}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="chapter-cell">
                        {getChapterTitle(lesson.chapter_id)}
                      </div>
                    )}
                  </td>
                  <td>
                    {editingId === lesson.lesson_id ? (
                      <input
                        type="url"
                        value={editData.video_url || ""}
                        onChange={(e) => setEditData({...editData, video_url: e.target.value})}
                        className="input-field"
                        placeholder="URL video"
                      />
                    ) : (
                      <div className="media-cell">
                        {lesson.video_url ? (
                          <span className="media-available">✅ Có video</span>
                        ) : (
                          <span className="media-null">❌ Chưa có</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td>
                    {editingId === lesson.lesson_id ? (
                      <input
                        type="url"
                        value={editData.image_url || ""}
                        onChange={(e) => setEditData({...editData, image_url: e.target.value})}
                        className="input-field"
                        placeholder="URL hình ảnh"
                      />
                    ) : (
                      <div className="media-cell">
                        {lesson.image_url ? (
                          <span className="media-available">✅ Có hình</span>
                        ) : (
                          <span className="media-null">❌ Chưa có</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td>
                    {editingId === lesson.lesson_id ? (
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
                        <button className="btn-edit" onClick={() => handleEdit(lesson)}>
                          ✏️
                        </button>
                        <button className="btn-delete" onClick={() => handleDelete(lesson.lesson_id)}>
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

export default LessonAdmin;