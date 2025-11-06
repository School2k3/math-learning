import React, { useState, useEffect } from "react";
import "../css/admin-css/lesson.css";
import { Link } from "react-router-dom";
import { fetchAllChapters } from "../api/chapterAPI";
import {
  createLesson,
  fetchAllLessons,
  fetchLessonsByChapter,
  updateLesson,
  deleteLesson,
} from "../api/lessonAPI";

interface Lesson {
  id: number;
  chapterId: number;
  title: string;
  videoUrl?: string;
  imageUrl?: string;
}

interface Chapter {
  id: number;
  title: string;
  grade: number;
  volume: number;
}

const LessonAdmin: React.FC = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Filter states
  const [filterChapter, setFilterChapter] = useState<string>("all");
  const [filterGrade, setFilterGrade] = useState<string>("all");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Lesson>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLesson, setNewLesson] = useState<Partial<Lesson>>({});

  // Load data từ API
  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      // Luôn luôn load chapters
      const chaptersResponse = await fetchAllChapters();
      setChapters(
        chaptersResponse.data?.chapters || chaptersResponse.chapters || []
      );
      // Load lessons dựa trên filter
      let lessonsResponse;
      if (filterChapter === "all") {
        lessonsResponse = await fetchAllLessons();
      } else {
        lessonsResponse = await fetchLessonsByChapter(Number(filterChapter));
      }
      let lessonsList =
        lessonsResponse.data?.lessons || lessonsResponse.lessons || [];
      // Nếu filterGrade khác "all", chỉ lấy các bài học thuộc chương có grade đúng
      if (filterGrade !== "all") {
        const gradeNum = Number(filterGrade);
        const chapterIds = chaptersResponse.chapters
          .filter((ch: Chapter) => ch.grade === gradeNum)
          .map((ch: Chapter) => ch.id);
        lessonsList = lessonsList.filter((lesson: Lesson) =>
          chapterIds.includes(lesson.chapterId)
        );
      }
      setLessons(lessonsList);
    } catch (error) {
      setError("Không thể tải dữ liệu: " + (error as Error).message);
      setLessons([]);
      setChapters([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filterChapter, filterGrade]);

  // Không cần filter trên client nữa vì đã filter qua API
  const filteredLessons = lessons;

  // Lấy tên chương theo ID
  const getChapterTitle = (chapterId: number) => {
    const chapter = chapters.find((c) => c.id === chapterId);
    return chapter
      ? `${chapter.title} (Lớp ${chapter.grade} - HK${chapter.volume})`
      : `Chương ${chapterId}`;
  };

  // Thêm bài học mới (tạm thời vô hiệu hóa - chỉ có API GET)
  const handleAdd = async () => {
    if (!newLesson.title || !newLesson.chapterId) {
      alert("Vui lòng nhập đầy đủ tên bài học và chọn chương!");
      return;
    }
    setLoading(true);
    try {
      const res = await createLesson({
        chapterId: Number(newLesson.chapterId),
        title: newLesson.title,
        videoUrl: newLesson.videoUrl,
        imageUrl: newLesson.imageUrl,
      });
      if (res.success) {
        alert("Thêm bài học thành công!");
        setShowAddForm(false);
        setNewLesson({});
        // Reload lại danh sách bài học
        loadData();
      } else {
        alert("Thêm bài học thất bại: " + res.message);
      }
    } catch (error) {
      alert("Lỗi khi thêm bài học: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Xóa bài học (tạm thời vô hiệu hóa - chỉ có API GET)
  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bài học này?")) return;
    setLoading(true);
    try {
      const res = await deleteLesson(id);
      if (res.success) {
        alert("Xóa bài học thành công!");
        loadData();
      } else {
        alert("Xóa bài học thất bại: " + res.message);
      }
    } catch (error) {
      alert("Lỗi khi xóa bài học: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Bắt đầu chỉnh sửa
  const handleEdit = (lesson: Lesson) => {
    setEditingId(lesson.id);
    setEditData({ ...lesson });
  };

  // Lưu chỉnh sửa (tạm thời vô hiệu hóa - chỉ có API GET)
  const handleSave = async () => {
    if (!editingId || !editData.title || !editData.chapterId) {
      alert("Vui lòng nhập đầy đủ tên bài học và chọn chương!");
      return;
    }
    setLoading(true);
    try {
      const res = await updateLesson(editingId, {
        chapterId: Number(editData.chapterId),
        title: editData.title,
        videoUrl: editData.videoUrl,
        imageUrl: editData.imageUrl,
      });
      if (res.success) {
        alert("Cập nhật bài học thành công!");
        setEditingId(null);
        setEditData({});
        loadData();
      } else {
        alert("Cập nhật bài học thất bại: " + res.message);
      }
    } catch (error) {
      alert("Lỗi khi cập nhật bài học: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
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
              <li className="active">
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
              <li>
                <Link
                  to="/admin/users"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  👥 Học sinh
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
            </ul>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="admin-main">
        <div className="lesson-header">
          <div className="lesson-title">
            <h1>Bài học</h1>
            <p>{filteredLessons.length} bài học</p>
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
          }}
        >
          {/* Lọc theo lớp trước */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "4px",
                fontWeight: "500",
              }}
            >
              Lọc theo lớp:
            </label>
            <select
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value)}
              style={{
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ddd",
                minWidth: "120px",
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
          {/* Lọc theo chương sau, chỉ hiện chương thuộc lớp đã chọn */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "4px",
                fontWeight: "500",
              }}
            >
              Lọc theo chương:
            </label>
            <select
              value={filterChapter}
              onChange={(e) => setFilterChapter(e.target.value)}
              style={{
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ddd",
                minWidth: "200px",
              }}
            >
              <option value="all">Tất cả chương</option>
              {chapters
                .filter(
                  (chapter) =>
                    filterGrade === "all" ||
                    chapter.grade === Number(filterGrade)
                )
                .map((chapter) => (
                  <option key={chapter.id} value={chapter.id}>
                    {getChapterTitle(chapter.id)}
                  </option>
                ))}
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

        <div className="lesson-table-container">
          <table className="lesson-table">
            <thead>
              <tr>
                <th># </th>
                <th>Tên bài học</th>
                <th>Chương</th>
                <th>Video </th>
                <th>Hình ảnh </th>
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
                      onChange={(e) =>
                        setNewLesson({ ...newLesson, title: e.target.value })
                      }
                      placeholder="Nhập tên bài học"
                      className="input-field"
                    />
                  </td>
                  <td>
                    <select
                      value={newLesson.chapterId || ""}
                      onChange={(e) =>
                        setNewLesson({
                          ...newLesson,
                          chapterId: Number(e.target.value),
                        })
                      }
                      className="select-field"
                    >
                      <option value="">Chọn chương</option>
                      {chapters
                        .filter(
                          (chapter) =>
                            filterGrade === "all" ||
                            chapter.grade === Number(filterGrade)
                        )
                        .map((chapter) => (
                          <option key={chapter.id} value={chapter.id}>
                            {getChapterTitle(chapter.id)}
                          </option>
                        ))}
                    </select>
                  </td>
                  <td>
                    <input
                      type="text"
                      value={newLesson.videoUrl || ""}
                      onChange={(e) =>
                        setNewLesson({ ...newLesson, videoUrl: e.target.value })
                      }
                      placeholder="URL video"
                      className="input-field"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={newLesson.imageUrl || ""}
                      onChange={(e) =>
                        setNewLesson({ ...newLesson, imageUrl: e.target.value })
                      }
                      placeholder="URL hình ảnh"
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
              {filteredLessons.map((lesson, index) => (
                <tr key={lesson.id}>
                  <td>{index + 1}</td>
                  <td>
                    {editingId === lesson.id ? (
                      <input
                        type="text"
                        value={editData.title || ""}
                        onChange={(e) =>
                          setEditData({ ...editData, title: e.target.value })
                        }
                        className="input-field"
                      />
                    ) : (
                      <div className="lesson-title-cell">{lesson.title}</div>
                    )}
                  </td>
                  <td>
                    {editingId === lesson.id ? (
                      <select
                        value={editData.chapterId || ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            chapterId: Number(e.target.value),
                          })
                        }
                        className="select-field"
                      >
                        {chapters.map((chapter) => (
                          <option key={chapter.id} value={chapter.id}>
                            {getChapterTitle(chapter.id)}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="chapter-cell">
                        {getChapterTitle(lesson.chapterId)}
                      </div>
                    )}
                  </td>
                  <td>
                    {editingId === lesson.id ? (
                      <input
                        type="url"
                        value={editData.videoUrl || ""}
                        onChange={(e) =>
                          setEditData({ ...editData, videoUrl: e.target.value })
                        }
                        className="input-field"
                        placeholder="URL video"
                      />
                    ) : (
                      <div className="media-cell">
                        {lesson.videoUrl ? (
                          <span className="media-available">✅ Có video</span>
                        ) : (
                          <span className="media-null">❌ Chưa có</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td>
                    {editingId === lesson.id ? (
                      <input
                        type="url"
                        value={editData.imageUrl || ""}
                        onChange={(e) =>
                          setEditData({ ...editData, imageUrl: e.target.value })
                        }
                        className="input-field"
                        placeholder="URL hình ảnh"
                      />
                    ) : (
                      <div className="media-cell">
                        {lesson.imageUrl ? (
                          <span className="media-available">✅ Có hình</span>
                        ) : (
                          <span className="media-null">❌ Chưa có</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td>
                    {editingId === lesson.id ? (
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
                        <button
                          className="btn-edit"
                          onClick={() => handleEdit(lesson)}
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(lesson.id)}
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

export default LessonAdmin;
