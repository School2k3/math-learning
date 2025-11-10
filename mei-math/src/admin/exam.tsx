import React, { useState, useEffect } from "react";
import "../css/admin-css/exam.css";
import { Link } from "react-router-dom";
import { 
  fetchAllExams, 
  createExam, 
  updateExamById, 
  deleteExamById,
  fetchExamQuestions,
  addQuestionToExam,
  removeQuestionFromExam
} from "../api/examAPI";
import { fetchAllChapters } from "../api/chapterAPI";
import { fetchAllQuestions, createQuestionWithAnswers } from "../api/questionAPI";
import { fetchAllLessons } from "../api/lessonAPI";

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
  id: number;
  title: string;
  grade: number;
  volume: number;
}

interface Lesson {
  id: number;
  title: string;
  chapterId: number;
}

const ExamAdmin: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Exam>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newExam, setNewExam] = useState<Partial<Exam>>({});
  const [filterGrade, setFilterGrade] = useState("all");
  const [filterChapter, setFilterChapter] = useState("all");
  
  // State quản lý câu hỏi
  const [selectedExamId, setSelectedExamId] = useState<number | null>(null);
  const [selectedExamTitle, setSelectedExamTitle] = useState<string>('');
  const [selectedExamChapter, setSelectedExamChapter] = useState<number | null>(null);
  const [selectedExamGrade, setSelectedExamGrade] = useState<number | null>(null);
  const [examQuestions, setExamQuestions] = useState<any[]>([]);
  const [allQuestions, setAllQuestions] = useState<any[]>([]);
  const [showQuestionManager, setShowQuestionManager] = useState(false);
  const [addMode, setAddMode] = useState<'manual' | 'bank' | 'random'>('bank');
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);
  const [randomCount, setRandomCount] = useState(10);
  const [isNewExam, setIsNewExam] = useState(false); // Track nếu là exam mới tạo
  
  // State cho form tạo câu hỏi mới (manual mode)
  const [newQuestion, setNewQuestion] = useState({
    questionText: '',
    imageUrl: '',
    explanationText: '',
    answerType: 'choice' as 'choice' | 'fill',
    answers: [
      { answerText: '', isCorrect: false },
      { answerText: '', isCorrect: false },
      { answerText: '', isCorrect: false },
      { answerText: '', isCorrect: false }
    ]
  });

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

  // Load lessons để map lesson → chapter
  useEffect(() => {
    const loadLessons = async () => {
      try {
        const res = await fetchAllLessons();
        setLessons(res.lessons || []);
      } catch (err) {
        console.error("Failed to load lessons", err);
      }
    };
    loadLessons();
  }, []);

  // Load tất cả câu hỏi để hiển thị trong ngân hàng
  useEffect(() => {
    const loadAllQuestions = async () => {
      try {
        const res = await fetchAllQuestions();
        setAllQuestions(res.data?.questions || res.questions || []);
      } catch (err) {
        console.error("Failed to load questions", err);
      }
    };
    loadAllQuestions();
  }, []);

  // Reset filter chương khi đổi lớp
  useEffect(() => {
    if (filterGrade !== 'all') {
      // Kiểm tra xem chương hiện tại có thuộc lớp mới không
      const currentChapter = chapters.find(ch => ch.id === Number(filterChapter));
      if (currentChapter && currentChapter.grade !== Number(filterGrade)) {
        setFilterChapter('all');
      }
    }
  }, [filterGrade, chapters, filterChapter]);

  // Load câu hỏi của exam khi mở modal
  useEffect(() => {
    if (selectedExamId && showQuestionManager) {
      loadExamQuestions(selectedExamId);
    }
  }, [selectedExamId, showQuestionManager]);

  const loadExamQuestions = async (examId: number) => {
    try {
      const res = await fetchExamQuestions(examId);
      console.log("loadExamQuestions response:", res);
      // API trả về: { success: true, message: "...", data: { questions: [...] } }
      setExamQuestions(res.data?.questions || []);
    } catch (err) {
      console.error("Failed to load exam questions", err);
      setExamQuestions([]);
    }
  };

  // Mở modal quản lý câu hỏi
  const openQuestionManager = (examId: number) => {
    const exam = exams.find(e => e.id === examId);
    setSelectedExamId(examId);
    setSelectedExamTitle(exam?.title || '');
    setSelectedExamChapter(exam?.chapterId || null);
    setSelectedExamGrade(exam?.grade || null);
    setIsNewExam(false);
    setShowQuestionManager(true);
    setAddMode('bank');
  };

  // Đóng modal
  const closeQuestionManager = () => {
    setShowQuestionManager(false);
    setSelectedExamId(null);
    setSelectedExamTitle('');
    setSelectedExamChapter(null);
    setSelectedExamGrade(null);
    setSelectedQuestions([]);
    setAddMode('bank');
    setIsNewExam(false);
    // Reset form tạo câu hỏi mới
    setNewQuestion({
      questionText: '',
      imageUrl: '',
      explanationText: '',
      answerType: 'choice',
      answers: [
        { answerText: '', isCorrect: false },
        { answerText: '', isCorrect: false },
        { answerText: '', isCorrect: false },
        { answerText: '', isCorrect: false }
      ]
    });
  };

  // Thêm câu hỏi thủ công - TẠO MỚI câu hỏi
  const handleAddManualQuestion = async () => {
    if (!selectedExamId || !selectedExamChapter || !selectedExamGrade) {
      alert("Thiếu thông tin exam!");
      return;
    }
    
    if (!newQuestion.questionText.trim()) {
      alert("Vui lòng nhập nội dung câu hỏi!");
      return;
    }
    
    // Kiểm tra đáp án
    const validAnswers = newQuestion.answers.filter(a => a.answerText.trim());
    if (validAnswers.length < 2) {
      alert("Vui lòng nhập ít nhất 2 đáp án!");
      return;
    }
    
    const hasCorrectAnswer = validAnswers.some(a => a.isCorrect);
    if (!hasCorrectAnswer) {
      alert("Vui lòng đánh dấu đáp án đúng!");
      return;
    }
    
    try {
      // Lấy lesson từ chapter
      const lesson = lessons.find(l => l.chapterId === selectedExamChapter);
      if (!lesson) {
        alert("Không tìm thấy bài học cho chương này!");
        return;
      }
      
      // 1. Tạo câu hỏi mới
      const questionData = {
        questionText: newQuestion.questionText,
        imageUrl: newQuestion.imageUrl || undefined,
        explanationText: newQuestion.explanationText || undefined,
        grade: selectedExamGrade,
        type: 'exam',
        answerType: newQuestion.answerType,
        lessonId: lesson.id,
        answers: validAnswers
      };
      
      const createRes = await createQuestionWithAnswers(questionData);
      const newQuestionId = createRes.data?.question?.id || createRes.data?.id || createRes.question?.id || createRes.id;
      
      if (!newQuestionId) {
        throw new Error("Không lấy được ID câu hỏi vừa tạo");
      }
      
      // 2. Thêm câu hỏi vào exam
      await addQuestionToExam({ examId: selectedExamId, questionId: newQuestionId });
      
      alert("✅ Đã tạo và thêm câu hỏi mới vào đề thi!");
      
      // Reset form
      setNewQuestion({
        questionText: '',
        imageUrl: '',
        explanationText: '',
        answerType: 'choice',
        answers: [
          { answerText: '', isCorrect: false },
          { answerText: '', isCorrect: false },
          { answerText: '', isCorrect: false },
          { answerText: '', isCorrect: false }
        ]
      });
      
      loadExamQuestions(selectedExamId);
      const examsRes = await fetchAllExams();
      setExams(examsRes.data?.exams || examsRes.exams || []);
      
      // Reload allQuestions để cập nhật danh sách
      const questionsRes = await fetchAllQuestions();
      setAllQuestions(questionsRes.data?.questions || questionsRes.questions || []);
    } catch (err: any) {
      console.error("Error creating question:", err);
      alert(`❌ Lỗi: ${err.message || 'Không thể tạo câu hỏi'}`);
    }
  };

  // Thêm câu hỏi từ ngân hàng
  const handleAddFromBank = async () => {
    if (!selectedExamId || selectedQuestions.length === 0) {
      alert("Vui lòng chọn ít nhất 1 câu hỏi!");
      return;
    }
    
    try {
      for (const qId of selectedQuestions) {
        await addQuestionToExam({ examId: selectedExamId, questionId: qId });
      }
      alert(`✅ Đã thêm ${selectedQuestions.length} câu hỏi vào đề thi!`);
      setSelectedQuestions([]);
      loadExamQuestions(selectedExamId);
      const examsRes = await fetchAllExams();
      setExams(examsRes.data?.exams || examsRes.exams || []);
    } catch (err) {
      alert("❌ Lỗi khi thêm câu hỏi!");
    }
  };

  // Thêm câu hỏi ngẫu nhiên
  const handleAddRandom = async () => {
    if (!selectedExamId || randomCount <= 0) {
      alert("Vui lòng nhập số lượng câu hỏi hợp lệ!");
      return;
    }
    try {
      // Lấy danh sách ID câu hỏi đã có trong exam
      const existingQuestionIds = examQuestions.map(eq => eq.id);
      
      // Lọc câu hỏi theo chương của exam và type="exam", loại trừ câu đã có
      let filtered = allQuestions.filter(q => {
        const questionChapter = getQuestionChapter(q);
        const matchChapter = selectedExamChapter ? questionChapter === selectedExamChapter : true;
        const matchType = q.type === 'exam' || q.type === 'Exam' || q.type === 'EXAM';
        const notDuplicate = !existingQuestionIds.includes(q.id);
        return matchChapter && matchType && notDuplicate;
      });
      
      if (filtered.length === 0) {
        alert("Không tìm thấy câu hỏi phù hợp hoặc tất cả câu hỏi đã được thêm vào đề!");
        return;
      }
      
      // Lấy ngẫu nhiên
      const shuffled = [...filtered].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, Math.min(randomCount, shuffled.length));
      
      for (const q of selected) {
        await addQuestionToExam({ examId: selectedExamId, questionId: q.id || q.question_id });
      }
      
      alert(`✅ Đã thêm ${selected.length} câu hỏi ngẫu nhiên vào đề thi!`);
      loadExamQuestions(selectedExamId);
      const examsRes = await fetchAllExams();
      setExams(examsRes.data?.exams || examsRes.exams || []);
    } catch (err) {
      alert("❌ Lỗi khi thêm câu hỏi!");
    }
  };

  // Xóa câu hỏi khỏi exam
  const handleRemoveQuestion = async (examQuestionId: number) => {
    if (!window.confirm("Bạn có chắc muốn xóa câu hỏi này khỏi đề thi?")) return;
    try {
      await removeQuestionFromExam(examQuestionId);
      alert("✅ Đã xóa câu hỏi!");
      if (selectedExamId) {
        loadExamQuestions(selectedExamId);
      }
      const examsRes = await fetchAllExams();
      setExams(examsRes.data?.exams || examsRes.exams || []);
    } catch (err) {
      alert("❌ Lỗi khi xóa câu hỏi!");
    }
  };

  // Toggle chọn câu hỏi từ ngân hàng
  const toggleQuestionSelection = (qId: number) => {
    if (selectedQuestions.includes(qId)) {
      setSelectedQuestions(selectedQuestions.filter(id => id !== qId));
    } else {
      setSelectedQuestions([...selectedQuestions, qId]);
    }
  };

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

  // Đếm số câu hỏi trong bài kiểm tra
  const getQuestionCount = (exam: Exam) => exam.examQuestions?.length || 0;

  // Lấy tên chương theo ID
  const getChapterTitle = (chapterId: number) => {
    const chapter = chapters.find(c => c.id === chapterId);
    return chapter ? `${chapter.title} (Lớp ${chapter.grade} - HK${chapter.volume})` : `Chương ${chapterId}`;
  };

  // Lấy chương của câu hỏi thông qua lesson
  const getQuestionChapter = (question: any): number | null => {
    const lesson = lessons.find(l => l.id === question.lesson_id || l.id === question.lessonId);
    return lesson ? lesson.chapterId : null;
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
      const createdExam = res.data || res.exam || res;
      setExams([...exams, createdExam]);
      setShowAddForm(false);
      
      // Sau khi tạo exam thành công → Mở modal thêm câu hỏi
      setSelectedExamId(createdExam.id);
      setSelectedExamTitle(createdExam.title);
      setSelectedExamChapter(createdExam.chapterId);
      setSelectedExamGrade(createdExam.grade);
      setIsNewExam(true);
      setShowQuestionManager(true);
      setAddMode('bank'); // Mặc định chế độ ngân hàng
      setNewExam({});
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
            onClick={() => {
              // Pre-fill với giá trị filter hiện tại
              setNewExam({
                grade: filterGrade !== 'all' ? Number(filterGrade) : undefined,
                chapterId: filterChapter !== 'all' ? Number(filterChapter) : undefined
              });
              setShowAddForm(true);
            }}
          >
            + Thêm mới
          </button>
        </div>

        {/* Thanh lọc */}
        <div className="exam-filters">
          <div className="filter-group">
            <label>Lớp:</label>
            <select value={filterGrade} onChange={e => setFilterGrade(e.target.value)} title="Chọn lớp">
              <option value="all">Tất cả</option>
              {[1,2,3,4,5].map(g => (
                <option key={g} value={g}>Lớp {g}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Chương:</label>
            <select value={filterChapter} onChange={e => setFilterChapter(e.target.value)} title="Chọn chương">
              <option value="all">Tất cả</option>
              {chapters
                .filter(ch => filterGrade === "all" || ch.grade === Number(filterGrade))
                .map(ch => (
                  <option key={ch.id} value={ch.id}>{ch.title}</option>
                ))}
            </select>
          </div>
        </div>

        {/* Exam List */}
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
                      onChange={(e) => setNewExam({...newExam, grade: Number(e.target.value), chapterId: undefined})}
                      className="select-field"
                      title="Chọn lớp"
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
                      title="Chọn chương"
                    >
                      <option value="">Chọn chương</option>
                      {filteredChaptersForAdd.map(chapter => (
                        <option key={chapter.id} value={chapter.id}>
                          {chapter.title}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>-</td>
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
                      <button 
                        className="btn-manage" 
                        onClick={() => openQuestionManager(exam.id)}
                        title="Quản lý câu hỏi"
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#2196f3',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '13px'
                        }}
                      >
                        📝 Câu hỏi
                      </button>
                      <button className="btn-edit" onClick={() => handleEdit(exam)}>
                        ✏️
                      </button>
                      <button className="btn-delete" onClick={() => handleDelete(exam.id)}>
                        �️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal Quản lý câu hỏi */}
        {showQuestionManager && selectedExamId && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '24px',
              maxWidth: '900px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto'
            }}>
              <h2 style={{ marginBottom: '20px' }}>
                📝 Quản lý câu hỏi - {selectedExamTitle}
                {isNewExam && <span style={{ color: '#4caf50', fontSize: '14px', marginLeft: '8px' }}>(Mới tạo)</span>}
              </h2>
              
              {/* Tabs chọn chế độ thêm */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                <button
                  onClick={() => setAddMode('manual')}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: addMode === 'manual' ? '#4caf50' : '#e0e0e0',
                    color: addMode === 'manual' ? 'white' : 'black',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  ✍️ Nhập tay
                </button>
                <button
                  onClick={() => setAddMode('bank')}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: addMode === 'bank' ? '#2196f3' : '#e0e0e0',
                    color: addMode === 'bank' ? 'white' : 'black',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  🏦 Từ ngân hàng
                </button>
                <button
                  onClick={() => setAddMode('random')}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: addMode === 'random' ? '#ff9800' : '#e0e0e0',
                    color: addMode === 'random' ? 'white' : 'black',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  🎲 Ngẫu nhiên
                </button>
              </div>

              {/* Chế độ nhập tay - TẠO CÂU HỎI MỚI */}
              {addMode === 'manual' && (
                <div style={{ padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '4px', marginBottom: '20px', maxHeight: '500px', overflow: 'auto' }}>
                  <h4>Tạo câu hỏi mới</h4>
                  <p style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>
                    Lớp: {selectedExamGrade} | Chương: {getChapterTitle(selectedExamChapter || 0)} | Loại: Exam
                  </p>
                  
                  {/* Nội dung câu hỏi */}
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Nội dung câu hỏi *</label>
                    <textarea
                      value={newQuestion.questionText}
                      onChange={(e) => setNewQuestion({...newQuestion, questionText: e.target.value})}
                      placeholder="Nhập nội dung câu hỏi..."
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', minHeight: '60px' }}
                    />
                  </div>
                  
                  {/* Link hình ảnh */}
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', marginBottom: '4px' }}>Link hình ảnh (tùy chọn)</label>
                    <input
                      type="text"
                      value={newQuestion.imageUrl}
                      onChange={(e) => setNewQuestion({...newQuestion, imageUrl: e.target.value})}
                      placeholder="https://..."
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                  </div>
                  
                  {/* Lời giải */}
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', marginBottom: '4px' }}>Lời giải (tùy chọn)</label>
                    <textarea
                      value={newQuestion.explanationText}
                      onChange={(e) => setNewQuestion({...newQuestion, explanationText: e.target.value})}
                      placeholder="Nhập lời giải..."
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', minHeight: '50px' }}
                    />
                  </div>
                  
                  {/* Loại đáp án */}
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', marginBottom: '4px' }}>Loại đáp án</label>
                    <select
                      value={newQuestion.answerType}
                      onChange={(e) => setNewQuestion({...newQuestion, answerType: e.target.value as 'choice' | 'fill'})}
                      style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                      title="Loại đáp án"
                    >
                      <option value="choice">Trắc nghiệm</option>
                      <option value="fill">Điền vào chỗ trống</option>
                    </select>
                  </div>
                  
                  {/* Danh sách đáp án */}
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Đáp án * (tối thiểu 2 đáp án)</label>
                    {newQuestion.answers.map((answer, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                        <input
                          type="checkbox"
                          checked={answer.isCorrect}
                          onChange={(e) => {
                            const updated = [...newQuestion.answers];
                            updated[idx].isCorrect = e.target.checked;
                            setNewQuestion({...newQuestion, answers: updated});
                          }}
                          title="Đáp án đúng"
                        />
                        <input
                          type="text"
                          value={answer.answerText}
                          onChange={(e) => {
                            const updated = [...newQuestion.answers];
                            updated[idx].answerText = e.target.value;
                            setNewQuestion({...newQuestion, answers: updated});
                          }}
                          placeholder={`Đáp án ${idx + 1}`}
                          style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                        />
                      </div>
                    ))}
                  </div>
                  
                  <button
                    onClick={handleAddManualQuestion}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#4caf50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      width: '100%',
                      fontWeight: 'bold'
                    }}
                  >
                    ✅ Tạo và thêm câu hỏi vào đề thi
                  </button>
                </div>
              )}

              {/* Chế độ chọn từ ngân hàng */}
              {addMode === 'bank' && (
                <div style={{ padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '4px', marginBottom: '20px' }}>
                  <h4>Ngân hàng câu hỏi - Chương: {getChapterTitle(selectedExamChapter || 0)}</h4>
                  <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                    Chỉ hiển thị câu hỏi loại "Exam" chưa có trong đề thi
                  </p>
                  <div style={{ marginTop: '12px', maxHeight: '300px', overflow: 'auto' }}>
                    {allQuestions
                      .filter(q => {
                        const questionChapter = getQuestionChapter(q);
                        const matchChapter = selectedExamChapter ? questionChapter === selectedExamChapter : true;
                        const matchType = q.type === 'exam' || q.type === 'Exam' || q.type === 'EXAM';
                        // Loại bỏ câu hỏi đã có trong exam
                        const notInExam = !examQuestions.some(eq => eq.id === q.id);
                        return matchChapter && matchType && notInExam;
                      })
                      .map((q) => (
                        <div
                          key={q.id || q.question_id}
                          style={{
                            padding: '8px',
                            marginBottom: '8px',
                            backgroundColor: selectedQuestions.includes(q.id || q.question_id) ? '#e3f2fd' : 'white',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                          onClick={() => toggleQuestionSelection(q.id || q.question_id)}
                        >
                          <span>
                            <strong>ID {q.id || q.question_id}:</strong> {q.questionText || q.question_text} 
                            <span style={{ marginLeft: '8px', fontSize: '12px', color: '#666' }}>
                              (Lớp {q.grade}, Bài {q.lesson_id}, Type: {q.type})
                            </span>
                          </span>
                          {selectedQuestions.includes(q.id || q.question_id) && <span>✅</span>}
                        </div>
                      ))}
                  </div>
                  <button
                    onClick={handleAddFromBank}
                    style={{
                      marginTop: '12px',
                      padding: '8px 16px',
                      backgroundColor: '#2196f3',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                    disabled={selectedQuestions.length === 0}
                  >
                    ➕ Thêm {selectedQuestions.length} câu đã chọn
                  </button>
                </div>
              )}

              {/* Chế độ ngẫu nhiên */}
              {addMode === 'random' && (
                <div style={{ padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '4px', marginBottom: '20px' }}>
                  <h4>Lấy câu hỏi ngẫu nhiên</h4>
                  <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                    Sẽ lấy ngẫu nhiên từ câu hỏi loại "Exam" thuộc chương: {getChapterTitle(selectedExamChapter || 0)}
                  </p>
                  <div style={{ marginTop: '12px' }}>
                    <label style={{ display: 'block', marginBottom: '4px' }}>Số câu hỏi:</label>
                    <input
                      type="number"
                      value={randomCount}
                      onChange={(e) => setRandomCount(Number(e.target.value))}
                      min="1"
                      max="100"
                      placeholder="Nhập số câu hỏi muốn lấy"
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                  </div>
                  <button
                    onClick={handleAddRandom}
                    style={{
                      marginTop: '12px',
                      padding: '8px 16px',
                      backgroundColor: '#ff9800',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    🎲 Lấy ngẫu nhiên
                  </button>
                </div>
              )}

              {/* Danh sách câu hỏi trong exam */}
              <div>
                <h4>Câu hỏi trong đề ({examQuestions.length} câu)</h4>
                <div style={{ marginTop: '12px', maxHeight: '300px', overflow: 'auto' }}>
                  {examQuestions.map((eq, idx) => (
                    <div
                      key={eq.id}
                      style={{
                        padding: '12px',
                        marginBottom: '8px',
                        backgroundColor: 'white',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <span>
                        <strong>Câu {idx + 1}:</strong> ID {eq.questionId} 
                        {eq.questionText && ` - ${eq.questionText}`}
                      </span>
                      <button
                        onClick={() => handleRemoveQuestion(eq.id)}
                        style={{
                          padding: '4px 12px',
                          backgroundColor: '#f44336',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        🗑️ Xóa
                      </button>
                    </div>
                  ))}
                  {examQuestions.length === 0 && (
                    <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                      Chưa có câu hỏi nào trong đề thi này
                    </p>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', gap: '8px' }}>
                <button
                  onClick={closeQuestionManager}
                  style={{
                    padding: '8px 24px',
                    backgroundColor: '#666',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamAdmin;