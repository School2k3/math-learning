import React, { useState, useEffect } from "react";
import "../css/admin-css/question.css";
import { Link } from "react-router-dom";

interface Question {
  question_id: number;
  question_text: string;
  image_url?: string;
  audio_url?: string;
  type: 'practice' | 'exam';
  lesson_id: number;
  created_at: string;
  explanation_img?: string;
  explanation_text?: string;
  answer_type: 'choice' | 'input' | 'drag';
}

interface Lesson {
  lesson_id: number;
  title: string;
  chapter_id: number;
}

const initialQuestions: Question[] = [
  {
    question_id: 1,
    question_text: "Có bao nhiều con chó?",
    image_url: "https://res.cloudinary.com/...",
    audio_url: "",
    type: "practice",
    lesson_id: 1,
    created_at: "2025-10-03 13:...",
    explanation_img: "",
    explanation_text: "Nhìn hình có 3 con chó.",
    answer_type: "choice"
  },
  {
    question_id: 2,
    question_text: "Có bao nhiều con mèo?",
    image_url: "https://res.cloudinary.com/...",
    audio_url: "",
    type: "practice",
    lesson_id: 1,
    created_at: "2025-10-03 13:...",
    explanation_img: "",
    explanation_text: "Trong hình có 2 con mèo.",
    answer_type: "choice"
  },
  {
    question_id: 3,
    question_text: "Có bao nhiều con vịt?",
    image_url: "https://res.cloudinary.com/...",
    audio_url: "",
    type: "practice",
    lesson_id: 1,
    created_at: "2025-10-03 13:...",
    explanation_img: "",
    explanation_text: "Đếm số có rốt đã tô màu trong hình.",
    answer_type: "choice"
  },
  {
    question_id: 5,
    question_text: "Trong lọ đâu tích hợp đường?",
    image_url: "https://res.cloudinary.com/...",
    audio_url: "",
    type: "practice",
    lesson_id: 1,
    created_at: "2025-10-03 13:...",
    explanation_img: "",
    explanation_text: "Lọ đâu tiến có 2 con cá.",
    answer_type: "choice"
  },
  {
    question_id: 1215,
    question_text: "Có bao nhiều con cua?",
    image_url: "https://res.cloudinary.com/...",
    audio_url: "",
    type: "exam",
    lesson_id: 1,
    created_at: "2025-10-03 13:...",
    explanation_img: "",
    explanation_text: "",
    answer_type: "choice"
  },
  {
    question_id: 4,
    question_text: "Có bao nhiều con bướm?",
    image_url: "https://res.cloudinary.com/...",
    audio_url: "",
    type: "practice",
    lesson_id: 1,
    created_at: "2025-10-03 13:...",
    explanation_img: "",
    explanation_text: "Trong hình có 2 con gà được ghi số 2.",
    answer_type: "choice"
  }
];

const initialLessons: Lesson[] = [
  { lesson_id: 1, title: "Các số 0, 1, 2, 3, 4, 5", chapter_id: 1 },
  { lesson_id: 2, title: "Các số 6, 7, 8, 9, 10", chapter_id: 1 },
  { lesson_id: 3, title: "Nhiều hơn, ít hơn, bằng nhau", chapter_id: 1 },
  { lesson_id: 4, title: "So sánh số", chapter_id: 1 },
  { lesson_id: 5, title: "Máy và máy", chapter_id: 1 },
];

const QuestionAdmin: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [lessons] = useState<Lesson[]>(initialLessons);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Question>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState<Partial<Question>>({});
  const [filterType, setFilterType] = useState<string>('all');
  const [filterLesson, setFilterLesson] = useState<string>('all');

  // Lấy tên bài học theo ID
  const getLessonTitle = (lessonId: number) => {
    const lesson = lessons.find(l => l.lesson_id === lessonId);
    return lesson ? lesson.title : `Bài ${lessonId}`;
  };

  // Lọc câu hỏi
  const filteredQuestions = questions.filter(q => {
    if (filterType !== 'all' && q.type !== filterType) return false;
    if (filterLesson !== 'all' && q.lesson_id !== Number(filterLesson)) return false;
    return true;
  });

  // Thêm câu hỏi mới
  const handleAdd = () => {
    if (!newQuestion.question_text || !newQuestion.lesson_id || !newQuestion.type || !newQuestion.answer_type) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }
    
    const newId = Math.max(...questions.map(q => q.question_id)) + 1;
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    setQuestions([...questions, {
      question_id: newId,
      question_text: newQuestion.question_text,
      image_url: newQuestion.image_url || "",
      audio_url: newQuestion.audio_url || "",
      type: newQuestion.type as 'practice' | 'exam',
      lesson_id: Number(newQuestion.lesson_id),
      created_at: now,
      explanation_img: newQuestion.explanation_img || "",
      explanation_text: newQuestion.explanation_text || "",
      answer_type: newQuestion.answer_type as 'choice' | 'input' | 'drag'
    }]);
    
    setNewQuestion({});
    setShowAddForm(false);
  };

  // Xóa câu hỏi
  const handleDelete = (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa câu hỏi này?")) {
      setQuestions(questions.filter(q => q.question_id !== id));
    }
  };

  // Bắt đầu chỉnh sửa
  const handleEdit = (question: Question) => {
    setEditingId(question.question_id);
    setEditData({ ...question });
  };

  // Lưu chỉnh sửa
  const handleSave = () => {
    if (!editData.question_text || !editData.lesson_id || !editData.type || !editData.answer_type) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    setQuestions(questions.map(q => 
      q.question_id === editingId 
        ? { ...q, ...editData } 
        : q
    ));
    
    setEditingId(null);
    setEditData({});
  };

  // Hủy chỉnh sửa
  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
    setShowAddForm(false);
    setNewQuestion({});
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
                          <li className="active">
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
            </ul>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="admin-main">
        <div className="question-header">
          <div className="question-title">
            <h1>Câu hỏi</h1>
            <p>{filteredQuestions.length} câu hỏi</p>
          </div>
          <button 
            className="btn-add"
            onClick={() => setShowAddForm(true)}
          >
            + Thêm mới
          </button>
        </div>

        {/* Filters */}
        <div className="question-filters">
          <div className="filter-group">
            <label>Loại:</label>
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
              className="filter-select"
            >
              <option value="all">Tất cả</option>
              <option value="practice">Thực hành</option>
              <option value="exam">Kiểm tra</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Bài học:</label>
            <select 
              value={filterLesson} 
              onChange={(e) => setFilterLesson(e.target.value)}
              className="filter-select"
            >
              <option value="all">Tất cả</option>
              {lessons.map(lesson => (
                <option key={lesson.lesson_id} value={lesson.lesson_id}>
                  {lesson.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="question-table-container">
          <table className="question-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Nội dung câu hỏi ↑</th>
                <th>Loại ↑</th>
                <th>Bài học ↑</th>
                <th>Hình ảnh ↑</th>
                <th>Audio ↑</th>
                <th>Kiểu trả lời ↑</th>
                <th>Giải thích ↑</th>
                <th>Chức năng</th>
              </tr>
            </thead>
            <tbody>
              {/* Form thêm mới */}
              {showAddForm && (
                <tr className="add-row">
                  <td>-</td>
                  <td>
                    <textarea
                      value={newQuestion.question_text || ""}
                      onChange={(e) => setNewQuestion({...newQuestion, question_text: e.target.value})}
                      placeholder="Nhập nội dung câu hỏi"
                      className="textarea-field"
                      rows={2}
                    />
                  </td>
                  <td>
                    <select
                      value={newQuestion.type || ""}
                      onChange={(e) => setNewQuestion({...newQuestion, type: e.target.value as 'practice' | 'exam'})}
                      className="select-field"
                    >
                      <option value="">Chọn loại</option>
                      <option value="practice">Thực hành</option>
                      <option value="exam">Kiểm tra</option>
                    </select>
                  </td>
                  <td>
                    <select
                      value={newQuestion.lesson_id || ""}
                      onChange={(e) => setNewQuestion({...newQuestion, lesson_id: Number(e.target.value)})}
                      className="select-field"
                    >
                      <option value="">Chọn bài học</option>
                      {lessons.map(lesson => (
                        <option key={lesson.lesson_id} value={lesson.lesson_id}>
                          {lesson.title}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      type="url"
                      value={newQuestion.image_url || ""}
                      onChange={(e) => setNewQuestion({...newQuestion, image_url: e.target.value})}
                      placeholder="URL hình ảnh"
                      className="input-field"
                    />
                  </td>
                  <td>
                    <input
                      type="url"
                      value={newQuestion.audio_url || ""}
                      onChange={(e) => setNewQuestion({...newQuestion, audio_url: e.target.value})}
                      placeholder="URL audio"
                      className="input-field"
                    />
                  </td>
                  <td>
                    <select
                      value={newQuestion.answer_type || ""}
                      onChange={(e) => setNewQuestion({...newQuestion, answer_type: e.target.value as 'choice' | 'input' | 'drag'})}
                      className="select-field"
                    >
                      <option value="">Chọn kiểu</option>
                      <option value="choice">Trắc nghiệm</option>
                      <option value="input">Nhập liệu</option>
                      <option value="drag">Kéo thả</option>
                    </select>
                  </td>
                  <td>
                    <input
                      type="text"
                      value={newQuestion.explanation_text || ""}
                      onChange={(e) => setNewQuestion({...newQuestion, explanation_text: e.target.value})}
                      placeholder="Giải thích"
                      className="input-field"
                    />
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-save" onClick={handleAdd}>
                        💾
                      </button>
                      <button className="btn-cancel" onClick={handleCancel}>
                        ❌
                      </button>
                    </div>
                  </td>
                </tr>
              )}

              {/* Danh sách câu hỏi */}
              {filteredQuestions.map((question, index) => (
                <tr key={question.question_id}>
                  <td>{index + 1}</td>
                  <td>
                    {editingId === question.question_id ? (
                      <textarea
                        value={editData.question_text || ""}
                        onChange={(e) => setEditData({...editData, question_text: e.target.value})}
                        className="textarea-field"
                        rows={2}
                      />
                    ) : (
                      <div className="question-text-cell">
                        {question.question_text}
                      </div>
                    )}
                  </td>
                  <td>
                    {editingId === question.question_id ? (
                      <select
                        value={editData.type || ""}
                        onChange={(e) => setEditData({...editData, type: e.target.value as 'practice' | 'exam'})}
                        className="select-field"
                      >
                        <option value="practice">Thực hành</option>
                        <option value="exam">Kiểm tra</option>
                      </select>
                    ) : (
                      <span className={`type-badge ${question.type}`}>
                        {question.type === 'practice' ? 'Thực hành' : 'Kiểm tra'}
                      </span>
                    )}
                  </td>
                  <td>
                    {editingId === question.question_id ? (
                      <select
                        value={editData.lesson_id || ""}
                        onChange={(e) => setEditData({...editData, lesson_id: Number(e.target.value)})}
                        className="select-field"
                      >
                        {lessons.map(lesson => (
                          <option key={lesson.lesson_id} value={lesson.lesson_id}>
                            {lesson.title}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="lesson-cell">
                        {getLessonTitle(question.lesson_id)}
                      </div>
                    )}
                  </td>
                  <td>
                    {editingId === question.question_id ? (
                      <input
                        type="url"
                        value={editData.image_url || ""}
                        onChange={(e) => setEditData({...editData, image_url: e.target.value})}
                        className="input-field"
                      />
                    ) : (
                      <div className="media-cell">
                        {question.image_url ? (
                          <span className="media-available">✅</span>
                        ) : (
                          <span className="media-null">❌</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td>
                    {editingId === question.question_id ? (
                      <input
                        type="url"
                        value={editData.audio_url || ""}
                        onChange={(e) => setEditData({...editData, audio_url: e.target.value})}
                        className="input-field"
                      />
                    ) : (
                      <div className="media-cell">
                        {question.audio_url ? (
                          <span className="media-available">✅</span>
                        ) : (
                          <span className="media-null">❌</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td>
                    {editingId === question.question_id ? (
                      <select
                        value={editData.answer_type || ""}
                        onChange={(e) => setEditData({...editData, answer_type: e.target.value as 'choice' | 'input' | 'drag'})}
                        className="select-field"
                      >
                        <option value="choice">Trắc nghiệm</option>
                        <option value="input">Nhập liệu</option>
                        <option value="drag">Kéo thả</option>
                      </select>
                    ) : (
                      <span className="answer-type-badge">
                        {question.answer_type === 'choice' ? 'Trắc nghiệm' : 
                         question.answer_type === 'input' ? 'Nhập liệu' : 'Kéo thả'}
                      </span>
                    )}
                  </td>
                  <td>
                    {editingId === question.question_id ? (
                      <input
                        type="text"
                        value={editData.explanation_text || ""}
                        onChange={(e) => setEditData({...editData, explanation_text: e.target.value})}
                        className="input-field"
                      />
                    ) : (
                      <div className="explanation-cell">
                        {question.explanation_text ? (
                          <span title={question.explanation_text}>
                            {question.explanation_text.length > 20 
                              ? question.explanation_text.substring(0, 20) + "..." 
                              : question.explanation_text}
                          </span>
                        ) : (
                          <span className="text-muted">Chưa có</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td>
                    {editingId === question.question_id ? (
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
                        <button className="btn-edit" onClick={() => handleEdit(question)}>
                          ✏️
                        </button>
                        <button className="btn-delete" onClick={() => handleDelete(question.question_id)}>
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

export default QuestionAdmin;