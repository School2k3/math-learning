import React, { useState, useEffect } from "react";
import "../css/admin-css/exam.css";
import { Link } from "react-router-dom";

interface Exam {
  exam_id: number;
  title: string;
  grade: number;
  duration_minutes: number;
  created_at: string;
  chapter_id: number;
}

interface ExamQuestion {
  exam_question_id: number;
  exam_id: number;
  question_id: number;
}

interface ExamResult {
  result_id: number;
  exam_id: number;
  user_id: number;
  score: number;
  started_at: string;
  finished_at?: string;
  is_active: boolean;
}

interface ExamAnswer {
  exam_answer_id: number;
  result_id: number;
  question_id: number;
  chosen_answer_id: number;
  is_correct: boolean;
  is_flagged: boolean;
}

interface Chapter {
  chapter_id: number;
  title: string;
  grade: number;
  volume: number;
}

const initialExams: Exam[] = [
  {
    exam_id: 201,
    title: "Kiểm tra: Các số từ 0 đến 10 (Bài 1-5)",
    grade: 1,
    duration_minutes: 20,
    created_at: "2025-09-19 14:32:54.44",
    chapter_id: 1
  },
  {
    exam_id: 202,
    title: "Kiểm tra: Phép cộng, phép trừ trong phạm vi 20",
    grade: 2,
    duration_minutes: 20,
    created_at: "2025-10-03 13:43:38.693",
    chapter_id: 9
  }
];

const initialChapters: Chapter[] = [
  { chapter_id: 1, title: "Các số từ 0 đến 10", grade: 1, volume: 1 },
  { chapter_id: 9, title: "Phép cộng, phép trừ trong phạm vi 20", grade: 2, volume: 1 },
];

const initialExamQuestions: ExamQuestion[] = [
  { exam_question_id: 5001, exam_id: 201, question_id: 1201 },
  { exam_question_id: 5002, exam_id: 201, question_id: 1202 },
  { exam_question_id: 5003, exam_id: 201, question_id: 1203 },
  { exam_question_id: 5004, exam_id: 201, question_id: 1204 },
  { exam_question_id: 5005, exam_id: 201, question_id: 1205 },
];

const initialExamResults: ExamResult[] = [
  {
    result_id: 17,
    exam_id: 201,
    user_id: 4,
    score: 0,
    started_at: "2025-10-04 02:09:04.054",
    finished_at: "",
    is_active: true
  }
];

const ExamAdmin: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>(initialExams);
  const [chapters] = useState<Chapter[]>(initialChapters);
  const [examQuestions] = useState<ExamQuestion[]>(initialExamQuestions);
  const [examResults] = useState<ExamResult[]>(initialExamResults);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Exam>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newExam, setNewExam] = useState<Partial<Exam>>({});
  const [activeTab, setActiveTab] = useState<'exams' | 'results' | 'questions'>('exams');

  // Lấy tên chương theo ID
  const getChapterTitle = (chapterId: number) => {
    const chapter = chapters.find(c => c.chapter_id === chapterId);
    return chapter ? `${chapter.title} (Lớp ${chapter.grade})` : `Chương ${chapterId}`;
  };

  // Đếm số câu hỏi trong bài kiểm tra
  const getQuestionCount = (examId: number) => {
    return examQuestions.filter(eq => eq.exam_id === examId).length;
  };

  // Đếm số lượt thi
  const getResultCount = (examId: number) => {
    return examResults.filter(er => er.exam_id === examId).length;
  };

  // Format ngày giờ
  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return "Chưa hoàn thành";
    return new Date(dateStr).toLocaleString('vi-VN');
  };

  // Thêm bài kiểm tra mới
  const handleAdd = () => {
    if (!newExam.title || !newExam.grade || !newExam.duration_minutes || !newExam.chapter_id) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }
    
    const newId = Math.max(...exams.map(e => e.exam_id)) + 1;
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    setExams([...exams, {
      exam_id: newId,
      title: newExam.title,
      grade: Number(newExam.grade),
      duration_minutes: Number(newExam.duration_minutes),
      created_at: now,
      chapter_id: Number(newExam.chapter_id)
    }]);
    
    setNewExam({});
    setShowAddForm(false);
  };

  // Xóa bài kiểm tra
  const handleDelete = (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bài kiểm tra này?")) {
      setExams(exams.filter(e => e.exam_id !== id));
    }
  };

  // Bắt đầu chỉnh sửa
  const handleEdit = (exam: Exam) => {
    setEditingId(exam.exam_id);
    setEditData({ ...exam });
  };

  // Lưu chỉnh sửa
  const handleSave = () => {
    if (!editData.title || !editData.grade || !editData.duration_minutes || !editData.chapter_id) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    setExams(exams.map(e => 
      e.exam_id === editingId 
        ? { ...e, ...editData } 
        : e
    ));
    
    setEditingId(null);
    setEditData({});
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
            </ul>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="admin-main">
        <div className="exam-header">
          <div className="exam-title">
            <h1>Bài kiểm tra</h1>
            <p>{exams.length} bài kiểm tra</p>
          </div>
          <button 
            className="btn-add"
            onClick={() => setShowAddForm(true)}
          >
            + Thêm mới
          </button>
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
                  <th>Tiêu đề ↑</th>
                  <th>Lớp ↑</th>
                  <th>Thời gian (phút) ↑</th>
                  <th>Chương ↑</th>
                  <th>Số câu hỏi ↑</th>
                  <th>Lượt thi ↑</th>
                  <th>Ngày tạo ↑</th>
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
                        onChange={(e) => setNewExam({...newExam, grade: Number(e.target.value)})}
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
                      <input
                        type="number"
                        value={newExam.duration_minutes || ""}
                        onChange={(e) => setNewExam({...newExam, duration_minutes: Number(e.target.value)})}
                        placeholder="20"
                        className="input-field"
                        min="5"
                        max="120"
                      />
                    </td>
                    <td>
                      <select
                        value={newExam.chapter_id || ""}
                        onChange={(e) => setNewExam({...newExam, chapter_id: Number(e.target.value)})}
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
                    <td>0</td>
                    <td>0</td>
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

                {/* Danh sách bài kiểm tra */}
                {exams.map((exam, index) => (
                  <tr key={exam.exam_id}>
                    <td>{index + 1}</td>
                    <td>
                      {editingId === exam.exam_id ? (
                        <input
                          type="text"
                          value={editData.title || ""}
                          onChange={(e) => setEditData({...editData, title: e.target.value})}
                          className="input-field"
                        />
                      ) : (
                        <div className="exam-title-cell">
                          {exam.title}
                        </div>
                      )}
                    </td>
                    <td>
                      {editingId === exam.exam_id ? (
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
                        <span className="grade-badge">Lớp {exam.grade}</span>
                      )}
                    </td>
                    <td>
                      {editingId === exam.exam_id ? (
                        <input
                          type="number"
                          value={editData.duration_minutes || ""}
                          onChange={(e) => setEditData({...editData, duration_minutes: Number(e.target.value)})}
                          className="input-field"
                          min="5"
                          max="120"
                        />
                      ) : (
                        <span className="duration-cell">{exam.duration_minutes} phút</span>
                      )}
                    </td>
                    <td>
                      {editingId === exam.exam_id ? (
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
                          {getChapterTitle(exam.chapter_id)}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="count-badge">{getQuestionCount(exam.exam_id)} câu</span>
                    </td>
                    <td>
                      <span className="count-badge">{getResultCount(exam.exam_id)} lượt</span>
                    </td>
                    <td>
                      <div className="date-cell">
                        {formatDateTime(exam.created_at)}
                      </div>
                    </td>
                    <td>
                      {editingId === exam.exam_id ? (
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
                          <button className="btn-edit" onClick={() => handleEdit(exam)}>
                            ✏️
                          </button>
                          <button className="btn-delete" onClick={() => handleDelete(exam.exam_id)}>
                            🗑️
                          </button>
                          <button className="btn-view" title="Xem chi tiết">
                            👁️
                          </button>
                        </div>
                      )}
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
                  const exam = exams.find(e => e.exam_id === result.exam_id);
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
                  <th>Bài kiểm tra ↑</th>
                  <th>ID Câu hỏi ↑</th>
                  <th>Thứ tự ↑</th>
                  <th>Chức năng</th>
                </tr>
              </thead>
              <tbody>
                {examQuestions.map((eq, index) => {
                  const exam = exams.find(e => e.exam_id === eq.exam_id);
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