import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "../css/admin-css/question.css";
import { fetchAnswersByQuestionId, updateAnswerById } from "../api/answers";
import { fetchAllQuestions } from "../api/questionAPI";
import { fetchAllLessons } from "../api/lessonAPI";
import { fetchAllChapters } from "../api/chapterAPI";

interface Answer {
  id: number;
  questionId: number;
  answerText: string;
  isCorrect: boolean;
}

interface Question {
  id: number;
  questionText: string;
  lessonId: number;
  grade: number;
}

const AnswerAdmin: React.FC = () => {
  const [searchParams] = useSearchParams();
  const questionIdParam = searchParams.get("questionId");
  const questionId = questionIdParam ? Number(questionIdParam) : undefined;

  const [answers, setAnswers] = useState<Answer[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Answer>>({});
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filterGrade, setFilterGrade] = useState("all");
  const [filterChapter, setFilterChapter] = useState("all");
  const [filterLesson, setFilterLesson] = useState("all");
  const [filterQuestion, setFilterQuestion] = useState("all");

  const [chapters, setChapters] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);

  // Lấy danh sách đáp án theo questionId
  //   useEffect(() => {
  //     const fetchAll = async () => {
  //       try {
  //         const res = await fetchAnswersByQuestionId(questionId);
  //         setAnswers(res.data.answers || []);
  //       } catch (err) {
  //         setAnswers([]);
  //       }
  //     };
  //     fetchAll();
  //   }, [questionId]);

  // Giả sử bạn đã có danh sách questions từ question.tsx
  useEffect(() => {
    const fetchAnswers = async () => {
      if (questionId) {
        const res = await fetchAnswersByQuestionId(questionId);
        setAnswers(res.data.answers || []);
        // Nếu muốn hiển thị nội dung câu hỏi:
        const resQuestions = await fetchAllQuestions();
        setQuestions(resQuestions.data?.questions || []);
      } else {
        // Nếu không có questionId, load tất cả như cũ
        const resQuestions = await fetchAllQuestions();
        const questionsList = resQuestions.data?.questions || [];
        setQuestions(questionsList);

        const allAnswers: Answer[] = [];
        await Promise.all(
          questionsList.map(async (q: Question) => {
            const res = await fetchAnswersByQuestionId(q.id);
            if (res.data && res.data.answers) {
              allAnswers.push(...res.data.answers.map((a: any) => ({
                ...a,
                questionText: q.questionText // Gắn thêm questionText vào answer
              })));
            }
          })
        );
        setAnswers(allAnswers);
      }
    };
    fetchAnswers();
  }, [questionId]);

  // Xóa đáp án
  const handleDelete = (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa đáp án này?")) {
      setAnswers(answers.filter(a => a.id !== id));
    }
  };

  // Bắt đầu chỉnh sửa
  const handleEdit = (answer: Answer) => {
    setEditingId(answer.id);
    setEditData({ ...answer });
  };

  // Lưu chỉnh sửa
  const handleSave = async () => {
    if (!editData.answerText) {
      alert("Vui lòng nhập đáp án!");
      return;
    }
    try {
      await updateAnswerById(editingId!, {
        answerText: editData.answerText!,
        isCorrect: !!editData.isCorrect,
      });
      setAnswers(answers.map(a =>
        a.id === editingId
          ? { ...a, ...editData }
          : a
      ));
      setEditingId(null);
      setEditData({});
      alert("Cập nhật đáp án thành công!");
    } catch (err) {
      alert("Lỗi khi cập nhật đáp án!");
    }
  };

  // Hủy chỉnh sửa
  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  // Lấy danh sách câu hỏi
  useEffect(() => {
    const loadQuestions = async () => {
      const res = await fetchAllQuestions();
      setQuestions(res.data?.questions || []);
    };
    loadQuestions();
  }, []);

  // Load chapters, lessons
  useEffect(() => {
    const loadData = async () => {
      const chapRes = await fetchAllChapters();
      setChapters(chapRes.data?.chapters || chapRes.chapters || []);
      const lessonRes = await fetchAllLessons();
      setLessons(lessonRes.lessons || []);
    };
    loadData();
  }, []);

  // Lọc danh sách câu hỏi theo các filter
  const filteredQuestions = questions.filter(q => {
    if (filterGrade !== "all" && q.grade !== Number(filterGrade)) return false;
    if (filterLesson !== "all" && q.lessonId !== Number(filterLesson)) return false;
    if (filterChapter !== "all") {
      const lesson = lessons.find(l => l.id === q.lessonId);
      if (!lesson || lesson.chapterId !== Number(filterChapter)) return false;
    }
    if (filterQuestion !== "all" && q.id !== Number(filterQuestion)) return false;
    return true;
  });

  // Lọc đáp án theo filteredQuestions
  const filteredAnswers = answers.filter(a =>
    filteredQuestions.some(q => q.id === a.questionId)
  );

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
              <li className="active">
                <Link to="/admin/answers" style={{ textDecoration: "none", color: "inherit" }}>
                  📝 Quản lý đáp án
                </Link>
              </li>
              <li>
                <Link to="/admin/exams" style={{ textDecoration: "none", color: "inherit" }}>
                  📋 Quản lý bài kiểm tra
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
            </ul>
          </div>
          <div className="nav-section">
            <h4>HỆ THỐNG</h4>
            <ul>
            </ul>
          </div>
        </nav>
      </div>
      {/* Main Content */}
      <div className="admin-main">
        <div className="answer-content-wrapper">
          <div className="answer-header">
            <div className="answer-title">
              <h1>📝 Danh sách đáp án câu hỏi</h1>
              <p>{filteredAnswers.length} đáp án</p>
            </div>
          </div>

          {/* Thanh lọc */}
          <div className="filter-section">
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
                    <option key={ch.id} value={ch.id}>{ch.title}</option>
                  ))}
              </select>
            </div>
            <div className="filter-group">
              <label>Bài học:</label>
              <select value={filterLesson} onChange={e => setFilterLesson(e.target.value)}>
                <option value="all">Tất cả</option>
                {lessons
                  .filter(l => filterChapter === "all" || l.chapterId === Number(filterChapter))
                  .map(l => (
                    <option key={l.id} value={l.id}>{l.title}</option>
                  ))}
              </select>
            </div>
            <div className="filter-group">
              <label>Câu hỏi:</label>
              <select value={filterQuestion} onChange={e => setFilterQuestion(e.target.value)}>
                <option value="all">Tất cả</option>
                {filteredQuestions.map(q => (
                  <option key={q.id} value={q.id}>{q.questionText.substring(0, 50)}...</option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="answer-table-container">
            <table className="answer-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Câu hỏi</th>
                  <th>Đáp án</th>
                  <th>Đúng/Sai</th>
                  <th>Chức năng</th>
                </tr>
              </thead>
              <tbody>
                {filteredAnswers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="empty-state">
                      <h3>Không có đáp án nào</h3>
                      <p>Hãy thêm đáp án mới hoặc thay đổi bộ lọc</p>
                    </td>
                  </tr>
                ) : (
                  filteredAnswers.map((answer, index) => {
                    const question = questions.find(q => q.id === answer.questionId);
                    const isEditing = editingId === answer.id;
                    return (
                      <tr key={answer.id}>
                        <td>{index + 1}</td>
                        <td className="question-cell">
                          {question?.questionText || `Câu hỏi ID ${answer.questionId}`}
                        </td>
                        <td className="answer-text-cell">
                          {isEditing ? (
                            <textarea
                              className="textarea-field"
                              value={editData.answerText || ""}
                              onChange={e =>
                                setEditData({ ...editData, answerText: e.target.value })
                              }
                              rows={2}
                            />
                          ) : (
                            answer.answerText
                          )}
                        </td>
                        <td>
                          {isEditing ? (
                            <select
                              className="select-field"
                              value={editData.isCorrect ? "true" : "false"}
                              onChange={e =>
                                setEditData({ ...editData, isCorrect: e.target.value === "true" })
                              }
                            >
                              <option value="false">Sai</option>
                              <option value="true">Đúng</option>
                            </select>
                          ) : (
                            <span className={`status-badge ${answer.isCorrect ? 'status-correct' : 'status-incorrect'}`}>
                              {answer.isCorrect ? '✅ Đúng' : '❌ Sai'}
                            </span>
                          )}
                        </td>
                        <td>
                          <div className="action-buttons">
                            {isEditing ? (
                              <>
                                <button className="btn-save" onClick={handleSave}>💾 Lưu</button>
                                <button className="btn-cancel" onClick={handleCancel}>❌ Hủy</button>
                              </>
                            ) : (
                              <>
                                <button className="btn-edit" onClick={() => handleEdit(answer)}>✏️</button>
                                <button className="btn-delete" onClick={() => handleDelete(answer.id)}>🗑️</button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnswerAdmin;