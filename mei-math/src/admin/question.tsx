import React, { useState, useEffect } from "react";
import "../css/admin-css/question.css";
import { Link, useNavigate } from "react-router-dom";
import { fetchQuestionsByGradeTypeAnswerType } from "../api/questionAPI";
import { fetchAllLessons } from "../api/lessonAPI";
import { fetchAllChapters } from "../api/chapterAPI";
import { createQuestionWithAnswers } from "../api/questionAPI";
import { deleteQuestionById } from "../api/questionAPI";
import { updateQuestionById } from "../api/questionAPI";
import { uploadImageFile, uploadAudioFile } from "../api/uploadAPI";

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
  const [newQuestion, setNewQuestion] = useState<Partial<Question>>({});
  const [newAnswers, setNewAnswers] = useState<
    { answerText: string; isCorrect: boolean }[]
  >([]);
  const [questionQuantity, setQuestionQuantity] = useState(1);
  
  // State cho multiple questions - mỗi câu có form riêng
  const [multipleQuestions, setMultipleQuestions] = useState<{
    questionText: string;
    imageUrl: string;
    audioUrl: string;
    explanationText: string;
    explanationImg: string;
    answers: { answerText: string; isCorrect: boolean }[];
  }[]>([]);

  const [filterType, setFilterType] = useState<string>("all");
  const [filterGrade, setFilterGrade] = useState("all");
  const [filterChapter, setFilterChapter] = useState("all");
  const [filterLesson, setFilterLesson] = useState("all");
  const [filterAnswerType, setFilterAnswerType] = useState<string>("all");
  const navigate = useNavigate();

  // Upload states
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [uploadingExplanationImg, setUploadingExplanationImg] = useState(false);
  
  // Upload states for edit mode
  const [uploadingEditImage, setUploadingEditImage] = useState(false);
  const [uploadingEditAudio, setUploadingEditAudio] = useState(false);
  const [uploadingEditExplanationImg, setUploadingEditExplanationImg] = useState(false);

  // Preview modal state
  const [previewMedia, setPreviewMedia] = useState<{type: 'image' | 'audio', url: string} | null>(null);

  // Hàm upload ảnh câu hỏi
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, questionIndex?: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file ảnh!');
      return;
    }

    try {
      setUploadingImage(true);
      const url = await uploadImageFile(file);
      
      // Nếu có questionIndex, update vào multipleQuestions
      if (questionIndex !== undefined) {
        updateQuestionField(questionIndex, 'imageUrl', url);
      } else {
        setNewQuestion({ ...newQuestion, imageUrl: url });
      }
      
      alert('Upload ảnh thành công!');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload ảnh thất bại!');
    } finally {
      setUploadingImage(false);
    }
  };

  // Hàm upload video/audio
  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>, questionIndex?: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/') && !file.type.startsWith('video/')) {
      alert('Vui lòng chọn file audio hoặc video!');
      return;
    }

    try {
      setUploadingAudio(true);
      const url = await uploadAudioFile(file);
      
      // Nếu có questionIndex, update vào multipleQuestions
      if (questionIndex !== undefined) {
        updateQuestionField(questionIndex, 'audioUrl', url);
      } else {
        setNewQuestion({ ...newQuestion, audioUrl: url });
      }
      
      alert('Upload audio thành công!');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload audio thất bại!');
    } finally {
      setUploadingAudio(false);
    }
  };

  // Hàm upload ảnh giải thích
  const handleExplanationImgUpload = async (e: React.ChangeEvent<HTMLInputElement>, questionIndex?: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file ảnh!');
      return;
    }

    try {
      setUploadingExplanationImg(true);
      const url = await uploadImageFile(file);
      
      // Nếu có questionIndex, update vào multipleQuestions
      if (questionIndex !== undefined) {
        updateQuestionField(questionIndex, 'explanationImg', url);
      } else {
        setNewQuestion({ ...newQuestion, explanationImg: url });
      }
      
      alert('Upload ảnh giải thích thành công!');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload ảnh giải thích thất bại!');
    } finally {
      setUploadingExplanationImg(false);
    }
  };

  // Hàm upload cho edit mode
  const handleEditImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file ảnh!');
      return;
    }

    try {
      setUploadingEditImage(true);
      const url = await uploadImageFile(file);
      setEditData({ ...editData, imageUrl: url });
      alert('Upload ảnh thành công!');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload ảnh thất bại!');
    } finally {
      setUploadingEditImage(false);
    }
  };

  const handleEditAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/') && !file.type.startsWith('video/')) {
      alert('Vui lòng chọn file audio hoặc video!');
      return;
    }

    try {
      setUploadingEditAudio(true);
      const url = await uploadAudioFile(file);
      setEditData({ ...editData, audioUrl: url });
      alert('Upload audio thành công!');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload audio thất bại!');
    } finally {
      setUploadingEditAudio(false);
    }
  };

  const handleEditExplanationImgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file ảnh!');
      return;
    }

    try {
      setUploadingEditExplanationImg(true);
      const url = await uploadImageFile(file);
      setEditData({ ...editData, explanationImg: url });
      alert('Upload ảnh giải thích thành công!');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload ảnh giải thích thất bại!');
    } finally {
      setUploadingEditExplanationImg(false);
    }
  };

  // Lấy tên bài học theo ID
  const getLessonTitle = (lessonId: number) => {
    const lesson = lessons.find((l) => l.id === lessonId);
    return lesson ? lesson.title : `Bài ${lessonId}`;
  };

  // Khởi tạo array câu hỏi khi thay đổi số lượng
  useEffect(() => {
    const newArray = Array.from({ length: questionQuantity }, () => ({
      questionText: '',
      imageUrl: 'https://res.cloudinary.com/dqbluifmd/image/upload/v1759301901/Screenshot_2025-10-01_110452_z3pszz.png',
      audioUrl: 'https://res.cloudinary.com/dv3gofhee/video/upload/v1759488935/math-audio/grade2/lesson01/1_vslq5t.wav',
      explanationText: '',
      explanationImg: 'https://dummyimage.com/600x400/cccccc/000000&text=No+Image',
      answers: [
        { answerText: '', isCorrect: false },
        { answerText: '', isCorrect: false },
        { answerText: '', isCorrect: false },
        { answerText: '', isCorrect: false },
      ],
    }));
    setMultipleQuestions(newArray);
  }, [questionQuantity]);

  // Cập nhật field của câu hỏi theo index
  const updateQuestionField = (index: number, field: string, value: any) => {
    const updated = [...multipleQuestions];
    (updated[index] as any)[field] = value;
    setMultipleQuestions(updated);
  };

  // Cập nhật đáp án
  const updateAnswerField = (qIndex: number, aIndex: number, field: string, value: any) => {
    const updated = [...multipleQuestions];
    (updated[qIndex].answers[aIndex] as any)[field] = value;
    setMultipleQuestions(updated);
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

  // Tạo nhiều câu hỏi cùng lúc
  const handleCreateMultiple = async () => {
    // Lấy thông tin chung từ form
    const commonGrade = (document.getElementById('common-grade') as HTMLSelectElement)?.value;
    const commonType = (document.getElementById('common-type') as HTMLSelectElement)?.value;
    const commonAnswerType = (document.getElementById('common-answerType') as HTMLSelectElement)?.value;
    const commonLessonId = (document.getElementById('common-lessonId') as HTMLSelectElement)?.value;

    if (!commonGrade || !commonType || !commonAnswerType || !commonLessonId) {
      alert("Vui lòng chọn đầy đủ: Lớp, Loại câu hỏi, Kiểu đáp án và Bài học!");
      return;
    }

    // Kiểm tra từng câu hỏi
    for (let i = 0; i < multipleQuestions.length; i++) {
      const q = multipleQuestions[i];
      if (!q.questionText?.trim()) {
        alert(`Câu hỏi ${i + 1}: Vui lòng nhập nội dung câu hỏi!`);
        return;
      }
      
      const validAnswers = q.answers.filter(a => a.answerText?.trim());
      if (validAnswers.length === 0) {
        alert(`Câu hỏi ${i + 1}: Vui lòng nhập ít nhất 1 đáp án!`);
        return;
      }

      const correctCount = validAnswers.filter(a => a.isCorrect).length;
      if (correctCount !== 1) {
        alert(`Câu hỏi ${i + 1}: Phải có đúng 1 đáp án đúng!`);
        return;
      }
    }

    if (!window.confirm(`Bạn có chắc muốn tạo ${questionQuantity} câu hỏi?`)) {
      return;
    }

    try {
      let successCount = 0;
      
      for (let i = 0; i < multipleQuestions.length; i++) {
        const q = multipleQuestions[i];
        const questionData = {
          questionText: q.questionText,
          imageUrl: q.imageUrl || undefined,
          audioUrl: q.audioUrl || undefined,
          explanationText: q.explanationText || "Giải thích mặc định",
          explanationImg: q.explanationImg || undefined,
          grade: Number(commonGrade),
          type: commonType as "practice" | "exam",
          answerType: commonAnswerType as "choice" | "input" | "drag",
          lessonId: Number(commonLessonId),
          answers: q.answers.filter(a => a.answerText?.trim()).map(a => ({
            answerText: a.answerText,
            isCorrect: a.isCorrect
          }))
        };

        console.log(`📤 Đang gửi câu hỏi ${i + 1}:`, questionData);

        try {
          await createQuestionWithAnswers(questionData);
          successCount++;
          console.log(`✅ Tạo thành công câu hỏi ${i + 1}`);
        } catch (error) {
          console.error(`❌ Lỗi tạo câu hỏi ${i + 1}:`, error);
        }
      }

      if (successCount === questionQuantity) {
        alert(`✅ Đã tạo thành công ${successCount} câu hỏi!`);
      } else {
        alert(`⚠️ Tạo được ${successCount}/${questionQuantity} câu hỏi.`);
      }

      // Reset form
      setShowAddForm(false);
      setQuestionQuantity(1);
      
      // Reload questions
      window.location.reload();
    } catch (err) {
      alert("Lỗi khi thêm câu hỏi!");
      console.error(err);
    }
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
          (lessonRes as any).data?.lessons || lessonRes.lessons || [];
        setAllLessons(allLessonsList);

        let lessonsForFilter = allLessonsList;
        if (filterGrade !== "all") {
          const gradeNum = Number(filterGrade);
          const chapterIds = allChaptersList
            .filter((c: any) => c.grade === gradeNum)
            .map((c: any) => c.id);
          lessonsForFilter = allLessonsList.filter((l: any) =>
            chapterIds.includes(l.chapterId)
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

  // Hàm load câu hỏi
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

  useEffect(() => {
    loadQuestions();
  }, [filterGrade, filterType, filterAnswerType]);

  // Đọc URL params khi component mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const lessonId = params.get('lessonId');
    const grade = params.get('grade');
    
    if (lessonId) {
      setFilterLesson(lessonId);
    }
    if (grade) {
      setFilterGrade(grade);
    }
  }, []);

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
            <h1>Danh sách câu hỏi</h1>
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
              {/* Danh sách câu hỏi */}
              {filteredQuestions.map((question, index) => {
                const lessonTitle =
                  lessons.find((l) => l.id === question.lessonId)?.title ||
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
                              key={lesson.id}
                              value={lesson.id}
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
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
                            placeholder="URL hoặc upload"
                          />
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleEditImageUpload}
                              style={{ display: 'none' }}
                              id={`edit-image-${question.id}`}
                            />
                            <label
                              htmlFor={`edit-image-${question.id}`}
                              style={{
                                padding: '4px 8px',
                                background: '#007bff',
                                color: 'white',
                                borderRadius: '4px',
                                cursor: uploadingEditImage ? 'not-allowed' : 'pointer',
                                fontSize: '12px',
                                opacity: uploadingEditImage ? 0.6 : 1,
                              }}
                            >
                              {uploadingEditImage ? '⏳' : '📤'}
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
                          {question.imageUrl ? (
                            <span 
                              className="media-available" 
                              style={{cursor: 'pointer'}}
                              onClick={() => setPreviewMedia({type: 'image', url: question.imageUrl!})}
                            >
                              🖼️ Xem
                            </span>
                          ) : (
                            <span className="media-null">❌</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
                            placeholder="URL hoặc upload"
                          />
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <input
                              type="file"
                              accept="audio/*,video/*"
                              onChange={handleEditAudioUpload}
                              style={{ display: 'none' }}
                              id={`edit-audio-${question.id}`}
                            />
                            <label
                              htmlFor={`edit-audio-${question.id}`}
                              style={{
                                padding: '4px 8px',
                                background: '#28a745',
                                color: 'white',
                                borderRadius: '4px',
                                cursor: uploadingEditAudio ? 'not-allowed' : 'pointer',
                                fontSize: '12px',
                                opacity: uploadingEditAudio ? 0.6 : 1,
                              }}
                            >
                              {uploadingEditAudio ? '⏳' : '🎵'}
                            </label>
                          </div>
                        </div>
                      ) : (
                        <div className="media-cell">
                          {question.audioUrl ? (
                            <span 
                              className="media-available" 
                              style={{cursor: 'pointer'}}
                              onClick={() => setPreviewMedia({type: 'audio', url: question.audioUrl!})}
                            >
                              🎵 Nghe
                            </span>
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

        {/* Modal thêm câu hỏi */}
        {showAddForm && (
          <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>➕ Thêm câu hỏi mới</h2>
                <button className="modal-close" onClick={() => setShowAddForm(false)}>×</button>
              </div>

              <div className="modal-body">
                {/* Phần thông tin chung */}
                <div style={{background: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '24px', border: '2px solid #007bff'}}>
                  <h3 style={{margin: '0 0 16px 0', fontSize: '18px', fontWeight: 600, color: '#007bff'}}>📋 Thông tin chung (áp dụng cho tất cả câu hỏi)</h3>
                  <div className="modal-form-grid">
                    <div className="form-group">
                      <label>Số lượng câu hỏi:</label>
                      <div className="quantity-input">
                        <button type="button" onClick={() => setQuestionQuantity(Math.max(1, questionQuantity - 1))}>−</button>
                        <input
                          type="number"
                          value={questionQuantity}
                          onChange={(e) => setQuestionQuantity(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
                          min="1"
                          max="20"
                        />
                        <button type="button" onClick={() => setQuestionQuantity(Math.min(20, questionQuantity + 1))}>+</button>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Loại câu hỏi <span className="required">*</span></label>
                      <select id="common-type" defaultValue="practice">
                        <option value="practice">Thực hành</option>
                        <option value="exam">Kiểm tra</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Lớp <span className="required">*</span></label>
                      <select id="common-grade" defaultValue={filterGrade !== 'all' ? filterGrade : ''}>
                        <option value="">Chọn lớp</option>
                        <option value="1">Lớp 1</option>
                        <option value="2">Lớp 2</option>
                        <option value="3">Lớp 3</option>
                        <option value="4">Lớp 4</option>
                        <option value="5">Lớp 5</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Kiểu câu hỏi <span className="required">*</span></label>
                      <select id="common-answerType" defaultValue="choice">
                        <option value="choice">Trắc nghiệm</option>
                        <option value="input">Nhập liệu</option>
                        <option value="drag">Kéo thả</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Bài học <span className="required">*</span></label>
                      <select id="common-lessonId" defaultValue={filterLesson !== 'all' ? filterLesson : ''}>
                        <option value="">Chọn bài học</option>
                        {lessons.map((lesson) => (
                          <option key={lesson.id} value={lesson.id}>{lesson.title}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Danh sách câu hỏi - mỗi câu có form riêng */}
                <div style={{maxHeight: '400px', overflowY: 'auto', paddingRight: '10px'}}>
                  {multipleQuestions.map((q, qIndex) => (
                    <div key={qIndex} style={{background: 'white', border: '2px solid #dee2e6', borderRadius: '8px', padding: '20px', marginBottom: '16px'}}>
                      <h3 style={{margin: '0 0 16px 0', fontSize: '16px', fontWeight: 600, color: '#495057'}}>📝 Câu hỏi {qIndex + 1}</h3>
                      
                      <div className="form-group">
                        <label>Nội dung câu hỏi <span className="required">*</span></label>
                        <textarea
                          value={q.questionText}
                          onChange={(e) => updateQuestionField(qIndex, 'questionText', e.target.value)}
                          placeholder="Nhập nội dung câu hỏi..."
                          rows={2}
                        />
                      </div>

                      <div className="modal-form-grid">
                        {/* Upload hình ảnh câu hỏi */}
                        <div className="form-group">
                          <label>Hình ảnh câu hỏi (tùy chọn)</label>
                          <div className={`upload-zone ${uploadingImage ? 'uploading' : ''}`}>
                            <input
                              type="file"
                              id={`question-image-${qIndex}`}
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, qIndex)}
                              disabled={uploadingImage}
                            />
                            <label htmlFor={`question-image-${qIndex}`}>
                              <div className="upload-icon">📷</div>
                              <span>{uploadingImage ? 'Đang tải lên...' : 'Click để tải ảnh lên'}</span>
                            </label>
                            {q.imageUrl && (
                              <div className="upload-preview">
                                <img src={q.imageUrl} alt="Question preview" />
                                <button 
                                  type="button" 
                                  className="remove-upload"
                                  onClick={() => updateQuestionField(qIndex, 'imageUrl', '')}
                                >
                                  ✕
                                </button>
                              </div>
                            )}
                          </div>
                          <input
                            type="text"
                            value={q.imageUrl}
                            onChange={(e) => updateQuestionField(qIndex, 'imageUrl', e.target.value)}
                            placeholder="Hoặc nhập URL hình ảnh..."
                            style={{marginTop: '8px'}}
                          />
                        </div>

                        {/* Upload audio câu hỏi */}
                        <div className="form-group">
                          <label>Audio câu hỏi (tùy chọn)</label>
                          <div className={`upload-zone ${uploadingAudio ? 'uploading' : ''}`}>
                            <input
                              type="file"
                              id={`question-audio-${qIndex}`}
                              accept="audio/*"
                              onChange={(e) => handleAudioUpload(e, qIndex)}
                              disabled={uploadingAudio}
                            />
                            <label htmlFor={`question-audio-${qIndex}`}>
                              <div className="upload-icon">🎵</div>
                              <span>{uploadingAudio ? 'Đang tải lên...' : 'Click để tải audio lên'}</span>
                            </label>
                            {q.audioUrl && (
                              <div className="upload-preview">
                                <audio controls src={q.audioUrl} />
                                <button 
                                  type="button" 
                                  className="remove-upload"
                                  onClick={() => updateQuestionField(qIndex, 'audioUrl', '')}
                                >
                                  ✕
                                </button>
                              </div>
                            )}
                          </div>
                          <input
                            type="text"
                            value={q.audioUrl}
                            onChange={(e) => updateQuestionField(qIndex, 'audioUrl', e.target.value)}
                            placeholder="Hoặc nhập URL audio..."
                            style={{marginTop: '8px'}}
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Giải thích (tùy chọn)</label>
                        <textarea
                          value={q.explanationText}
                          onChange={(e) => updateQuestionField(qIndex, 'explanationText', e.target.value)}
                          placeholder="Lời giải thích..."
                          rows={2}
                        />
                      </div>

                      {/* Upload hình ảnh giải thích */}
                      <div className="form-group">
                        <label>Hình ảnh giải thích (tùy chọn)</label>
                        <div className={`upload-zone ${uploadingExplanationImg ? 'uploading' : ''}`}>
                          <input
                            type="file"
                            id={`explanation-image-${qIndex}`}
                            accept="image/*"
                            onChange={(e) => handleExplanationImgUpload(e, qIndex)}
                            disabled={uploadingExplanationImg}
                          />
                          <label htmlFor={`explanation-image-${qIndex}`}>
                            <div className="upload-icon">🖼️</div>
                            <span>{uploadingExplanationImg ? 'Đang tải lên...' : 'Click để tải ảnh giải thích'}</span>
                          </label>
                          {q.explanationImg && (
                            <div className="upload-preview">
                              <img src={q.explanationImg} alt="Explanation preview" />
                              <button 
                                type="button" 
                                className="remove-upload"
                                onClick={() => updateQuestionField(qIndex, 'explanationImg', '')}
                              >
                                ✕
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Đáp án */}
                      <div style={{marginTop: '16px'}}>
                        <h4 style={{margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600, color: '#6c757d'}}>✅ Đáp án</h4>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                          {q.answers.map((ans, aIndex) => (
                            <div key={aIndex} style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                              <input
                                type="text"
                                value={ans.answerText}
                                onChange={(e) => updateAnswerField(qIndex, aIndex, 'answerText', e.target.value)}
                                placeholder={`Đáp án ${aIndex + 1}`}
                                style={{flex: 1}}
                              />
                              <label style={{display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', minWidth: '80px'}}>
                                <input
                                  type="checkbox"
                                  checked={ans.isCorrect}
                                  onChange={(e) => updateAnswerField(qIndex, aIndex, 'isCorrect', e.target.checked)}
                                />
                                <span>Đúng</span>
                              </label>
                              {q.answers.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newAnswers = q.answers.filter((_, i) => i !== aIndex);
                                    updateQuestionField(qIndex, 'answers', newAnswers);
                                  }}
                                  style={{padding: '4px 8px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}
                                >
                                  🗑️
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                        <button
                          type="button"
                          className="add-answer-btn"
                          onClick={() => {
                            const newAnswers = [...q.answers, { answerText: '', isCorrect: false }];
                            updateQuestionField(qIndex, 'answers', newAnswers);
                          }}
                          style={{marginTop: '8px', width: '100%'}}
                        >
                          ➕ Thêm đáp án
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn-cancel" onClick={() => setShowAddForm(false)}>Hủy</button>
                <button className="btn-save" onClick={handleCreateMultiple}>
                  Tạo {questionQuantity} câu hỏi
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal xem preview media */}
        {previewMedia && (
          <div className="modal-overlay" onClick={() => setPreviewMedia(null)}>
            <div className="modal-content preview-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{previewMedia.type === 'image' ? '🖼️ Xem hình ảnh' : '🎵 Nghe audio'}</h2>
                <button className="modal-close" onClick={() => setPreviewMedia(null)}>×</button>
              </div>
              <div className="modal-body">
                {previewMedia.type === 'image' ? (
                  <img src={previewMedia.url} alt="Preview" style={{width: '100%', borderRadius: '8px'}} />
                ) : (
                  <audio controls src={previewMedia.url} style={{width: '100%'}} autoPlay />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionAdmin;
