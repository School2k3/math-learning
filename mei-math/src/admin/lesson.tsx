import React, { useState, useEffect } from "react";
import "../css/admin-css/lesson.css";
import { Link, useNavigate } from "react-router-dom";
import { fetchAllChapters } from "../api/chapterAPI";
import {
  createLesson,
  fetchAllLessons,
  fetchLessonsByChapter,
  updateLesson,
  deleteLesson,
} from "../api/lessonAPI";
import { uploadImageFile, uploadVideoFile } from "../api/uploadAPI";

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
  const navigate = useNavigate();

  // Filter states
  const [filterChapter, setFilterChapter] = useState<string>("all");
  const [filterGrade, setFilterGrade] = useState<string>("all");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Lesson>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLesson, setNewLesson] = useState<Partial<Lesson>>({});

  // Upload states
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingEditImage, setUploadingEditImage] = useState(false);
  const [uploadingEditVideo, setUploadingEditVideo] = useState(false);

  // Upload handlers for add mode
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const url = await uploadImageFile(file);
      setNewLesson({ ...newLesson, imageUrl: url });
      alert('Upload ảnh thành công!');
    } catch (error) {
      alert('Upload ảnh thất bại!');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingVideo(true);
      const url = await uploadVideoFile(file);
      setNewLesson({ ...newLesson, videoUrl: url });
      alert('Upload video thành công!');
    } catch (error) {
      alert('Upload video thất bại!');
    } finally {
      setUploadingVideo(false);
    }
  };

  // Upload handlers for edit mode
  const handleEditImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingEditImage(true);
      const url = await uploadImageFile(file);
      setEditData({ ...editData, imageUrl: url });
      alert('Upload ảnh thành công!');
    } catch (error) {
      alert('Upload ảnh thất bại!');
    } finally {
      setUploadingEditImage(false);
    }
  };

  const handleEditVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingEditVideo(true);
      const url = await uploadVideoFile(file);
      setEditData({ ...editData, videoUrl: url });
      alert('Upload video thành công!');
    } catch (error) {
      alert('Upload video thất bại!');
    } finally {
      setUploadingEditVideo(false);
    }
  };

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
          <div className="header-actions">
            <button 
              className="btn-manage" 
              onClick={() => navigate("/admin/questions")}
              style={{
                marginRight: "10px",
                background: "#FF9800",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              ❓ Quản lý câu hỏi
            </button>
            <button 
              className="btn-add" 
              onClick={() => {
                // Pre-fill form với giá trị filter hiện tại
                const selectedChapter = filterChapter !== "all" ? Number(filterChapter) : undefined;
                setNewLesson({
                  chapterId: selectedChapter,
                  title: "",
                  videoUrl: "",
                  imageUrl: "",
                });
                setShowAddForm(true);
              }}
            >
              + Thêm mới bài học
            </button>
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <input
                        type="text"
                        value={newLesson.videoUrl || ""}
                        onChange={(e) =>
                          setNewLesson({ ...newLesson, videoUrl: e.target.value })
                        }
                        placeholder="URL hoặc upload video"
                        className="input-field"
                      />
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <input type="file" accept="video/*" onChange={handleVideoUpload} style={{ display: 'none' }} id="new-video-upload" />
                        <label htmlFor="new-video-upload" style={{ padding: '4px 8px', background: '#28a745', color: 'white', borderRadius: '4px', cursor: uploadingVideo ? 'not-allowed' : 'pointer', fontSize: '12px' }}>
                          {uploadingVideo ? '⏳' : '🎥 Upload'}
                        </label>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <input
                        type="text"
                        value={newLesson.imageUrl || ""}
                        onChange={(e) =>
                          setNewLesson({ ...newLesson, imageUrl: e.target.value })
                        }
                        placeholder="URL hoặc upload ảnh"
                        className="input-field"
                      />
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} id="new-image-upload" />
                        <label htmlFor="new-image-upload" style={{ padding: '4px 8px', background: '#007bff', color: 'white', borderRadius: '4px', cursor: uploadingImage ? 'not-allowed' : 'pointer', fontSize: '12px' }}>
                          {uploadingImage ? '⏳' : '📤 Upload'}
                        </label>
                        {newLesson.imageUrl && <img src={newLesson.imageUrl} alt="Preview" style={{ width: '30px', height: '30px', objectFit: 'cover', borderRadius: '4px' }} />}
                      </div>
                    </div>
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
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <input
                          type="url"
                          value={editData.videoUrl || ""}
                          onChange={(e) =>
                            setEditData({ ...editData, videoUrl: e.target.value })
                          }
                          className="input-field"
                          placeholder="URL video"
                        />
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <input
                            type="file"
                            accept="video/*,audio/*"
                            onChange={handleEditVideoUpload}
                            style={{ display: 'none' }}
                            id={`edit-lesson-video-${lesson.id}`}
                          />
                          <label
                            htmlFor={`edit-lesson-video-${lesson.id}`}
                            style={{
                              padding: '4px 8px',
                              backgroundColor: '#9c27b0',
                              color: 'white',
                              borderRadius: '4px',
                              cursor: uploadingEditVideo ? 'not-allowed' : 'pointer',
                              fontSize: '12px',
                              border: 'none',
                              opacity: uploadingEditVideo ? 0.7 : 1
                            }}
                          >
                            {uploadingEditVideo ? '⏳' : '🎥 Upload'}
                          </label>
                        </div>
                      </div>
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
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <input
                          type="url"
                          value={editData.imageUrl || ""}
                          onChange={(e) =>
                            setEditData({ ...editData, imageUrl: e.target.value })
                          }
                          className="input-field"
                          placeholder="URL hình ảnh"
                        />
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleEditImageUpload}
                            style={{ display: 'none' }}
                            id={`edit-lesson-image-${lesson.id}`}
                          />
                          <label
                            htmlFor={`edit-lesson-image-${lesson.id}`}
                            style={{
                              padding: '4px 8px',
                              backgroundColor: '#2196f3',
                              color: 'white',
                              borderRadius: '4px',
                              cursor: uploadingEditImage ? 'not-allowed' : 'pointer',
                              fontSize: '12px',
                              border: 'none',
                              opacity: uploadingEditImage ? 0.7 : 1
                            }}
                          >
                            {uploadingEditImage ? '⏳' : '📤 Upload'}
                          </label>
                          {editData.imageUrl && (
                            <img 
                              src={editData.imageUrl} 
                              alt="Preview" 
                              style={{ width: '30px', height: '30px', objectFit: 'cover', borderRadius: '4px' }}
                            />
                          )}
                        </div>
                      </div>
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
