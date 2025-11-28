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
import { uploadImageFile } from "../api/uploadAPI";

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
  const [questionsList, setQuestionsList] = useState<Array<{
    questionText: string;
    imageUrl: string;
    imageFile: File | null;
    explanationText: string;
    answerType: 'choice' | 'fill';
    answers: Array<{ answerText: string; isCorrect: boolean }>;
  }>>([{
    questionText: '',
    imageUrl: '',
    imageFile: null,
    explanationText: '',
    answerType: 'choice',
    answers: [
      { answerText: '', isCorrect: false },
      { answerText: '', isCorrect: false },
      { answerText: '', isCorrect: false },
      { answerText: '', isCorrect: false }
    ]
  }]);

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
    setQuestionsList([{
      questionText: '',
      imageUrl: '',
      imageFile: null,
      explanationText: '',
      answerType: 'choice',
      answers: [
        { answerText: '', isCorrect: false },
        { answerText: '', isCorrect: false },
        { answerText: '', isCorrect: false },
        { answerText: '', isCorrect: false }
      ]
    }]);
  };

  // Thêm câu hỏi thủ công - TẠO MỚI nhiều câu hỏi
  const handleAddManualQuestion = async () => {
    if (!selectedExamId || !selectedExamChapter || !selectedExamGrade) {
      alert("Thiếu thông tin exam!");
      return;
    }
    
    // Validate tất cả câu hỏi
    const validQuestions = questionsList.filter(q => {
      const hasText = q.questionText.trim();
      const validAnswers = q.answers.filter(a => a.answerText.trim());
      const hasCorrect = validAnswers.some(a => a.isCorrect);
      return hasText && validAnswers.length >= 2 && hasCorrect;
    });
    
    if (validQuestions.length === 0) {
      alert("Vui lòng nhập ít nhất 1 câu hỏi hợp lệ!\n(Cần: nội dung, min 2 đáp án, 1 đáp án đúng)");
      return;
    }
    
    try {
      // Lấy lesson từ chapter
      const lesson = lessons.find(l => l.chapterId === selectedExamChapter);
      if (!lesson) {
        alert("Không tìm thấy bài học cho chương này!");
        return;
      }
      
      let createdCount = 0;
      
      for (const q of validQuestions) {
        // Upload hình ảnh nếu có file
        let imageUrl = q.imageUrl;
        if (q.imageFile) {
          imageUrl = await uploadImageFile(q.imageFile);
        }
        
        const validAnswers = q.answers.filter(a => a.answerText.trim());
        
        // Tạo câu hỏi
        const questionData = {
          questionText: q.questionText,
          imageUrl: imageUrl || undefined,
          explanationText: q.explanationText || undefined,
          grade: selectedExamGrade,
          type: 'exam',
          answerType: q.answerType,
          lessonId: lesson.id,
          answers: validAnswers
        };
        
        const createRes = await createQuestionWithAnswers(questionData);
        const newQuestionId = createRes.data?.question?.id || createRes.data?.id || createRes.question?.id || createRes.id;
        
        if (!newQuestionId) {
          console.error("Không lấy được ID câu hỏi:", createRes);
          continue;
        }
        
        // Thêm vào exam
        await addQuestionToExam({ examId: selectedExamId, questionId: newQuestionId });
        createdCount++;
      }
      
      alert(`✅ Đã tạo và thêm ${createdCount}/${validQuestions.length} câu hỏi vào đề thi!`);
      
      // Reset form
      setQuestionsList([{
        questionText: '',
        imageUrl: '',
        imageFile: null,
        explanationText: '',
        answerType: 'choice',
        answers: [
          { answerText: '', isCorrect: false },
          { answerText: '', isCorrect: false },
          { answerText: '', isCorrect: false },
          { answerText: '', isCorrect: false }
        ]
      }]);
      
      loadExamQuestions(selectedExamId);
      const examsRes = await fetchAllExams();
      setExams(examsRes.data?.exams || examsRes.exams || []);
      
      // Reload allQuestions
      const questionsRes = await fetchAllQuestions();
      setAllQuestions(questionsRes.data?.questions || questionsRes.questions || []);
    } catch (err: any) {
      console.error("Error creating questions:", err);
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
  const handleRemoveQuestion = async (questionId: number) => {
    if (!selectedExamId) return;
    if (!window.confirm("Bạn có chắc muốn xóa câu hỏi này khỏi đề thi?")) return;
    try {
      await removeQuestionFromExam(selectedExamId, questionId);
      alert("✅ Đã xóa câu hỏi!");
      loadExamQuestions(selectedExamId);
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
            <h1>Danh sách bài kiểm tra</h1>
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
                  
                  {/* Chế độ chỉnh sửa */}
                  {editingId === exam.id ? (
                    <>
                      <td>
                        <input
                          type="text"
                          value={editData.title || ''}
                          onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                          placeholder="Tiêu đề"
                          style={{ width: '100%', padding: '4px' }}
                        />
                      </td>
                      <td>
                        <select
                          value={editData.grade || ''}
                          onChange={(e) => setEditData({ ...editData, grade: Number(e.target.value) })}
                          style={{ width: '100%', padding: '4px' }}
                        >
                          <option value="">Chọn lớp</option>
                          {[1, 2, 3, 4, 5].map(g => (
                            <option key={g} value={g}>Lớp {g}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          type="number"
                          value={editData.durationMinutes || ''}
                          onChange={(e) => setEditData({ ...editData, durationMinutes: Number(e.target.value) })}
                          placeholder="Phút"
                          style={{ width: '100%', padding: '4px' }}
                        />
                      </td>
                      <td>
                        <select
                          value={editData.chapterId || ''}
                          onChange={(e) => setEditData({ ...editData, chapterId: Number(e.target.value) })}
                          style={{ width: '100%', padding: '4px' }}
                        >
                          <option value="">Chọn chương</option>
                          {chapters
                            .filter(ch => ch.grade === editData.grade)
                            .map(chapter => (
                              <option key={chapter.id} value={chapter.id}>
                                {chapter.title}
                              </option>
                            ))}
                        </select>
                      </td>
                      <td>{getQuestionCount(exam)} câu</td>
                      <td>{formatDateTime(exam.createdAt)}</td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn-save" onClick={handleSave} title="Lưu thay đổi">
                            💾
                          </button>
                          <button className="btn-cancel" onClick={handleCancel} title="Hủy chỉnh sửa">
                            ❌
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
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
                          <button className="btn-edit" onClick={() => handleEdit(exam)} title="Chỉnh sửa bài kiểm tra">
                            ✏️
                          </button>
                          <button className="btn-delete" onClick={() => handleDelete(exam.id)} title="Xóa bài kiểm tra">
                            🗑️
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal Quản lý câu hỏi */}
        {showQuestionManager && selectedExamId && (
          <div className="exam-modal-overlay">
            <div className="exam-modal-content">
              <div className="exam-modal-header">
                <h2>
                  📝 Quản lý câu hỏi - {selectedExamTitle}
                  {isNewExam && <span style={{ color: '#4caf50', fontSize: '14px', marginLeft: '8px' }}>(Mới tạo)</span>}
                </h2>
              </div>
              
              {/* Tabs chọn chế độ thêm */}
              <div className="exam-modal-tabs">
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

              {/* Chế độ nhập tay - TẠO NHIỀU CÂU HỎI MỚI */}
              {addMode === 'manual' && (
                <div className="exam-form-section">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h4>Tạo câu hỏi mới ({questionsList.length} câu)</h4>
                    <button
                      onClick={() => setQuestionsList([...questionsList, {
                        questionText: '',
                        imageUrl: '',
                        imageFile: null,
                        explanationText: '',
                        answerType: 'choice',
                        answers: [
                          { answerText: '', isCorrect: false },
                          { answerText: '', isCorrect: false },
                          { answerText: '', isCorrect: false },
                          { answerText: '', isCorrect: false }
                        ]
                      }])}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#2196f3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      ➕ Thêm câu hỏi
                    </button>
                  </div>
                  
                  <p style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>
                    Lớp: {selectedExamGrade} | Chương: {getChapterTitle(selectedExamChapter || 0)} | Loại: Exam
                  </p>
                  
                  {questionsList.map((question, qIndex) => (
                    <div key={qIndex} style={{ padding: '12px', backgroundColor: 'white', borderRadius: '4px', marginBottom: '12px', border: '2px solid #ddd' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <strong>Câu hỏi #{qIndex + 1}</strong>
                        {questionsList.length > 1 && (
                          <button
                            onClick={() => setQuestionsList(questionsList.filter((_, i) => i !== qIndex))}
                            style={{
                              padding: '4px 8px',
                              backgroundColor: '#f44336',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '11px'
                            }}
                          >
                            🗑️ Xóa
                          </button>
                        )}
                      </div>
                      
                      {/* Nội dung câu hỏi */}
                      <div className="exam-form-group">
                        <label>Nội dung *</label>
                        <textarea
                          value={question.questionText}
                          onChange={(e) => {
                            const updated = [...questionsList];
                            updated[qIndex].questionText = e.target.value;
                            setQuestionsList(updated);
                          }}
                          placeholder="Nhập nội dung câu hỏi..."
                          style={{ minHeight: '50px' }}
                        />
                      </div>
                      
                      {/* Upload hình ảnh */}
                      <div className="exam-form-group">
                        <label>Hình ảnh</label>
                        <div className="exam-upload-zone">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const updated = [...questionsList];
                                updated[qIndex].imageFile = file;
                                updated[qIndex].imageUrl = '';
                                setQuestionsList(updated);
                              }
                            }}
                          />
                          {question.imageFile && (
                            <p style={{ fontSize: '11px', color: '#4caf50', marginTop: '4px' }}>
                              ✓ {question.imageFile.name}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {/* Lời giải */}
                      <div className="exam-form-group">
                        <label>Lời giải (tùy chọn)</label>
                        <textarea
                          value={question.explanationText}
                          onChange={(e) => {
                            const updated = [...questionsList];
                            updated[qIndex].explanationText = e.target.value;
                            setQuestionsList(updated);
                          }}
                          placeholder="Nhập lời giải..."
                          style={{ minHeight: '40px' }}
                        />
                      </div>
                      
                      {/* Loại đáp án */}
                      <div className="exam-form-group">
                        <label>Loại đáp án</label>
                        <select
                          value={question.answerType}
                          onChange={(e) => {
                            const updated = [...questionsList];
                            updated[qIndex].answerType = e.target.value as 'choice' | 'fill';
                            setQuestionsList(updated);
                          }}
                          title="Loại đáp án"
                        >
                          <option value="choice">Trắc nghiệm</option>
                          <option value="fill">Điền vào chỗ trống</option>
                        </select>
                      </div>
                      
                      {/* Danh sách đáp án */}
                      <div className="exam-form-group">
                        <label>Đáp án * (min 2)</label>
                        {question.answers.map((answer, aIndex) => (
                          <div key={aIndex} style={{ display: 'flex', gap: '6px', marginBottom: '6px', alignItems: 'center' }}>
                            <select
                              value={answer.isCorrect ? 'true' : 'false'}
                              onChange={(e) => {
                                const updated = [...questionsList];
                                updated[qIndex].answers[aIndex].isCorrect = e.target.value === 'true';
                                setQuestionsList(updated);
                              }}
                              style={{ width: '80px' }}
                            >
                              <option value="false">Sai</option>
                              <option value="true">Đúng</option>
                            </select>
                            <input
                              type="text"
                              value={answer.answerText}
                              onChange={(e) => {
                                const updated = [...questionsList];
                                updated[qIndex].answers[aIndex].answerText = e.target.value;
                                setQuestionsList(updated);
                              }}
                              placeholder={`Đáp án ${aIndex + 1}`}
                              style={{ flex: 1 }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  <button
                    onClick={handleAddManualQuestion}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#4caf50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      width: '100%',
                      fontWeight: 'bold',
                      fontSize: '14px'
                    }}
                  >
                    ✅ Tạo và thêm {questionsList.length} câu hỏi vào đề thi
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
                <div className="exam-form-section">
                  <h4>Lấy câu hỏi ngẫu nhiên</h4>
                  <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                    Sẽ lấy ngẫu nhiên từ câu hỏi loại "Exam" thuộc chương: {getChapterTitle(selectedExamChapter || 0)}
                  </p>
                  <div className="exam-form-group">
                    <label>Số câu hỏi:</label>
                    <input
                      type="number"
                      value={randomCount}
                      onChange={(e) => setRandomCount(Number(e.target.value))}
                      min="1"
                      max="100"
                      placeholder="Nhập số câu hỏi muốn lấy"
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

              <div className="exam-form-section">
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
                        alignItems: 'center',
                        textAlign: 'left'
                      }}
                    >
                      <span>
                        <strong>Câu {idx + 1}:</strong> ID {eq.id || eq.questionId} 
                        {eq.questionText && ` - ${eq.questionText}`}
                      </span>
                      <button
                        onClick={() => handleRemoveQuestion(eq.id || eq.questionId)}
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

              <div className="exam-modal-footer">
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