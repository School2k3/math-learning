import React, { useState, useEffect } from "react";
import Header from "../components/header";
import ProgressCircle from "../components/ProgressCircle";
import ChatBotButton from "../components/ChatBot/ChatBotButton";
import TrophyDisplay from "../components/TrophyDisplay";
import { trackChangeClassOrSemester } from "../components/GoogleAnalytics";
import "../css/study-page.css";
import { useNavigate, useSearchParams } from "react-router-dom"; // Thêm useSearchParams
import { fetchChapters } from "../api/chapterAPI";
import { fetchLessonsByChapter } from "../api/lessonAPI";
import { fetchExamsByChapter, fetchExamResultsByExamId, fetchActiveExamByUser, finishExam } from "../api/examAPI";
import { startExam } from "../api/examAPI"; 
import { fetchExamById } from "../api/examAPI"; 
import { createOrUpdatePracticeSession, fetchPracticeHistoryByUser } from "../api/praticeAPI"; // Import API progress
import { useAuth } from "../contexts/AuthContext"; // Import useAuth

const classOptions = ["Lớp 1","Lớp 2","Lớp 3", "Lớp 4", "Lớp 5"];
const semesterOptions = ["Học kỳ 1", "Học kỳ 2"];

const StudyPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth(); // Lấy user từ AuthContext
  
  // Khởi tạo selectedClass dựa trên lớp của user (nếu có), nếu không thì mặc định Lớp 1
  const [selectedClass, setSelectedClass] = useState(() => {
    return user?.grade ? `Lớp ${user.grade}` : "Lớp 1";
  });
  const [selectedSemester, setSelectedSemester] = useState("Học kỳ 1");
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedChapterId, setSelectedChapterId] = useState<number | null>(null);
const [lessons, setLessons] = useState<any[]>([]);
const [loadingLessons, setLoadingLessons] = useState(false);
  const [exams, setExams] = useState<any[]>([]);
const [loadingExams, setLoadingExams] = useState(false);
const [lessonProgress, setLessonProgress] = useState<{[key: number]: {progress: number, completed: boolean}}>({});
const [examCompletion, setExamCompletion] = useState<{[key: number]: boolean}>({});
const [showExamModal, setShowExamModal] = useState(false);
const [pendingExam, setPendingExam] = useState<any>(null);
const [activeExamResult, setActiveExamResult] = useState<any>(null);

  // Cập nhật selectedClass khi user thay đổi (ví dụ: sau khi login)
  useEffect(() => {
    if (user?.grade) {
      setSelectedClass(`Lớp ${user.grade}`);
    }
  }, [user?.grade]);

  // Kiểm tra xem lớp đang chọn có phù hợp với lớp của học sinh không
  const selectedGrade = Number(selectedClass.replace("Lớp ", ""));
  const userGrade = user?.grade;
  // Chỉ khóa khi user đã đăng nhập VÀ lớp không khớp
  const isGradeLocked = userGrade ? selectedGrade !== userGrade : false;  useEffect(() => {
    // Lấy gradeId và semester từ URL nếu có (khi quay về từ pratice/exams)
    const urlGradeId = searchParams.get("gradeId");
    const urlSemester = searchParams.get("semester");
    const urlChapterId = Number(searchParams.get("chapterId"));
    
    // Xác định grade và volume: ưu tiên từ URL, nếu không thì dùng state hiện tại
    let gradeToUse = Number(selectedClass.replace("Lớp ", ""));
    let volumeToUse = selectedSemester === "Học kỳ 1" ? 1 : 2;
    
    // Nếu có params từ URL (từ pratice/exams quay về), update state và dùng giá trị đó
    if (urlGradeId) {
      gradeToUse = Number(urlGradeId);
      setSelectedClass(`Lớp ${urlGradeId}`);
    }
    if (urlSemester) {
      volumeToUse = Number(urlSemester);
      setSelectedSemester(urlSemester === "1" ? "Học kỳ 1" : "Học kỳ 2");
    }
    
    console.log("📚 Study Page - Fetching chapters:", { 
      gradeToUse, 
      volumeToUse, 
      urlGradeId, 
      urlSemester, 
      urlChapterId,
      selectedClass,
      selectedSemester 
    });
    
    // Fetch chapters với grade và volume đã xác định
    setLoading(true);
    fetchChapters(gradeToUse, volumeToUse)
      .then((data) => {
        const chapters = data.chapters ?? [];
        console.log("📚 Chapters fetched:", chapters.length, "chapters for grade", gradeToUse, "volume", volumeToUse);
        setTopics(chapters);

        // Nếu có chapterId trên URL và tồn tại trong danh sách thì chọn, nếu không thì chọn đầu tiên
        if (chapters.length > 0) {
          if (urlChapterId && chapters.some((ch: { id: number }) => ch.id === urlChapterId)) {
            setSelectedChapterId(urlChapterId);
            console.log("✅ Selected chapter from URL:", urlChapterId);
          } else {
            setSelectedChapterId(chapters[0].id);
            console.log("✅ Selected first chapter:", chapters[0].id);
          }
        }
      })
      .catch(() => setTopics([]))
      .finally(() => setLoading(false));
  }, [selectedClass, selectedSemester, searchParams]);

  useEffect(() => {
    if (selectedChapterId) {
      setLoadingLessons(true);
      fetchLessonsByChapter(selectedChapterId)
        .then(async (data) => {
          console.log("API Response:", data); // Debug để xem structure
          // Sửa lại để lấy đúng path
          const lessonsData = data.data?.lessons ?? [];
          setLessons(lessonsData);
          
          // Fetch progress cho mỗi lesson
          const userId = user?.id || 1; // Lấy từ AuthContext, fallback về 1 nếu chưa login
          const progressPromises = lessonsData.map(async (lesson: any) => {
            try {
              const historyData = await fetchPracticeHistoryByUser(userId);
              // Lọc ra các session của lesson này
              const sessions = historyData.practiceHistory.filter(
                (s: any) => s.lessonId === lesson.id
              );
              // Lấy session mới nhất (hoặc điểm cao nhất)
              const latestSession = sessions.sort((a: any, b: any) => new Date(b.finishedAt).getTime() - new Date(a.finishedAt).getTime())[0];
              const score = latestSession ? latestSession.score : 0;
              // Completed if the session has finishedAt (which means they reached 100 points)
              const completed = latestSession ? latestSession.finishedAt !== null : false;
              // Progress should be 100% if completed, otherwise show actual score
              const progress = completed ? 100 : score;
              return { lessonId: lesson.id, progress: progress, completed };
            } catch {
              return { lessonId: lesson.id, progress: 0, completed: false };
            }
          });
          const progressResults = await Promise.all(progressPromises);
          const progressMap = progressResults.reduce((acc, result) => {
            acc[result.lessonId] = { progress: result.progress, completed: result.completed };
            return acc;
          }, {} as {[key: number]: {progress: number, completed: boolean}});
          
          setLessonProgress(progressMap);
        })
        .catch((error) => {
          console.error("Error fetching lessons:", error);
          setLessons([]);
        })
        .finally(() => setLoadingLessons(false));
    } else {
      setLessons([]);
      setLessonProgress({});
    }
  }, [selectedChapterId]);

  useEffect(() => {
    if (selectedChapterId) {
      setLoadingExams(true);
      fetchExamsByChapter(selectedChapterId)
        .then(async (data) => {
          console.log("Exams API Response:", data); // Debug để xem structure
          // Response trực tiếp có exams array
          const examsData = data.exams ?? [];
          setExams(examsData);
          
          // Fetch exam results để kiểm tra exam nào đã hoàn thành
          const userId = user?.id || 1;
          try {
            // Tạo map để đánh dấu exam nào đã hoàn thành
            const completionMap: {[key: number]: boolean} = {};
            
            // Kiểm tra từng exam xem user đã làm chưa
            const checkPromises = examsData.map(async (exam: any) => {
              try {
                const resultsData = await fetchExamResultsByExamId(exam.id, {
                  includeFinished: true,
                  includeActive: false
                });
                
                // Kiểm tra xem có kết quả nào của user này không
                const userResults = resultsData.examResults?.filter(
                  (result: any) => result.userId === userId && result.finishedAt !== null
                );
                
                completionMap[exam.id] = userResults && userResults.length > 0;
              } catch (error) {
                console.error(`Error checking exam ${exam.id}:`, error);
                completionMap[exam.id] = false;
              }
            });
            
            await Promise.all(checkPromises);
            console.log("Exam Completion Map:", completionMap);
            setExamCompletion(completionMap);
          } catch (error) {
            console.error("Error fetching exam completion:", error);
            setExamCompletion({});
          }
        })
        .catch((error) => {
          console.error("Error fetching exams:", error);
          setExams([]);
          setExamCompletion({});
        })
        .finally(() => setLoadingExams(false));
    } else {
      setExams([]);
      setExamCompletion({});
    }
  }, [selectedChapterId, user]);

  return (
    <div>
      <Header bgWhite />
      <div className="study-main">
        <div className="study-sidebar">
          <h2 className="study-title">Danh sách chương học</h2>
          <div className="study-semester-btns">
            {semesterOptions.map((sem) => (
              <button
                key={sem}
                className={selectedSemester === sem ? "active" : ""}
                onClick={() => {
                  setSelectedSemester(sem);
                  // Xóa URL params khi user chọn thủ công
                  navigate("/study", { replace: true });
                  // Track khi thay đổi học kỳ
                  const grade = Number(selectedClass.replace("Lớp ", ""));
                  const semester = sem === "Học kỳ 1" ? 1 : 2;
                  trackChangeClassOrSemester(grade, semester);
                }}
              >
                {sem}
              </button>
            ))}
          </div>
          <div className="study-topic-list">
            {loading ? (
              <div>Đang tải...</div>
            ) : (
              topics.map((topic: any) => (
                <div
                  key={topic.id}
                  className={`study-topic-item${selectedChapterId === topic.id ? " active" : ""}`}
                  onClick={() => {
                    setSelectedChapterId(topic.id);
                    // Xóa URL params khi user chọn chương thủ công
                    navigate("/study", { replace: true });
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <span className="study-topic-icon">
                    {/* SVG bài học */}
                    <svg width="23" height="19" viewBox="0 0 23 19" fill="none">
                      <path
                        d="M21.1719 0.40625C21.875 0.367188 22.5 0.914062 22.4609 1.57812V14.7812C22.4609 15.4062 21.9531 15.9531 21.2891 15.9922C19.375 16.0703 15.4688 16.4609 12.7734 17.8281C12.3438 18.0234 11.8359 17.75 11.8359 17.2812V3.0625C11.8359 2.86719 11.9531 2.67188 12.1484 2.55469C14.7656 0.953125 19.0234 0.523438 21.1719 0.40625ZM10.3125 2.55469C10.5078 2.67188 10.625 2.86719 10.625 3.0625V17.2812C10.625 17.75 10.1172 18.0234 9.6875 17.8281C6.99219 16.4609 3.08594 16.0703 1.17188 15.9922C0.507812 15.9531 0 15.4062 0 14.7812V1.57812C0 0.914062 0.585938 0.367188 1.28906 0.40625C3.4375 0.523438 7.69531 0.953125 10.3125 2.55469Z"
                        fill="#252641"
                      />
                    </svg>
                  </span>
                  <div style={{fontSize: "20px", lineHeight: "1.5", fontWeight: 500, color: "#252641",textAlign: "left"}}>
                    <div>{topic.title}</div> 
                    
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="study-content">
          <div className="study-content-selects">
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                // Xóa URL params khi user chọn thủ công
                navigate("/study", { replace: true });
                // Track khi thay đổi lớp
                const grade = Number(e.target.value.replace("Lớp ", ""));
                const semester = selectedSemester === "Học kỳ 1" ? 1 : 2;
                trackChangeClassOrSemester(grade, semester);
              }}
            >
              {classOptions.map((cls) => (
                <option key={cls}>{cls}</option>
              ))}
            </select>

          </div>
          {/* Hiển thị title chapter đang chọn */}
          <div className="study-content-header">
            <div className="study-content-info">
              <div className="study-content-title">
                {selectedChapterId
                  ? topics.find((t) => t.id === selectedChapterId)?.title
                  : "Chọn một chủ điểm"}
              </div>
              <div className="study-content-progress">
                <div>
                  <span>
                    {selectedChapterId
                      ? Object.values(lessonProgress).filter(p => p.completed).length
                      : 0}
                    /
                    {selectedChapterId
                      ? lessons.length
                      : 0}
                    
                  </span>
                  <div>Bài học</div>
                </div>
                <div>
                  <span>
                    {selectedChapterId
                      ? Object.values(examCompletion).filter(completed => completed).length
                      : 0}
                    /
                    {selectedChapterId ? exams.length : 0}
                  </span>
                  <div>Bài kiểm tra</div>
                </div>
              </div>
            </div>
          </div>

          {/* Hiển thị danh sách lesson của chapter đã chọn, mỗi dòng 2 lesson */}
          <div className="study-content-cards">
            {loadingLessons ? (
              <div>Đang tải bài học...</div>
            ) : (
              // Chia mảng lessons thành các nhóm 2 phần tử
              Array.from({ length: Math.ceil(lessons.length / 2) }, (_, rowIdx) => (
                <div key={rowIdx} style={{ display: "flex", gap: "32px", marginBottom: "32px" }}>
                  {lessons
                    .slice(rowIdx * 2, rowIdx * 2 + 2)
                    .map((lesson) => (
                      <div 
                        className="study-card" 
                        key={lesson.id}
                        style={{
                          position: "relative",
                          opacity: isGradeLocked ? 0.5 : 1,
                          pointerEvents: isGradeLocked ? "none" : "auto"
                        }}
                      >
                        {/* Overlay khóa nếu không phù hợp lớp */}
                        {isGradeLocked && (
                          <div style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "rgba(255, 255, 255, 0.9)",
                            borderRadius: "12px",
                            zIndex: 10,
                            padding: "20px",
                            textAlign: "center"
                          }}>
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style={{ marginBottom: "12px" }}>
                              <path d="M19 11H5C3.89543 11 3 11.8954 3 13V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V13C21 11.8954 20.1046 11 19 11Z" stroke="#FF6B6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="#FF6B6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <div style={{ 
                              fontWeight: "bold", 
                              fontSize: "16px", 
                              color: "#FF6B6B",
                              marginBottom: "4px"
                            }}>
                              Lớp học không phù hợp
                            </div>
                            <div style={{ fontSize: "14px", color: "#666" }}>
                              Nội dung dành cho lớp {selectedGrade}
                            </div>
                          </div>
                        )}
                        <div className="study-card-img">
                          <img src={lesson.imageUrl || "/mei-is.png"} alt="card" />
                          <div className="study-card-label">Mei-Math</div>
                        </div>
                        <div
                          className="study-card-title"
                          style={{ color: "#23bdee", fontWeight: "bold",minHeight: "66px" }}
                        >
                          {lesson.title}
                        </div>
                        <div className="study-card-actions">
                          <div>
                            <span
                              className="study-card-action-icon"
                              style={{ color: "#23BDEE", cursor: "pointer" }}
                              onClick={() => {
                                console.log("lesson.title:", lesson.title);
                                const grade = Number(selectedClass.replace("Lớp ", ""));
                                const semester = selectedSemester === "Học kỳ 1" ? 1 : 2;
                                navigate(
                                  `/theoretical-video?videoUrl=${encodeURIComponent(lesson.videoUrl || "")}&title=${encodeURIComponent(lesson.title || "")}&lessonId=${lesson.id}&chapterId=${selectedChapterId}&gradeId=${grade}&semester=${semester}`
                                );
                              }}
                            >                   
                              {/* SVG video */}
                              <svg width="24" height="24" fill="none">
                                <rect width="24" height="24" rx="6" fill="#23BDEE" />
                                <path d="M8 8L16 12L8 16V8Z" fill="white" />
                              </svg>
                            </span>
                            <span className="study-card-action-label">
                              VIDEO LÝ THUYẾT
                            </span>
                          </div>
                          <div>
                              <button
                              className="study-card-action-btn"
                              style={{
                                background: "none",
                                border: "none",
                                padding: 0,
                                margin: 0,
                                cursor: "pointer",
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                outline: "none"
                              }}
                              onClick={async () => {
                                try {
                                  console.log("Starting practice for lesson.id:", lesson.id);
                                  // Use createOrUpdatePracticeSession (server will create or return an active session)
                                  const userId = user?.id || 1;
                                  const result = await createOrUpdatePracticeSession(userId, lesson.id);
                                  console.log("createOrUpdatePracticeSession result:", result);
                                  const practiceSessionId = result.practiceSession?.id ?? result.data?.practiceSession?.id;

                                  if (!practiceSessionId) {
                                    console.error("No practiceSession id returned from API", result);
                                    throw new Error("Failed to create practice session ID");
                                  }

                                  // Navigate to practice; the practice page will verify session status on mount
                                  const grade = Number(selectedClass.replace("Lớp ", ""));
                                  const semester = selectedSemester === "Học kỳ 1" ? 1 : 2;
                                  navigate(
                                    `/pratice?lessonId=${lesson.id}&title=${encodeURIComponent(lesson.title)}&chapterId=${selectedChapterId}&practiceSessionId=${practiceSessionId}&gradeId=${grade}&semester=${semester}`
                                  );
                                } catch (error) {
                                  console.error("createOrUpdatePracticeSession error:", error);
                                  alert("Không thể tạo phiên thực hành!");
                                }
                              }}
                            >
                              <span className="study-card-action-icon" style={{ color: "#252641" }}>
                                {/* SVG thực hành */}
                                <svg
                                  width="25"
                                  height="25"
                                  viewBox="0 0 25 25"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M2.45654 3.20166H8.45654C9.51741 3.20166 10.5348 3.62309 11.285 4.37323C12.0351 5.12338 12.4565 6.14079 12.4565 7.20166V21.2017C12.4565 20.406 12.1405 19.6429 11.5779 19.0803C11.0153 18.5177 10.2522 18.2017 9.45654 18.2017H2.45654V3.20166Z"
                                    stroke="black"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                  <path
                                    d="M22.4565 3.20166H16.4565C15.3957 3.20166 14.3783 3.62309 13.6281 4.37323C12.878 5.12338 12.4565 6.14079 12.4565 7.20166V21.2017C12.4565 20.406 12.7726 19.6429 13.3352 19.0803C13.8978 18.5177 14.6609 18.2017 15.4565 18.2017H22.4565V3.20166Z"
                                    stroke="black"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </span>
                              <span className="study-card-action-label">THỰC HÀNH</span>
                            </button>
                          </div>
                          <div>
                            <button
                              className="study-card-action-btn"
                              style={{
                                background: "none",
                                border: "none",
                                padding: 0,
                                margin: 0,
                                cursor: "pointer",
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                outline: "none"
                              }}
                              onClick={() => {
                                navigate(`/dashboard?lessonId=${lesson.id}&chapterId=${selectedChapterId}`);
                              }}
                            >
                              <span className="study-card-action-icon" style={{ color: "#A1A1A1" }}>
                                <ProgressCircle 
                                  progress={lessonProgress[lesson.id]?.progress ?? 0} 
                                  completed={lessonProgress[lesson.id]?.completed ?? false}
                                  size={24}
                                  strokeWidth={3}
                                />
                              </span>
                              <span className="study-card-action-label">TIẾN ĐỘ</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ))
            )}
          </div>
          {/* Thêm phía dưới phần study-content-cards */}
          <div style={{ marginTop: "40px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "18px",
              }}
            >
              {/* SVG thực hành phía trước chữ */}
              <svg
                width="30"
                height="36"
                viewBox="0 0 30 36"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ marginRight: "10px" }}
              >
                <path
                  d="M18.3332 1.3335H4.99984C4.11578 1.3335 3.26794 1.68469 2.64281 2.30981C2.01769 2.93493 1.6665 3.78277 1.6665 4.66683V31.3335C1.6665 32.2176 2.01769 33.0654 2.64281 33.6905C3.26794 34.3156 4.11578 34.6668 4.99984 34.6668H24.9998C25.8839 34.6668 26.7317 34.3156 27.3569 33.6905C27.982 33.0654 28.3332 32.2176 28.3332 31.3335V11.3335L18.3332 1.3335Z"
                  stroke="black"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M21.6668 19.6665H8.3335"
                  stroke="black"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M11.6668 13H10.0002H8.3335"
                  stroke="black"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span style={{ fontWeight: "bold", fontSize: "22px" }}>
                Bài Kiểm Tra
              </span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "32px" }}>
              {loadingExams ? (
                <div>Đang tải bài kiểm tra...</div>
              ) : exams.length === 0 ? (
                <div>Không có bài kiểm tra nào.</div>
              ) : (
                exams.map((exam: any) => (
                  <div 
                    className="study-card" 
                    key={exam.id}
                    style={{
                      position: "relative",
                      opacity: isGradeLocked ? 0.5 : 1,
                      pointerEvents: isGradeLocked ? "none" : "auto"
                    }}
                  >
                    {/* Overlay khóa nếu không phù hợp lớp */}
                    {isGradeLocked && (
                      <div style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "rgba(255, 255, 255, 0.9)",
                        borderRadius: "12px",
                        zIndex: 10,
                        padding: "20px",
                        textAlign: "center"
                      }}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style={{ marginBottom: "12px" }}>
                          <path d="M19 11H5C3.89543 11 3 11.8954 3 13V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V13C21 11.8954 20.1046 11 19 11Z" stroke="#FF6B6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="#FF6B6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <div style={{ 
                          fontWeight: "bold", 
                          fontSize: "16px", 
                          color: "#FF6B6B",
                          marginBottom: "4px"
                        }}>
                          Lớp học không phù hợp
                        </div>
                        <div style={{ fontSize: "14px", color: "#666" }}>
                          Nội dung dành cho lớp {selectedGrade}
                        </div>
                      </div>
                    )}
                    <div className="study-card-img">
                      <img src="/mei-is.png" alt="card" />
                      <div className="study-card-label">UX/UI</div>
                    </div>
                    <div
                      className="study-card-title"
                      style={{ color: "#23bdee", fontWeight: "bold" }}
                    >
                      {exam.title}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "8px",
                      }}
                    >
                      <div>
                        <div style={{ color: "#888" }}>Số câu hỏi</div>
                        <div style={{ fontWeight: "bold" }}>
                          {exam.examQuestions?.length ?? 0}
                        </div>
                      </div>
                      <div>
                        <div style={{ color: "#888" }}>Thời gian làm bài</div>
                        <div style={{ fontWeight: "bold" }}>
                          {exam.durationMinutes ?? "--"} phút
                        </div>
                      </div>
                    </div>
                    <button
                      style={{
                        background: "#49bbbd",
                        color: "#fff",
                        fontWeight: "600",
                        border: "none",
                        borderRadius: "8px",
                        padding: "10px 0",
                        width: "100%",
                        marginBottom: "8px",
                        cursor: "pointer",
                      }}
                      onClick={async () => {
                        try {
                          const userId = user?.id || 1;
                          
                          // Kiểm tra xem có exam result đang active không
                          try {
                            const activeExamData = await fetchActiveExamByUser(userId);
                            console.log("Active exam data:", activeExamData);
                            
                            const activeExam = activeExamData?.activeExam;
                            
                            // Nếu có active exam (dù cùng hay khác exam) → Hiển thị modal
                            if (activeExam) {
                              console.log("Active exam found, showing modal");
                              setPendingExam(exam);
                              setActiveExamResult(activeExamData);
                              setShowExamModal(true);
                              return;
                            }
                          } catch (err) {
                            console.log("No active exam found or error:", err);
                          }
                          
                          // Không có active exam → Tạo mới
                          console.log("Creating new exam");
                          const res = await startExam(exam.id, userId);
                          const examDetail = await fetchExamById(exam.id);
                          const grade = Number(selectedClass.replace("Lớp ", ""));
                          const semester = selectedSemester === "Học kỳ 1" ? 1 : 2;
                          
                          navigate("/exams", {
                            state: {
                              exam: examDetail.exam,
                              examResult: res.examResult,
                              chapterId: selectedChapterId,
                              chapterTitle: topics.find((t) => t.id === selectedChapterId)?.title || "",
                              gradeId: grade,
                              semester: semester,
                            },
                          });
                        } catch (e) {
                          console.error(e);
                          alert("Không thể bắt đầu bài kiểm tra!");
                        }
                      }}
                    >
                      Làm bài kiểm tra
                    </button>
                    <div
                      style={{
                        color: "#49bbbd",
                        textAlign: "center",
                        fontWeight: "500",
                        fontSize: "15px",
                        cursor: "pointer",
                        textDecoration: "underline",
                      }}
                      onClick={() => navigate("/exams-history", { 
                        state: { 
                          examId: exam.id,
                          grade: Number(selectedClass.replace("Lớp ", "")),
                          chapterId: selectedChapterId
                        } 
                      })}
                    >
                      Lịch sử các lần làm bài
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Trophy Display - hiển thị số cúp cố định */}
      <TrophyDisplay />
      
      {/* ChatBot Button - chỉ hiển thị ở trang study-page */}
      <ChatBotButton />
      
      {/* Modal xác nhận khi có bài kiểm tra đang làm dở */}
      {showExamModal && (
        <div className="exam-modal-overlay" onClick={() => setShowExamModal(false)}>
          <div className="exam-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="exam-modal-title">Bạn đang có bài kiểm tra chưa hoàn thành</h3>
            <p className="exam-modal-message">
              Bạn có một bài kiểm tra đang làm dở. Bạn có muốn làm tiếp bài đó không?
            </p>
            
            <div className="exam-modal-buttons">
              <button
                className="exam-modal-btn exam-modal-btn-continue"
                onClick={async () => {
                  try {
                    const activeExam = activeExamResult?.activeExam;
                    if (!activeExam || !activeExam.examId) {
                      alert("Không tìm thấy thông tin bài kiểm tra!");
                      setShowExamModal(false);
                      return;
                    }
                    
                    // Lấy thông tin exam
                    const examDetail = await fetchExamById(activeExam.examId);
                    const grade = Number(selectedClass.replace("Lớp ", ""));
                    const semester = selectedSemester === "Học kỳ 1" ? 1 : 2;
                    
                    // Navigate với activeExam để resume (giống exams-history)
                    navigate("/exams", {
                      state: {
                        exam: examDetail.exam,
                        examResult: activeExam, // Truyền activeExam trực tiếp
                        chapterId: selectedChapterId,
                        chapterTitle: topics.find((t) => t.id === selectedChapterId)?.title || "",
                        gradeId: grade,
                        semester: semester,
                      },
                    });
                    setShowExamModal(false);
                  } catch (e) {
                    console.error("Error continuing exam:", e);
                    alert("Không thể tiếp tục bài kiểm tra!");
                    setShowExamModal(false);
                  }
                }}
              >
                Làm tiếp
              </button>
              
              <button
                className="exam-modal-btn exam-modal-btn-new"
                onClick={async () => {
                  try {
                    const userId = user?.id || 1;
                    const examResultId = activeExamResult?.activeExam?.id;
                    
                    if (!examResultId) {
                      alert("Không tìm thấy thông tin bài kiểm tra cũ!");
                      setShowExamModal(false);
                      return;
                    }
                    
                    // Nộp bài cũ (finish exam cũ)
                    await finishExam(examResultId);
                    
                    // Tạo bài mới
                    const res = await startExam(pendingExam.id, userId);
                    const examDetail = await fetchExamById(pendingExam.id);
                    const grade = Number(selectedClass.replace("Lớp ", ""));
                    const semester = selectedSemester === "Học kỳ 1" ? 1 : 2;
                    
                    navigate("/exams", {
                      state: {
                        exam: examDetail.exam,
                        examResult: res.examResult,
                        chapterId: selectedChapterId,
                        chapterTitle: topics.find((t) => t.id === selectedChapterId)?.title || "",
                        gradeId: grade,
                        semester: semester,
                      },
                    });
                    setShowExamModal(false);
                  } catch (e) {
                    console.error(e);
                    alert("Không thể bắt đầu bài kiểm tra mới!");
                  }
                }}
              >
                Làm bài mới (nộp bài cũ)
              </button>
              
              <button
                className="exam-modal-btn exam-modal-btn-cancel"
                onClick={() => setShowExamModal(false)}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyPage;
