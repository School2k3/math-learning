import React, { useState, useEffect } from "react";
import Header from "../components/header";
import "../css/pratice.css";
import { 
  fetchPracticeQuestionsByLesson, 
  completePracticeSession,
  savePracticeAnswer, // Nhập hàm lưu đáp án
  checkPracticeSessionStatus, // Thêm import này
  fetchPracticeSessionScore // Thêm import này để lấy thông tin chi tiết
} from "../api/praticeAPI";
import { fetchAllChapters } from "../api/chapterAPI";
import { generateQuestionAudio } from "../api/audioAPI";
import { useSearchParams, useNavigate } from "react-router-dom";
import { trackStartPractice, trackCompletePractice } from "../components/GoogleAnalytics";

// Component ScoreBar
const ScoreBar: React.FC<{ 
  score: number; 
  correctCount: number; 
  incorrectCount: number; 
}> = ({ score, correctCount, incorrectCount }) => {
  const progress = Math.min(score, 100);
  
  console.log("📊 ScoreBar render:", { score, correctCount, incorrectCount, progress });
  
  return (
    <div className="score-bar-container">
      <div className="score-progress-track">
        <div className="score-indicators">
          {[...Array(11)].map((_, i) => (
            <div key={i} className="score-indicator" />
          ))}
        </div>
        <div 
          className="score-progress-fill"
          style={{ width: `${progress}%` }}
        />
        <div 
          className="score-trophy"
          style={{ left: `${progress}%` }}
        >
          🏆
        </div>
      </div>
      <div className="score-stats">
        <span className="score-value">{score}/100</span>
        <div className="score-counts">
          <span className="correct-count">✅ {correctCount}</span>
          <span className="incorrect-count">❌ {incorrectCount}</span>
        </div>
      </div>
    </div>
  );
};

const Pratice: React.FC = () => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [chapterTitle, setChapterTitle] = useState(""); // Thêm state này
 
  const [searchParams] = useSearchParams();
  const lessonTitle = searchParams.get("title") || "";
  const navigate = useNavigate();
  const lessonId = Number(searchParams.get("lessonId"));
  const chapterId = Number(searchParams.get("chapterId")); // Lấy từ URL
  const practiceId = Number(searchParams.get("practiceSessionId"));
  const gradeId = searchParams.get("gradeId"); // Lấy gradeId từ URL
  const semester = searchParams.get("semester"); // Lấy semester từ URL

  // Track khi bắt đầu làm bài tập
  useEffect(() => {
    if (lessonTitle && lessonId) {
      trackStartPractice(lessonTitle, lessonId);
    }
  }, [lessonTitle, lessonId]);

  useEffect(() => {
    if (lessonId) {
      // Fetch questions trước, tạo practice session song song
      const fetchQuestionsPromise = fetchPracticeQuestionsByLesson(lessonId)
        .then((data) => {
          console.log("Questions API Response:", data);
          const questionsData = data.data?.questions ?? [];
          setQuestions(questionsData);
          
          // Lấy chapterId từ lesson đầu tiên để fetch chapter info
          if (questionsData.length > 0 && questionsData[0].lesson?.chapterId) {
            fetchAllChapters()
              .then((chaptersData) => {
                const chapters = chaptersData.chapters ?? [];
                const chapter = chapters.find((ch: any) => ch.id === questionsData[0].lesson.chapterId);
                if (chapter) {
                  setChapterTitle(chapter.title);
                }
              })
              .catch(() => setChapterTitle(""));
          }
          return questionsData;
        });

      

      // Chờ cả 2 promises
      Promise.all([fetchQuestionsPromise])
        .finally(() => setLoading(false));
    }
  }, [lessonId]);

  // Lấy tiêu đề chương từ chapterId trong URL
  useEffect(() => {
    if (chapterId) {
      fetchAllChapters().then((data) => {
        const chapters = data.chapters ?? [];
        const chapter = chapters.find((ch: any) => ch.id === chapterId);
        if (chapter) setChapterTitle(chapter.title);
      });
    }
  }, [chapterId]);

  // Khôi phục dữ liệu từ localStorage ngay khi khởi tạo
  const getSavedData = () => {
    if (practiceId) {
      const savedData = localStorage.getItem(`practice_${practiceId}`);
      console.log("🔍 Checking localStorage for practice_" + practiceId + ":", savedData);
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          console.log("🔄 Khởi tạo với dữ liệu đã lưu:", parsed);
          return parsed;
        } catch (e) {
          console.error("❌ Lỗi parse localStorage:", e);
        }
      } else {
        console.log("ℹ️ Không tìm thấy dữ liệu đã lưu trong localStorage");
      }
    } else {
      console.log("⚠️ practiceId chưa có khi khởi tạo");
    }
    return null;
  };

  const savedData = getSavedData();
  
  console.log("🎯 Initializing states with savedData:", savedData);

  // State declarations - khởi tạo với dữ liệu đã lưu nếu có
  const [current, setCurrent] = useState(savedData?.currentIndex || 0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showIncorrect, setShowIncorrect] = useState(false);
  const [correctCount, setCorrectCount] = useState(savedData?.correctCount || 0);
  const [incorrectCount, setIncorrectCount] = useState(savedData?.incorrectCount || 0);
  const [score, setScore] = useState(savedData?.score || 0);
  
  console.log("🎯 Initial state values:", {
    current: savedData?.currentIndex || 0,
    correctCount: savedData?.correctCount || 0,
    incorrectCount: savedData?.incorrectCount || 0,
    score: savedData?.score || 0
  });
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [restoredFromStorage, setRestoredFromStorage] = useState(!!savedData);
  const [isFinished, setIsFinished] = useState(false);
  const [usedQuestions, setUsedQuestions] = useState<Set<number>>(new Set());
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [duration, setDuration] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(savedData?.elapsedTime || 0);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  // Kiểm tra trạng thái session khi component mount
  useEffect(() => {
    const loadSessionData = async () => {
      if (practiceId && !sessionLoaded) {
        try {
          console.log("🔍 Loading practice session data for ID:", practiceId);
          
          // Kiểm tra trạng thái session trước
          const status = await checkPracticeSessionStatus(practiceId);
          console.log("📊 Session status:", status);
          
          if (status.completed) {
            setSessionCompleted(true);
            console.warn("Practice session already completed");
            alert("Phiên luyện tập này đã hoàn thành. Vui lòng tạo phiên mới.");
            navigate(-1);
            return;
          }
          
          // Lấy thông tin chi tiết về điểm số
          try {
            const scoreData = await fetchPracticeSessionScore(practiceId);
            console.log("📈 Session score data:", scoreData);
            
            // Không khôi phục ở đây nữa, để useEffect riêng xử lý sau khi questions load
            // Chỉ kiểm tra xem có dữ liệu trong localStorage không
            const savedData = localStorage.getItem(`practice_${practiceId}`);
            if (savedData) {
              console.log("💾 Phát hiện dữ liệu đã lưu, sẽ khôi phục sau khi questions load");
            } else if (scoreData && (scoreData.score !== undefined && scoreData.score > 0)) {
              // Fallback: sử dụng dữ liệu từ API nếu không có localStorage
              const currentScore = scoreData.score;
              const correctAnswers = Math.floor(currentScore / 10);
              
              console.log("🎯 Restoring session from API:", {
                score: currentScore,
                correctAnswers,
                incorrectCount: scoreData.incorrectAnswers || 0
              });
              
              setScore(currentScore);
              setCorrectCount(correctAnswers);
              setIncorrectCount(scoreData.incorrectAnswers || 0);
              
              // Tính thời gian đã trôi qua từ startedAt
              if (scoreData.startedAt) {
                const startTime = new Date(scoreData.startedAt).getTime();
                const now = Date.now();
                const elapsed = Math.floor((now - startTime) / 1000);
                setElapsedTime(elapsed);
                console.log(`⏰ Elapsed time: ${elapsed}s from ${scoreData.startedAt}`);
              }
              
              // Set current question sau khi có đủ dữ liệu
              const nextQuestionIndex = Math.min(correctAnswers, 9); // Giả sử có tối đa 10 câu
              setCurrent(nextQuestionIndex);
              console.log(`➡️ Resuming from question ${nextQuestionIndex + 1}`);
            } else {
              console.log("ℹ️ New session or no score yet");
            }
          } catch (scoreError) {
            console.warn("⚠️ Could not fetch session score:", scoreError);
          }
          
          setSessionLoaded(true);
        } catch (error) {
          console.error("❌ Error loading session data:", error);
          setSessionLoaded(true);
        }
      }
    };

    loadSessionData();
  }, [practiceId, navigate, sessionLoaded]);
  
  // Log thông tin khôi phục nếu có
  useEffect(() => {
    if (restoredFromStorage && savedData) {
      console.log("✅ Component đã khởi tạo với dữ liệu đã lưu:", {
        score: savedData.score,
        correctCount: savedData.correctCount,
        incorrectCount: savedData.incorrectCount,
        elapsedTime: savedData.elapsedTime,
        currentIndex: savedData.currentIndex,
        nextIndex: current
      });
    }
  }, []);
  
  // Xử lý khi user đóng tab hoặc reload trang
  useEffect(() => {
    const handleBeforeUnload = (_e: BeforeUnloadEvent) => {
      // Chỉ complete khi user đóng tab/reload, KHÔNG phải khi navigate
      if (practiceId && !sessionCompleted && !isFinished) {
        // Sử dụng sendBeacon để gửi request ngay cả khi trang đang đóng
        const data = JSON.stringify({ practiceSessionId: practiceId });
        navigator.sendBeacon(`/api/practice/complete/${practiceId}`, data);
        console.log("Session completed on page close/reload with score:", score);
      }
    };

    // Chỉ lắng nghe beforeunload (đóng tab, reload)
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup: chỉ remove listener, KHÔNG complete session
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [practiceId, sessionCompleted, isFinished, score]);

  // Timer tăng dần
  useEffect(() => {
    if (loading || isFinished) return; // Không đếm khi đang load hoặc đã hoàn thành
    
    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [loading, isFinished]);

  // Format thời gian thành MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayAudio = async () => {
    try {
      const currentQuestion = questions[current];
      if (!currentQuestion) {
        console.error("Không có câu hỏi hiện tại");
        return;
      }

      let audioUrl = currentQuestion.audioUrl;
      
      // Nếu không có audio, gọi API generate
      if (!audioUrl) {
        console.log("⚠️ Không có audio, đang generate...");
        setIsPlayingAudio(true); // Hiển thị loading
        
        try {
          const result = await generateQuestionAudio(currentQuestion.id);
          audioUrl = result.audioUrl;
          console.log("✅ Audio đã được generate:", audioUrl);
          
          // Cập nhật audioUrl vào câu hỏi hiện tại
          currentQuestion.audioUrl = audioUrl;
        } catch (generateError: any) {
          console.error("❌ Không thể generate audio:", generateError);
          setIsPlayingAudio(false);
          
          // Thông báo lỗi nhưng không chặn người dùng
          const errorMsg = generateError?.message || "Không thể tạo âm thanh";
          console.warn(`⚠️ ${errorMsg}. Người dùng có thể tiếp tục làm bài không cần audio.`);
          alert(`Tạm thời không có âm thanh cho câu hỏi này.\nBạn vẫn có thể làm bài bình thường.`);
          return;
        }
      }

      console.log("Đang phát audio:", audioUrl);
      setIsPlayingAudio(true);

      // Dừng audio cũ nếu đang phát
      if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
      }

      const audio = new Audio(audioUrl);
      setAudioElement(audio);
      
      audio.onended = () => {
        console.log("Audio đã phát xong");
        setIsPlayingAudio(false);
      };
      
      audio.onerror = (e) => {
        console.error("Lỗi khi phát audio:", e);
        console.error("Audio URL:", audioUrl);
        setIsPlayingAudio(false);
        alert("Không thể phát âm thanh. Vui lòng kiểm tra kết nối mạng.");
      };

      try {
        await audio.play();
        console.log("Audio đang phát...");
      } catch (playError) {
        console.error("Không thể phát audio:", playError);
        setIsPlayingAudio(false);
        alert("Không thể phát âm thanh. Trình duyệt có thể đã chặn tự động phát.");
      }
    } catch (error: unknown) {
      setIsPlayingAudio(false);
      console.error("Lỗi khi phát audio:", error);
    }
  };

  // Cleanup audio khi component unmount
  useEffect(() => {
    return () => {
      if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
      }
    };
  }, [audioElement]);

  // Hàm để chọn câu hỏi random
  const getRandomQuestion = () => {
    if (questions.length === 0) return 0;
    
    // Nếu đã dùng hết tất cả câu hỏi, reset lại
    if (usedQuestions.size >= questions.length) {
      setUsedQuestions(new Set());
    }
    
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * questions.length);
    } while (usedQuestions.has(randomIndex) && usedQuestions.size < questions.length);
    
    setUsedQuestions(prev => new Set([...prev, randomIndex]));
    return randomIndex;
  };

  // Sửa lại hàm handleSubmit cho đúng dữ liệu
  const handleSubmit = async () => {
    if (selected === null || sessionCompleted) return; // Kiểm tra sessionCompleted

    const currentQuestion = questions[current];
    const selectedAnswer = currentQuestion.answers[selected];
    const answerId = selectedAnswer.id;

    if (practiceId && !sessionCompleted) { // Kiểm tra session chưa complete
      try {
        const res = await savePracticeAnswer(practiceId, currentQuestion.id, answerId);
        console.log("savePracticeAnswer result:", res);
      } catch (error: unknown) {
        console.error("Error saving practice answer:", error);
        // Nếu lỗi 400, có thể session đã complete
        const err = error as {message?: string};
        const errorMessage = err?.message || '';
        if (errorMessage.includes("400") || errorMessage.includes("Không thể lưu câu trả lời")) {
          console.warn("Session may already be completed");
          setSessionCompleted(true);
          alert("Phiên luyện tập đã kết thúc. Vui lòng tạo phiên mới.");
          navigate(-1);
          return;
        }
      }
    } else {
      console.warn("practiceId is null or session completed, cannot save answer");
      return;
    }

    const isCorrect = questions[current].answers[selected]?.isCorrect;
    
    // Cập nhật điểm số và số câu đúng/sai
    if (isCorrect) {
      const newCorrectCount = correctCount + 1;
      const newScore = score + 10;
      setCorrectCount(newCorrectCount);
      setScore(newScore);
      setSelected(null);
      setShowIncorrect(false);
      
      // Reset audio state khi chuyển câu
      setIsPlayingAudio(false);
      if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
      }
      setAudioElement(null);
      
      // Kết thúc game khi đạt 100 điểm
      if (newScore >= 100) {
        // Gọi API complete session nếu có practiceId
        if (practiceId && !sessionCompleted) {
          try {
            await completePracticeSession(practiceId);
            setSessionCompleted(true); // Đánh dấu đã complete
            
            // Xóa dữ liệu đã lưu trong localStorage khi hoàn thành
            localStorage.removeItem(`practice_${practiceId}`);
            console.log("🗑️ Đã xóa dữ liệu practice khỏi localStorage");
            
            // Track hoàn thành bài tập với điểm số
            trackCompletePractice(lessonTitle, newScore, 10); // 10 câu = 100 điểm
          } catch (error) {
            console.error("Error completing practice session:", error);
          }
        }
        setIsFinished(true);
      } else if (current < questions.length - 1) {
        setCurrent(current + 1);
      } else {
        // Hết câu hỏi nhưng chưa đạt 100 điểm, random câu hỏi mới
        setCurrent(getRandomQuestion());
      }
    } else {
      const newIncorrectCount = incorrectCount + 1;
      const newScore = Math.max(0, score - 2); // Không cho điểm âm
      setIncorrectCount(newIncorrectCount);
      setScore(newScore);
      setShowIncorrect(true);
    }
  };

  const handleNext = () => {
    setShowIncorrect(false);
    setSelected(null);
    // Reset audio state
    setIsPlayingAudio(false);
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
    }
    setAudioElement(null);
    
    if (current < questions.length - 1) {
      setCurrent(current + 1);
    } else {
      // Hết câu hỏi nhưng chưa đạt 100 điểm, random câu hỏi mới
      if (score < 100) {
        setCurrent(getRandomQuestion());
      } else {
        setIsFinished(true);
      }
    }
  };

  // Sửa lại useEffect cleanup để không tự động complete session
  useEffect(() => {
    return () => {
      // Không tự động complete session khi unmount
      // Session chỉ được complete khi user đạt 100 điểm
      console.log("Component unmounting, session completion handled manually");
      console.log("=== DỮ LIỆU ĐƯỢC LƯU KHI THOÁT ===");
      console.log("Practice Session ID:", practiceId);
      console.log("Lesson ID:", lessonId);
      console.log("Lesson Title:", lessonTitle);
      console.log("Chapter ID:", chapterId);
      console.log("Chapter Title:", chapterTitle);
      console.log("Điểm hiện tại:", score);
      console.log("Số câu đúng:", correctCount);
      console.log("Số câu sai:", incorrectCount);
      console.log("Câu hỏi hiện tại (index):", current);
      console.log("Tổng số câu hỏi:", questions.length);
      console.log("Thời gian đã làm (giây):", elapsedTime);
      console.log("Thời gian đã làm (format):", formatTime(elapsedTime));
      console.log("Session đã hoàn thành:", sessionCompleted);
      console.log("Đã kết thúc:", isFinished);
      console.log("===================================");
      
      // Lưu vào localStorage để backup (nếu session chưa hoàn thành)
      if (!sessionCompleted && !isFinished && practiceId) {
        const practiceData = {
          practiceId,
          lessonId,
          lessonTitle,
          chapterId,
          chapterTitle,
          score,
          correctCount,
          incorrectCount,
          currentIndex: current,
          totalQuestions: questions.length,
          elapsedTime,
          savedAt: new Date().toISOString()
        };
        localStorage.setItem(`practice_${practiceId}`, JSON.stringify(practiceData));
        console.log("💾 Đã lưu dữ liệu vào localStorage:", practiceData);
      }
    };
  }, [practiceId, lessonId, lessonTitle, chapterId, chapterTitle, score, correctCount, incorrectCount, current, questions.length, elapsedTime, sessionCompleted, isFinished]);

  return (
    <div>
      {isFinished ? (
        <div style={{ marginTop: "-360px" }}>
          <Header bgWhite />
        </div>
      ) : (
        <div style={{ marginTop: "-30px" }}>
          <Header bgWhite />
        </div>
      )}
      <div className="pratice-container">
        {loading ? (
          <div>Đang tải câu hỏi...</div>
        ) : isFinished ? (
          <div className="pratice-finish-modal">
            <div style={{ marginTop: "28px", textAlign: "center" }}>
              {/* SVG pháo hoa đơn giản */}
              <svg width="120" height="120" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="40" fill="#FFD700" opacity="0.5" />
                <circle cx="60" cy="60" r="30" fill="#49BBBD" opacity="0.5" />
                <circle cx="60" cy="60" r="20" fill="#23BDEE" opacity="0.5" />
                <text
                  x="60"
                  y="70"
                  textAnchor="middle"
                  fontSize="22"
                  fill="#21867a"
                  fontWeight="bold"
                >
                  🎉
                </text>
              </svg>
              <div
                style={{
                  fontSize: "24px",
                  color: "#21867a",
                  fontWeight: "bold",
                  marginTop: "28px",
                }}
              >
                {score >= 100 ? "🎉 Xuất sắc! Bạn đã đạt 100 điểm!" : "Chúc mừng bạn đã hoàn thành bài thực hành!"}
              </div>
              <div
                style={{
                  marginTop: "12px",
                  fontSize: "18px",
                  color: "#252641",
                }}
              >
                Điểm số: <b style={{ color: "#FFD700", fontSize: "22px" }}>{score}/100</b>
                <br />
                Số câu đúng: <b style={{ color: "#4CAF50" }}>{correctCount}</b> &nbsp;|&nbsp; Số câu sai:{" "}
                <b style={{ color: "#F44336" }}>{incorrectCount}</b>
              </div>
              
              {/* Nút về trang học tập */}
              <button
                onClick={() => navigate('/study')}
                style={{
                  background: "#49BBBD",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: "18px",
                  border: "none",
                  borderRadius: "12px",
                  padding: "12px 32px",
                  marginTop: "24px",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  boxShadow: "0 4px 8px rgba(73, 187, 189, 0.3)"
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = "#3da5a7";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "#49BBBD";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                📚 Về trang học tập
              </button>
            </div>
          </div>
        ) : (
          <div className="pratice-question-block">
            <div className="pratice-question"><div style={{ fontSize: "22px", fontWeight: 500, color: "#0c1211ff", marginBottom: 16, textAlign: "left" }}>
              {chapterTitle ? (
                <span
                  className="pratice-chapter-link"
                  onClick={() => {
                    if (chapterId) {
                      // Truyền đầy đủ gradeId, semester và chapterId để quay về đúng trang
                      const params = new URLSearchParams();
                      params.append("chapterId", chapterId.toString());
                      if (gradeId) params.append("gradeId", gradeId);
                      if (semester) params.append("semester", semester);
                      navigate(`/study?${params.toString()}`);
                    } else {
                      navigate("/study");
                    }
                  }}
                  style={{
                    color: "#21867a",
                    textDecoration: "underline",
                    cursor: "pointer",
                    transition: "background 0.2s, color 0.2s",
                    padding: "2px 6px",
                    borderRadius: "6px",
                  }}
                  title="Quay về chương này"
                >
                  Chương: {chapterTitle}
                </span>
              ) : null}
              {chapterTitle ? " > " : ""}
              Phần thực hành: {lessonTitle}
            </div>
              <div className="question-header-row">
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  

                  <span
                    style={{
                      fontWeight: 500,
                      color: "#025122ff",
                      background: "#e0f7fa",
                      borderRadius: "8px",
                      padding: "4px 14px",
                      fontSize: "22px",
                      display: "inline-block",
                      minWidth: 110,
                      textAlign: "left",
                      boxShadow: "0 1px 4px #0001",
                    }}
                  >
                    Câu {current + 1}:
                  </span>
                  
                  {/* Icon Loa */}
                  <button
                    onClick={handlePlayAudio}
                    disabled={isPlayingAudio}
                    style={{
                      background: isPlayingAudio ? "#ff9800" : "#4CAF50",
                      border: "none",
                      borderRadius: "50%",
                      width: "40px",
                      height: "40px",
                      cursor: isPlayingAudio ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "18px",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                      transition: "all 0.3s ease",
                      opacity: isPlayingAudio ? 0.7 : 1
                    }}
                    onMouseOver={(e) => {
                      if (!isPlayingAudio) {
                        e.currentTarget.style.background = "#45a049";
                        e.currentTarget.style.transform = "scale(1.1)";
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!isPlayingAudio) {
                        e.currentTarget.style.background = "#4CAF50";
                        e.currentTarget.style.transform = "scale(1)";
                      }
                    }}
                    title={isPlayingAudio ? "Đang phát..." : "Nghe câu hỏi"}
                  >
                    {isPlayingAudio ? "⏸️" : "🔊"}
                  </button>
                  {/* Đồng hồ tính giờ */}
                  <div
                    style={{
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      color: "white",
                      padding: "8px 16px",
                      borderRadius: "20px",
                      fontSize: "16px",
                      fontWeight: "600",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      width:"98.15px",
                      boxShadow: "0 2px 8px rgba(102, 126, 234, 0.3)",
                      marginLeft:"100px"

                    }}
                  >
                    ⏱️ {formatTime(elapsedTime)}
                  </div>
                  
                </div>
                

                
                {/* Thanh điểm nằm bên phải */}
                <div className="score-bar-inline">
                  
                  <ScoreBar 
                    score={score} 
                    correctCount={correctCount} 
                    incorrectCount={incorrectCount} 
                  />
                </div>
              </div>

              {/* Hiển thị thông báo và giải thích khi trả lời sai - inline */}
              {showIncorrect && (
                <div style={{ 
                  marginTop: "20px", 
                  marginBottom: "20px",
                  backgroundColor: "#fff3cd",
                  border: "1px solid #ffeaa7",
                  borderRadius: "8px",
                  padding: "16px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      marginBottom: "12px",
                    }}
                  >
                    <img
                      src="/public/incorrect.png"
                      alt="incorrect"
                      style={{ width: "40px" }}
                    />
                    <span
                      style={{
                        color: "#856404",
                        fontWeight: 600,
                        fontSize: "18px",
                      }}
                    >
                      Sai rồi bé ơi, đọc kĩ lại đề nhé{" "}
                      <span style={{ color: "red" }}>❤️</span>
                    </span>
                  </div>
                  
                  <div
                    style={{
                      background: "#ffbc63",
                      borderRadius: "6px 6px 0 0",
                      padding: "8px 16px",
                      fontWeight: 600,
                      color: "#fff"
                    }}
                  >
                    <span role="img" aria-label="pin">
                      📍
                    </span>{" "}
                    Giải thích
                  </div>
                  
                  <div
                    style={{
                      background: "#fff",
                      borderRadius: "0 0 6px 6px",
                      padding: "16px",
                      border: "1px solid #ffbc63",
                      borderTop: "none"
                    }}
                  >
                    {/* Hiển thị giải thích nếu có */}
                    {questions[current]?.explanationText && (
                      <div style={{ marginBottom: "12px", fontSize: "16px", lineHeight: "1.5" }}>
                        {questions[current].explanationText}
                      </div>
                    )}
                    {questions[current]?.explanationImg && (
                      <div style={{ marginBottom: "12px" }}>
                        <img
                          src={questions[current].explanationImg}
                          alt="Giải thích"
                          style={{ maxWidth: "100%", height: "auto", display: "block" }}
                        />
                      </div>
                    )}
                    
                    <div style={{ marginBottom: "16px" }}>
                      <b>Đáp án đúng:</b>{" "}
                      {
                        questions[current]?.answers.find((ans: any) => ans.isCorrect)
                          ?.answerText
                      }
                    </div>
                    
                    <button
                      style={{
                        background: "#28a745",
                        color: "#fff",
                        fontWeight: 600,
                        fontSize: "16px",
                        border: "none",
                        borderRadius: "6px",
                        padding: "10px 24px",
                        cursor: "pointer",
                        transition: "background 0.3s ease"
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = "#218838";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = "#28a745";
                      }}
                      onClick={handleNext}
                    >
                      Đã hiểu
                    </button>
                  </div>
                </div>
              )}
              <span style={{ fontSize: "22px", color: "#252641" }}>
                {questions[current]?.questionText}
              </span>
              {questions[current]?.imageUrl && (
                <div
                  style={{
                    marginTop: 22,
                    alignItems: "center",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <img
                    src={questions[current].imageUrl}
                    alt="Hình minh họa"
                    style={{ maxWidth: 650, display: "block" }}
                  />
                </div>
              )}
            </div>
            <div className="pratice-options">
              {questions[current]?.answers.map((ans: any, idx: number) => (
                <label key={ans.id} className="pratice-option">
                  <input
                    type="radio"
                    name={`question-${current}`}
                    checked={selected === idx}
                    onChange={() => setSelected(idx)}
                    disabled={showIncorrect}
                  />
                  <span className="pratice-option-text">{ans.answerText}</span>
                </label>
              ))}
            </div>
            <div className="pratice-action-row">
              <button 
                className="pratice-submit-btn" 
                onClick={handleSubmit}
                disabled={showIncorrect || selected === null}
                style={{
                  opacity: showIncorrect || selected === null ? 0.5 : 1,
                  cursor: showIncorrect || selected === null ? 'not-allowed' : 'pointer'
                }}
              >
                Trả lời
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pratice;
