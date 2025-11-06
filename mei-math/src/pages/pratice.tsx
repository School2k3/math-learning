import React, { useState, useEffect } from "react";
import Header from "../components/header";
import "../css/pratice.css";
import { 
  fetchQuestionsByLesson, 
  fetchQuestionAudio,
  completePracticeSession,
  savePracticeAnswer, // Nhập hàm lưu đáp án
  checkPracticeSessionStatus // Thêm import này
} from "../api/praticeAPI";
import { fetchAllChapters } from "../api/chapterAPI";
import { useSearchParams, useNavigate } from "react-router-dom";

// Component ScoreBar
const ScoreBar: React.FC<{ 
  score: number; 
  correctCount: number; 
  incorrectCount: number; 
}> = ({ score, correctCount, incorrectCount }) => {
  const progress = Math.min(score, 100);
  
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

  useEffect(() => {
    if (lessonId) {
      // Fetch questions trước, tạo practice session song song
      const fetchQuestionsPromise = fetchQuestionsByLesson(lessonId)
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

  // Kiểm tra trạng thái session khi component mount
  useEffect(() => {
    if (practiceId) {
      checkPracticeSessionStatus(practiceId)
        .then((status) => {
          console.log("Session status:", status);
          if (status.completed) {
            setSessionCompleted(true);
            console.warn("Practice session already completed");
            // Có thể redirect về study page hoặc hiển thị thông báo
            alert("Phiên luyện tập này đã hoàn thành. Vui lòng tạo phiên mới.");
            navigate(-1); // Quay lại trang trước
          }
        })
        .catch((error) => {
          console.error("Error checking session status:", error);
        });
    }
  }, [practiceId, navigate]);

  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showIncorrect, setShowIncorrect] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [usedQuestions, setUsedQuestions] = useState<Set<number>>(new Set());
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [sessionCompleted, setSessionCompleted] = useState(false); // Thêm state này
  const handlePlayAudio = async () => {
    try {
      setIsPlayingAudio(true);
      const currentQuestion = questions[current];
      if (!currentQuestion?.id) return;

      const audioData = await fetchQuestionAudio(currentQuestion.id);
      if (audioData.audioUrl) {
        // Dừng audio cũ nếu đang phát
        if (audioElement) {
          audioElement.pause();
          audioElement.currentTime = 0;
        }

        const audio = new Audio(audioData.audioUrl);
        setAudioElement(audio);
        
        audio.onended = () => {
          setIsPlayingAudio(false);
        };
        
        audio.onerror = () => {
          setIsPlayingAudio(false);
          console.error("Không thể phát audio");
        };

        await audio.play();
      }
    } catch (error) {
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
      } catch (error) {
        console.error("Error saving practice answer:", error);
        // Nếu lỗi 400, có thể session đã complete
        if (error.message.includes("400") || error.message.includes("Không thể lưu câu trả lời")) {
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
      
      // Kết thúc game khi đạt 100 điểm
      if (newScore >= 100) {
        // Gọi API complete session nếu có practiceId
        if (practiceId && !sessionCompleted) {
          try {
            await completePracticeSession(practiceId);
            setSessionCompleted(true); // Đánh dấu đã complete
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
    };
  }, []);

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
            {/* Thêm dòng này phía trên Câu */}
            
            <div className="pratice-question"><div style={{ fontSize: "22px", fontWeight: 500, color: "#0c1211ff", marginBottom: 16, textAlign: "left" }}>
              {chapterTitle ? (
                <span
                  className="pratice-chapter-link"
                  onClick={() => {
                    if (chapterId) {
                      navigate(`/study?chapterId=${chapterId}`);
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
                  />
                  <span className="pratice-option-text">{ans.answerText}</span>
                </label>
              ))}
            </div>
            <div className="pratice-action-row">
              <button className="pratice-submit-btn" onClick={handleSubmit}>
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
