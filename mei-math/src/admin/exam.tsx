import React, { useState, useEffect } from "react";
import "../css/admin-css/exam.css";
import { Link } from "react-router-dom";
import { fetchAllExams, createExam, updateExamById, deleteExamById } from "../api/examAPI";
import { fetchAllChapters } from "../api/chapterAPI";

interface Exam {
  id: number;
  title: string;
  grade: number;
  durationMinutes: number;
  createdAt: string;
  chapterId: number;
  examQuestions?: any[];
}

interface Chapter {
  chapter_id: number;
  title: string;
  grade: number;
  volume: number;
}

const ExamAdmin: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Exam>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newExam, setNewExam] = useState<Partial<Exam>>({});
  const [activeTab, setActiveTab] = useState<'exams' | 'results' | 'questions'>('exams');
  const [filterGrade, setFilterGrade] = useState("all");
  const [filterChapter, setFilterChapter] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const examsRes = await fetchAllExams();
        setExams(examsRes.data?.exams || examsRes.exams || []);
      } catch (err) {
        setExams([]);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const chapRes = await fetchAllChapters();
        setChapters(chapRes.data?.chapters || chapRes.chapters || []);
      } catch (err) {
        setChapters([]);
      }
    };
    fetchChapters();
  }, []);

  // Lọc exams theo lớp và chương
  const filteredExams = exams.filter(exam => {
    if (filterGrade !== "all" && exam.grade !== Number(filterGrade)) return false;
    if (filterChapter !== "all" && exam.chapterId !== Number(filterChapter)) return false;
    return true;
  });

  // Lọc chương cho form thêm mới theo lớp đã chọn
  const filteredChaptersForAdd = chapters.filter(
    ch => newExam.grade ? ch.grade === Number(newExam.grade) : true
  );

  // Lọc chương cho form edit theo lớp đã chọn
  const filteredChaptersForEdit = chapters.filter(
    ch => editData.grade ? ch.grade === Number(editData.grade) : true
  );

  // Đếm số câu hỏi trong bài kiểm tra
  const getQuestionCount = (exam: Exam) => exam.examQuestions?.length || 0;

  // Lấy tên chương theo ID
  const getChapterTitle = (chapterId: number) => {
    const chapter = chapters.find(c => c.chapter_id === chapterId || c.id === chapterId);
    return chapter ? `${chapter.title} (Lớp ${chapter.grade})` : `Chương ${chapterId}`;
  };

  // Format ngày giờ
  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return "Chưa hoàn thành";
    return new Date(dateStr).toLocaleString('vi-VN');
  };

  // Thêm bài kiểm tra mới (API)
  const handleAdd = async () => {
    if (
      !newExam.title ||
      !newExam.grade ||
      !newExam.chapterId ||
      !newExam.durationMinutes ||
      Number(newExam.durationMinutes) <= 0 ||
      Number(newExam.chapterId) <= 0 ||
      Number(newExam.grade) <= 0
      // BỎ kiểm tra số câu hỏi ở đây!
    ) {
      alert("Vui lòng nhập đầy đủ thông tin bắt buộc!");
      return;
    }
    try {
      const res = await createExam({
        title: newExam.title,
        grade: Number(newExam.grade),
        chapterId: Number(newExam.chapterId),
        durationMinutes: Number(newExam.durationMinutes),
      });
      setExams([...exams, res.data || res.exam || res]);
      setNewExam({});
      setShowAddForm(false);
    } catch (err) {
      alert("Lỗi khi tạo bài kiểm tra!");
    }
  };

  // Xóa bài kiểm tra (API)
  const handleDelete = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bài kiểm tra này?")) {
      try {
        await deleteExamById(id);
        setExams(exams.filter(e => e.id !== id));
      } catch (err) {
        alert("Không thể xóa bài kiểm tra này!");
      }
    }
  };

  // Bắt đầu chỉnh sửa
  const handleEdit = (exam: Exam) => {
    setEditingId(exam.id);
    setEditData({ ...exam });
  };

  // Lưu chỉnh sửa (API)
  const handleSave = async () => {
    if (
      !editData.title ||
      !editData.grade ||
      !editData.chapterId ||
      !editData.durationMinutes ||
      Number(editData.durationMinutes) <= 0 ||
      Number(editData.chapterId) <= 0 ||
      Number(editData.grade) <= 0
    ) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }
    try {
      await updateExamById(editingId!, {
        title: editData.title,
        grade: Number(editData.grade),
        chapterId: Number(editData.chapterId),
        durationMinutes: Number(editData.durationMinutes),
      });
      setExams(exams.map(e =>
        e.id === editingId
          ? { ...e, ...editData }
          : e
      ));
      setEditingId(null);
      setEditData({});
    } catch (err) {
      alert("Lỗi khi cập nhật bài kiểm tra!");
    }
  };

  // Hủy chỉnh sửa
  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
    setShowAddForm(false);
    setNewExam({});
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

              <li>
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
              <li className="active">📋 Quản lý bài kiểm tra</li>
                         <li>
                              <Link to="/admin/answers" style={{ textDecoration: "none", color: "inherit" }}>
                                📝 Quản lý đáp án
                              </Link>
                            </li>
            </ul>
          </div>
          
          <div className="nav-section">
            <h4>QUẢN LÝ NGƯỜI DÙNG</h4>
            <ul>
              <li>
                              <Link to="/admin/users" style={{ textDecoration: "none", color: "inherit" }}>
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
        <div className="exam-header">
          <div className="exam-title">
            <h1>Bài kiểm tra</h1>
            <p>{filteredExams.length} bài kiểm tra</p>
          </div>
          <button 
            className="btn-add"
            onClick={() => setShowAddForm(true)}
          >
            + Thêm mới
          </button>
        </div>

        {/* Thanh lọc */}
        <div className="exam-filters">
          <div className="filter-group">
            <label>Lớp:</label>
            <select value={filterGrade} onChange={e => setFilterGrade(e.target.value)}>
              <option value="all">Tất cả</option>
              {[1,2,3,4,5].map(g => (
                <option key={g} value={g}>Lớp {g}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Chương:</label>
            <select value={filterChapter} onChange={e => setFilterChapter(e.target.value)}>
              <option value="all">Tất cả</option>
              {chapters
                .filter(ch => filterGrade === "all" || ch.grade === Number(filterGrade))
                .map(ch => (
                  <option key={ch.chapter_id} value={ch.chapter_id}>{ch.title}</option>
                ))}
            </select>
          </div>
        </div>

        {/* Tabs */}
        <div className="exam-tabs">
          <button 
            className={`tab-btn ${activeTab === 'exams' ? 'active' : ''}`}
            onClick={() => setActiveTab('exams')}
          >
            📋 Danh sách bài kiểm tra
          </button>
          <button 
            className={`tab-btn ${activeTab === 'results' ? 'active' : ''}`}
            onClick={() => setActiveTab('results')}
          >
            📊 Kết quả thi
          </button>
          <button 
            className={`tab-btn ${activeTab === 'questions' ? 'active' : ''}`}
            onClick={() => setActiveTab('questions')}
          >
            ❓ Câu hỏi trong đề
          </button>
        </div>

        {/* Exam List Tab */}
        {activeTab === 'exams' && (
          <div className="exam-table-container">
            <table className="exam-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Tiêu đề </th>
                  <th>Lớp </th>
                  <th>Thời gian (phút) </th>
                  <th>Chương </th>
                  <th>Số câu hỏi </th>
                  <th>Ngày tạo </th>
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
                        value={newExam.title || ""}
                        onChange={(e) => setNewExam({...newExam, title: e.target.value})}
                        placeholder="Nhập tiêu đề bài kiểm tra"
                        className="input-field"
                      />
                    </td>
                    <td>
                      <select
                        value={newExam.grade || ""}
                        onChange={(e) => setNewExam({...newExam, grade: Number(e.target.value), chapterId: ""})}
                        className="select-field"
                      >
                        <option value="">Chọn lớp</option>
                        {[1,2,3,4,5].map(g => (
                          <option key={g} value={g}>Lớp {g}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="number"
                        value={newExam.durationMinutes || ""}
                        onChange={(e) => setNewExam({...newExam, durationMinutes: Number(e.target.value)})}
                        placeholder="20"
                        className="input-field"
                        min="1"
                        max="120"
                      />
                    </td>
                    <td>
                      <select
                        value={newExam.chapterId ?? ""}
                        onChange={e => setNewExam({ ...newExam, chapterId: e.target.value ? Number(e.target.value) : undefined })}
                        className="select-field"
                      >
                        <option value="">Chọn chương</option>
                        {filteredChaptersForAdd.map(chapter => (
                          <option key={chapter.chapter_id} value={chapter.chapter_id}>
                            {chapter.title}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="number"
                        value={newExam.numQuestions || ""}
                        onChange={e => setNewExam({ ...newExam, numQuestions: Number(e.target.value) })}
                        min={1}
                        max={100}
                        placeholder="Số câu hỏi"
                        className="input-field"
                      />
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

                {/* Danh sách bài kiểm tra từ API */}
                {filteredExams.map((exam, index) => (
                  <tr key={exam.id}>
                    <td>{index + 1}</td>
                    <td>{exam.title}</td>
                    <td>Lớp {exam.grade}</td>
                    <td>{exam.durationMinutes} phút</td>
                    <td>{getChapterTitle(exam.chapterId)}</td>
                    <td>{getQuestionCount(exam)} câu</td>
                    <td>{formatDateTime(exam.createdAt)}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-edit" onClick={() => handleEdit(exam)}>
                          ✏️
                        </button>
                        <button className="btn-delete" onClick={() => handleDelete(exam.id)}>
                          🗑️
                        </button>
                        <button className="btn-view" title="Xem chi tiết">
                          👁️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Results Tab */}
        {activeTab === 'results' && (
          <div className="exam-table-container">
            <table className="exam-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Bài kiểm tra ↑</th>
                  <th>Học sinh ↑</th>
                  <th>Điểm số ↑</th>
                  <th>Bắt đầu ↑</th>
                  <th>Hoàn thành ↑</th>
                  <th>Trạng thái ↑</th>
                  <th>Chức năng</th>
                </tr>
              </thead>
              <tbody>
                {examResults.map((result, index) => {
                  const exam = exams.find(e => e.id === result.exam_id);
                  return (
                    <tr key={result.result_id}>
                      <td>{index + 1}</td>
                      <td>
                        <div className="exam-title-cell">
                          {exam?.title || `Exam ${result.exam_id}`}
                        </div>
                      </td>
                      <td>
                        <span className="user-badge">User {result.user_id}</span>
                      </td>
                      <td>
                        <span className="score-badge">{result.score}/10</span>
                      </td>
                      <td>
                        <div className="date-cell">
                          {formatDateTime(result.started_at)}
                        </div>
                      </td>
                      <td>
                        <div className="date-cell">
                          {formatDateTime(result.finished_at || "")}
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${result.is_active ? 'active' : 'inactive'}`}>
                          {result.is_active ? 'Đang thi' : 'Hoàn thành'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn-view" title="Xem chi tiết">
                            👁️
                          </button>
                          <button className="btn-delete" title="Xóa kết quả">
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Questions Tab */}
        {activeTab === 'questions' && (
          <div className="exam-table-container">
            <table className="exam-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Bài kiểm tra </th>
                  <th>ID Câu hỏi </th>
                  <th>Thứ tự </th>
                  <th>Chức năng</th>
                </tr>
              </thead>
              <tbody>
                {examQuestions.map((eq, index) => {
                  const exam = exams.find(e => e.id === eq.exam_id);
                  return (
                    <tr key={eq.exam_question_id}>
                      <td>{index + 1}</td>
                      <td>
                        <div className="exam-title-cell">
                          {exam?.title || `Exam ${eq.exam_id}`}
                        </div>
                      </td>
                      <td>
                        <span className="question-id-badge">{eq.question_id}</span>
                      </td>
                      <td>
                        <span className="order-badge">Câu {index + 1}</span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn-edit" title="Sửa">
                            ✏️
                          </button>
                          <button className="btn-delete" title="Xóa khỏi đề">
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamAdmin;