import React, { useState, useEffect } from "react";
import "../css/admin-css/question.css";
import { Link, useNavigate } from "react-router-dom";
import { fetchQuestionsByGradeTypeAnswerType } from "../api/questionAPI";
import { fetchAllLessons } from "../api/lessonAPI";
import { fetchAllChapters } from "../api/chapterAPI";
import { createQuestionWithAnswers } from "../api/questionAPI";
import { deleteQuestionById } from "../api/questionAPI"; // Thêm import này
import { updateQuestionById } from "../api/questionAPI"; // Thêm import này

interface Answer {
  id: number;
  questionId: number;
  answerText: string;
  isCorrect: boolean;
}

interface Question {
  id: number;
  questionText: string;
  imageUrl?: string;
  audioUrl?: string;
  explanationText?: string;
  explanationImg?: string;
  grade: number;
  type: "practice" | "exam";
  answerType: "choice" | "input" | "drag";
  lessonId: number;
  createdAt: string;
  answers?: Answer[];
}

interface Lesson {
  id: number;
  title: string;
  chapterId: number;
  // ... các trường khác ...
}

interface Chapter {
  id: number;
  title: string;
  grade: number;
  volume: number;
}

const QuestionAdmin: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [addFormLessons, setAddFormLessons] = useState<Lesson[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Question>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAnswerForm, setShowAnswerForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState<Partial<Question>>({});
  const [newAnswers, setNewAnswers] = useState<
    { answerText: string; isCorrect: boolean }[]
  >([]);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterGrade, setFilterGrade] = useState("all");
  const [filterChapter, setFilterChapter] = useState("all");
  const [filterLesson, setFilterLesson] = useState("all");
  const [filterAnswerType, setFilterAnswerType] = useState<string>("all");
  const navigate = useNavigate();

  // Lấy tên bài học theo ID
  const getLessonTitle = (lessonId: number) => {
    const lesson = lessons.find((l) => l.lesson_id === lessonId);
    return lesson ? lesson.title : `Bài ${lessonId}`;
  };

  // Lọc câu hỏi theo Lớp -> Chương -> Bài học
  const filteredQuestions = questions.filter((q) => {
    if (filterGrade !== "all" && q.grade !== Number(filterGrade)) return false;
    if (filterChapter !== "all") {
      const lesson = allLessons.find((l) => l.id === q.lessonId);
      if (!lesson || lesson.chapterId !== Number(filterChapter)) return false;
    }
    if (filterLesson !== "all" && q.lessonId !== Number(filterLesson))
      return false;
    return true;
  });

  // Bước 1: Lưu thông tin câu hỏi, chuyển sang nhập đáp án
  const handleAdd = () => {
    if (
      !newQuestion.questionText ||
      !newQuestion.lessonId ||
      !newQuestion.type ||
      !newQuestion.answerType ||
      !newQuestion.grade
    ) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }
    setShowAddForm(false);
    setShowAnswerForm(true);
  };

  // Bước 2: Gọi API tạo câu hỏi kèm đáp án
  const handleCreateQuestion = async () => {
    if (newAnswers.length === 0 || newAnswers.some((a) => !a.answerText)) {
      alert("Vui lòng nhập đầy đủ đáp án!");
      return;
    }
    // Kiểm tra chỉ có 1 đáp án đúng
    const correctCount = newAnswers.filter((a) => a.isCorrect).length;
    if (correctCount !== 1) {
      alert("Phải có đúng 1 đáp án đúng!");
      return;
    }
    try {
      await createQuestionWithAnswers({
        questionText: newQuestion.questionText || "",
        imageUrl:
          newQuestion.imageUrl ||
          "https://res.cloudinary.com/dqbluifmd/image/upload/v1759301901/Screenshot_2025-10-01_110452_z3pszz.png",
        audioUrl:
          newQuestion.audioUrl ||
          "https://res.cloudinary.com/dv3gofhee/video/upload/v1759488935/math-audio/grade2/lesson01/1_vslq5t.wav",
        explanationText: newQuestion.explanationText?.trim()
          ? newQuestion.explanationText
          : "Giải thích mặc định",
        explanationImg: newQuestion.explanationImg?.trim()
          ? newQuestion.explanationImg
          : "https://dummyimage.com/600x400/cccccc/000000&text=No+Image",
        grade: Number(newQuestion.grade),
        type: newQuestion.type || "practice",
        answerType: newQuestion.answerType || "choice",
        lessonId: Number(newQuestion.lessonId),
        answers: newAnswers.map((a) => ({
          answerText: a.answerText,
          isCorrect: !!a.isCorrect,
        })),
      });
      alert("Thêm câu hỏi thành công!");
      setShowAnswerForm(false);
      setNewQuestion({});
      setNewAnswers([]);
      // TODO: reload lại danh sách câu hỏi
    } catch (err) {
      alert("Lỗi khi thêm câu hỏi!");
    }
  };

  // Xóa câu hỏi
  const handleDelete = async (id: number) => {
    if (
      window.confirm(
        "Bạn có chắc chắn muốn xóa câu hỏi này? Việc này không thể hoàn tác!"
      )
    ) {
      try {
        await deleteQuestionById(id);
        setQuestions(questions.filter((q) => q.id !== id));
        alert("Đã xóa câu hỏi thành công!");
      } catch (err) {
        alert(
          "Không thể xóa câu hỏi! Có thể câu hỏi này đã có đáp án hoặc xảy ra lỗi."
        );
      }
    }
  };

  // Bắt đầu chỉnh sửa
  const handleEdit = (question: Question) => {
    setEditingId(question.id);
    setEditData({ ...question });
  };

  // Lưu chỉnh sửa
  const handleSave = async () => {
    if (
      !editData.questionText ||
      !editData.lessonId ||
      !editData.type ||
      !editData.answerType
    ) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }
    try {
      await updateQuestionById(editingId!, {
        questionText: editData.questionText,
        imageUrl: editData.imageUrl || "",
        audioUrl: editData.audioUrl || "",
        explanationText: editData.explanationText || "Giải thích mặc định",
        explanationImg:
          editData.explanationImg ||
          "https://dummyimage.com/600x400/cccccc/000000&text=No+Image",
        grade: Number(editData.grade),
        type: editData.type || "practice",
        answerType: editData.answerType || "choice",
        lessonId: Number(editData.lessonId),
      });
      setQuestions(
        questions.map((q) => (q.id === editingId ? { ...q, ...editData } : q))
      );
      setEditingId(null);
      setEditData({});
      alert("Cập nhật câu hỏi thành công!");
    } catch (err) {
      alert("Lỗi khi cập nhật câu hỏi!");
    }
  };

  // Hủy chỉnh sửa
  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
    setShowAddForm(false);
    setNewQuestion({});
  };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        // Lấy tất cả câu hỏi với các giá trị filter hợp lệ
        // Ví dụ: lấy tất cả câu hỏi lớp 1, loại practice, kiểu choice
        const res = await fetchQuestionsByGradeTypeAnswerType(
          1,
          "practice",
          "choice"
        );
        // Nếu muốn lấy nhiều lớp/loại/kiểu, gọi nhiều lần và gộp lại
        setQuestions(res.data.questions || []);
      } catch (err) {
        setQuestions([]);
      }
    };
    fetchAll();
  }, []);

  useEffect(() => {
    const loadDataForFilter = async () => {
      try {
        const chapRes = await fetchAllChapters();
        const allChaptersList =
          chapRes.data?.chapters || chapRes.chapters || [];
        setChapters(allChaptersList);

        const lessonRes = await fetchAllLessons();
        const allLessonsList =
          lessonRes.data?.lessons || lessonRes.lessons || [];
        setAllLessons(allLessonsList);

        let lessonsForFilter = allLessonsList;
        if (filterGrade !== "all") {
          const gradeNum = Number(filterGrade);
          const chapterIds = allChaptersList
            .filter((c) => c.grade === gradeNum)
            .map((c) => c.id);
          lessonsForFilter = allLessonsList.filter((l) =>
            chapterIds.includes(l.chapter_id)
          );
        }
        setLessons(lessonsForFilter);
      } catch (err) {
        setLessons([]);
        setChapters([]);
        setAllLessons([]);
      }
    };
    loadDataForFilter();
  }, [filterGrade]);

  useEffect(() => {
    const loadQuestions = async () => {
      // Nếu filter là "all", lấy lần lượt từng giá trị
      const grades =
        filterGrade === "all" ? [1, 2, 3, 4, 5] : [Number(filterGrade)];
      const types = filterType === "all" ? ["practice", "exam"] : [filterType];
      const answerTypes =
        filterAnswerType === "all"
          ? ["choice", "input", "drag"]
          : [filterAnswerType];

      let allQuestions: Question[] = [];
      for (const grade of grades) {
        for (const type of types) {
          for (const answerType of answerTypes) {
            const res = await fetchQuestionsByGradeTypeAnswerType(
              grade,
              type,
              answerType
            );
            allQuestions = allQuestions.concat(res.data?.questions || []);
          }
        }
      }
      setQuestions(allQuestions);
    };
    loadQuestions();
  }, [filterGrade, filterType, filterAnswerType]);

  useEffect(() => {
    if (newQuestion.grade) {
      const gradeNum = Number(newQuestion.grade);
      const chapterIds = chapters
        .filter((c) => c.grade === gradeNum)
        .map((c) => c.id);
      // SỬA TẠI ĐÂY: dùng l.chapterId thay vì l.chapter_id
      const filteredForAddForm = allLessons.filter((l) =>
        chapterIds.includes(l.chapterId)
      );
      setAddFormLessons(filteredForAddForm);
    } else {
      setAddFormLessons([]);
    }
  }, [newQuestion.grade, chapters, allLessons]);

  useEffect(() => {
    console.log("allLessons", allLessons);
    console.log("chapters", chapters);
  }, [allLessons, chapters]);

  console.log("Một lesson mẫu:", allLessons[0]);

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
              <li>
                <Link
                  to="/admin/lessons"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  📝 Quản lý bài học
                </Link>
              </li>
              <li className="active">
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
        <div className="question-header">
          <div className="question-title">
            <h1>Câu hỏi</h1>
            <p>{filteredQuestions.length} câu hỏi</p>
          </div>
          <div className="header-actions">
            <button 
              className="btn-manage" 
              onClick={() => navigate("/admin/answers")}
              style={{
                marginRight: "10px",
                background: "#9C27B0",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              ✏️ Quản lý đáp án
            </button>
            <button 
              className="btn-add" 
              onClick={() => {
                // Pre-fill form với giá trị filter hiện tại
                setNewQuestion({
                  grade: filterGrade !== "all" ? Number(filterGrade) : undefined,
                  lessonId: filterLesson !== "all" ? Number(filterLesson) : undefined,
                  type: filterType !== "all" ? filterType as "practice" | "exam" : undefined,
                  answerType: filterAnswerType !== "all" ? filterAnswerType as "choice" | "input" | "drag" : undefined,
                  questionText: "",
                  imageUrl: "",
                  audioUrl: "",
                  explanationText: "",
                  explanationImg: "",
                });
                setShowAddForm(true);
              }}
            >
              + Thêm mới câu hỏi
            </button>
          </div>
        </div>
        {/* Filters */}
        <div className="question-filters">
          <div className="filter-group">
            <label>Lớp:</label>
            <select
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value)}
            >
              <option value="all">Tất cả</option>
              {[1, 2, 3, 4, 5].map((g) => (
                <option key={g} value={g}>
                  Lớp {g}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Chương:</label>
            <select
              value={filterChapter}
              onChange={(e) => setFilterChapter(e.target.value)}
            >
              <option value="all">Tất cả</option>
              {chapters
                .filter(
                  (ch) =>
                    filterGrade === "all" || ch.grade === Number(filterGrade)
                )
                .map((ch) => (
                  <option key={ch.id} value={ch.id}>
                    {ch.title}
                  </option>
                ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Bài học:</label>
            <select
              value={filterLesson}
              onChange={(e) => setFilterLesson(e.target.value)}
            >
              <option value="all">Tất cả</option>
              {allLessons
                .filter(
                  (l) =>
                    filterChapter === "all" ||
                    l.chapterId === Number(filterChapter)
                )
                .map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.title}
                  </option>
                ))}
            </select>
          </div>
          {/* Các filter khác giữ nguyên */}
          <div className="filter-group">
            <label>Loại:</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">Tất cả</option>
              <option value="practice">Thực hành</option>
              <option value="exam">Kiểm tra</option>
            </select>
          </div>
          {/* <div className="filter-group">
            <label>Kiểu trả lời:</label>
            <select
              value={filterAnswerType}
              onChange={(e) => setFilterAnswerType(e.target.value)}
            >
              <option value="all">Tất cả</option>
              <option value="choice">Trắc nghiệm</option>
              <option value="input">Nhập liệu</option>
              <option value="drag">Kéo thả</option>
            </select>
          </div> */}
        </div>

        <div className="question-table-container">
          <table className="question-table">
            <thead>
              <tr>
                <th># </th>
                <th>Nội dung câu hỏi</th>
                <th>Loại</th>
                <th>Lớp</th>
                <th>Bài học</th>
                <th>Hình ảnh</th>
                <th>Audio</th>
                <th>Kiểu trả lời</th>
                <th>Giải thích</th>
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
                    <textarea
                      value={newQuestion.questionText || ""}
                      onChange={(e) =>
                        setNewQuestion({
                          ...newQuestion,
                          questionText: e.target.value,
                        })
                      }
                      placeholder="Nhập nội dung câu hỏi"
                      className="textarea-field"
                      rows={2}
                    />
                  </td>
                  <td>
                    <select
                      value={newQuestion.type || ""}
                      onChange={(e) =>
                        setNewQuestion({
                          ...newQuestion,
                          type: e.target.value as "practice" | "exam",
                        })
                      }
                      className="select-field"
                    >
                      <option value="">Chọn loại</option>
                      <option value="practice">Thực hành</option>
                      <option value="exam">Kiểm tra</option>
                    </select>
                  </td>
                  <td>
                    <select
                      value={newQuestion.grade || ""}
                      onChange={(e) =>
                        setNewQuestion({
                          ...newQuestion,
                          grade: Number(e.target.value),
                        })
                      }
                      className="select-field"
                    >
                      <option value="">Chọn lớp</option>
                      <option value="1">Lớp 1</option>
                      <option value="2">Lớp 2</option>
                      <option value="3">Lớp 3</option>
                      <option value="4">Lớp 4</option>
                      <option value="5">Lớp 5</option>
                    </select>
                  </td>
                  <td>
                    <select
                      value={newQuestion.lessonId || ""}
                      onChange={(e) =>
                        setNewQuestion({
                          ...newQuestion,
                          lessonId: Number(e.target.value),
                        })
                      }
                      className="select-field"
                    >
                      <option value="">Chọn bài học</option>
                      {addFormLessons.map((lesson) => (
                        <option key={lesson.id} value={lesson.id}>
                          {lesson.title}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      type="url"
                      value={newQuestion.imageUrl || ""}
                      onChange={(e) =>
                        setNewQuestion({
                          ...newQuestion,
                          imageUrl: e.target.value,
                        })
                      }
                      placeholder="URL hình ảnh"
                      className="input-field"
                    />
                  </td>
                  <td>
                    <input
                      type="url"
                      value={newQuestion.audioUrl || ""}
                      onChange={(e) =>
                        setNewQuestion({
                          ...newQuestion,
                          audioUrl: e.target.value,
                        })
                      }
                      placeholder="URL audio"
                      className="input-field"
                    />
                  </td>
                  <td>
                    <select
                      value={newQuestion.answerType || ""}
                      onChange={(e) =>
                        setNewQuestion({
                          ...newQuestion,
                          answerType: e.target.value as
                            | "choice"
                            | "input"
                            | "drag",
                        })
                      }
                      className="select-field"
                    >
                      <option value="">Chọn kiểu</option>
                      <option value="choice">Trắc nghiệm</option>
                      {/* <option value="input">Nhập liệu</option>
                      <option value="drag">Kéo thả</option> */}
                    </select>
                  </td>
                  <td>
                    <input
                      type="text"
                      value={newQuestion.explanationText || ""}
                      onChange={(e) =>
                        setNewQuestion({
                          ...newQuestion,
                          explanationText: e.target.value,
                        })
                      }
                      placeholder="Giải thích"
                      className="input-field"
                    />
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-save" onClick={handleAdd}>
                        Lưu
                      </button>
                      <button className="btn-cancel" onClick={handleCancel}>
                        ❌
                      </button>
                    </div>
                  </td>
                </tr>
              )}

              {/* Khung nhập đáp án */}
              {showAnswerForm && (
                <tr>
                  <td colSpan={11}>
                    <div className="answer-form-modal">
                      <h3>Nhập đáp án cho câu hỏi</h3>
                      {newAnswers.map((ans, idx) => (
                        <div
                          key={idx}
                          style={{ display: "flex", gap: 8, marginBottom: 8 }}
                        >
                          <input
                            type="text"
                            value={ans.answerText}
                            onChange={(e) => {
                              const arr = [...newAnswers];
                              arr[idx].answerText = e.target.value;
                              setNewAnswers(arr);
                            }}
                            placeholder={`Đáp án ${idx + 1}`}
                          />
                          <select
                            value={ans.isCorrect ? "true" : "false"}
                            onChange={(e) => {
                              const arr = [...newAnswers];
                              arr[idx].isCorrect = e.target.value === "true";
                              setNewAnswers(arr);
                            }}
                          >
                            <option value="false">Sai</option>
                            <option value="true">Đúng</option>
                          </select>
                          <button
                            onClick={() =>
                              setNewAnswers(
                                newAnswers.filter((_, i) => i !== idx)
                              )
                            }
                          >
                            🗑️
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() =>
                          setNewAnswers([
                            ...newAnswers,
                            { answerText: "", isCorrect: false },
                          ])
                        }
                      >
                        + Thêm đáp án
                      </button>
                      <div style={{ marginTop: 16 }}>
                        <button
                          className="btn-save"
                          onClick={handleCreateQuestion}
                        >
                          OK
                        </button>
                        <button
                          className="btn-cancel"
                          onClick={() => {
                            setShowAnswerForm(false);
                            setNewQuestion({});
                            setNewAnswers([]);
                          }}
                        >
                          Hủy
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              )}

              {/* Danh sách câu hỏi */}
              {filteredQuestions.map((question, index) => {
                const lessonTitle =
                  question.lesson?.title ||
                  lessons.find((l) => l.lesson_id === question.lessonId)
                    ?.title ||
                  `Bài ${question.lessonId}`;

                const isEditing = editingId === question.id;

                return (
                  <tr key={question.id}>
                    {/* Cột số thứ tự */}
                    <td
                      style={{ cursor: "pointer", color: "#007bff" }}
                      onClick={() => navigate(`/admin/answers?questionId=${question.id}`)}
                    >
                      {index + 1}
                    </td>
                    {/* Cột nội dung câu hỏi */}
                    <td
                      style={{ cursor: "pointer", color: "#007bff" }}
                      onClick={() => navigate(`/admin/answers?questionId=${question.id}`)}
                    >
                      {isEditing ? (
                        <textarea
                          value={editData.questionText || ""}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              questionText: e.target.value,
                            })
                          }
                          className="textarea-field"
                          rows={2}
                        />
                      ) : (
                        question.questionText
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <select
                          value={editData.type || ""}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              type: e.target.value as "practice" | "exam",
                            })
                          }
                          className="select-field"
                        >
                          <option value="practice">Thực hành</option>
                          <option value="exam">Kiểm tra</option>
                        </select>
                      ) : (
                        <span className={`type-badge ${question.type}`}>
                          {question.type === "practice"
                            ? "Thực hành"
                            : "Kiểm tra"}
                        </span>
                      )}
                    </td>
                    <td>
                      {isEditing ? (
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
                          <option value="1">Lớp 1</option>
                          <option value="2">Lớp 2</option>
                          <option value="3">Lớp 3</option>
                          <option value="4">Lớp 4</option>
                          <option value="5">Lớp 5</option>
                        </select>
                      ) : (
                        question.grade
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <select
                          value={editData.lessonId || ""}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              lessonId: Number(e.target.value),
                            })
                          }
                          className="select-field"
                        >
                          {lessons.map((lesson) => (
                            <option
                              key={lesson.lesson_id}
                              value={lesson.lesson_id}
                            >
                              {lesson.title}
                            </option>
                          ))}
                        </select>
                      ) : (
                        lessonTitle
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <input
                          type="url"
                          value={editData.imageUrl || ""}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              imageUrl: e.target.value,
                            })
                          }
                          className="input-field"
                          placeholder="URL hình ảnh"
                        />
                      ) : (
                        <div className="media-cell">
                          {question.imageUrl ? (
                            <span className="media-available">✅</span>
                          ) : (
                            <span className="media-null">❌</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <input
                          type="url"
                          value={editData.audioUrl || ""}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              audioUrl: e.target.value,
                            })
                          }
                          className="input-field"
                          placeholder="URL audio"
                        />
                      ) : (
                        <div className="media-cell">
                          {question.audioUrl ? (
                            <span className="media-available">✅</span>
                          ) : (
                            <span className="media-null">❌</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <select
                          value={editData.answerType || ""}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              answerType: e.target.value as
                                | "choice"
                                | "input"
                                | "drag",
                            })
                          }
                          className="select-field"
                        >
                          <option value="choice">Trắc nghiệm</option>
                          {/* <option value="input">Nhập liệu</option>
                          <option value="drag">Kéo thả</option> */}
                        </select>
                      ) : (
                        <span className="answer-type-badge">
                          {question.answerType === "choice"
                            ? "Trắc nghiệm"
                            : question.answerType === "input"
                            ? "Nhập liệu"
                            : "Kéo thả"}
                        </span>
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editData.explanationText || ""}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              explanationText: e.target.value,
                            })
                          }
                          className="input-field"
                          placeholder="Giải thích"
                        />
                      ) : (
                        <div className="explanation-cell">
                          {question.explanationText ? (
                            <span title={question.explanationText}>
                              {question.explanationText.length > 20
                                ? question.explanationText.substring(0, 20) +
                                  "..."
                                : question.explanationText}
                            </span>
                          ) : (
                            <span className="text-muted">Chưa có</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td>
                      {question.createdAt
                        ? new Date(question.createdAt).toLocaleString("vi-VN")
                        : "-"}
                    </td>
                    <td>
                      {isEditing ? (
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
                            onClick={() => handleEdit(question)}
                          >
                            ✏️
                          </button>
                          <button
                            className="btn-delete"
                            onClick={() => handleDelete(question.id)}
                          >
                            🗑️
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default QuestionAdmin;
