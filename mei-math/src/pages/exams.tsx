import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/header";
import "../css/exams.css";

type Status = "not_answered" | "current" | "review" | "answered";

const Exams: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Lấy dữ liệu exam từ location.state
  const exam = location.state?.exam;
  const examQuestions = exam?.examQuestions || [];
  const durationMinutes = exam?.durationMinutes || 30;
  const examTitle = exam?.title || "Bài kiểm tra";
  const chapterId = location.state?.chapterId; // Sửa lại, không lấy từ searchParams
  const chapterTitle = location.state?.chapterTitle || ""; // Truyền từ study-page khi navigate

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(examQuestions.length).fill(null));
  const [reviewFlags, setReviewFlags] = useState<boolean[]>(Array(examQuestions.length).fill(false));
  const [secondsLeft, setSecondsLeft] = useState(durationMinutes * 60);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => {
      setSecondsLeft(sec => sec - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  // Tính trạng thái cho từng câu hỏi
  const getStatus = (idx: number): Status => {
    if (idx === current) return "current";
    if (answers[idx] !== null) return "answered";
    if (reviewFlags[idx]) return "review";
    return "not_answered";
  };

  const handleSelect = (idx: number) => {
    setCurrent(idx);
  };

  const handleAnswer = (idx: number) => {
    setAnswers(ans => {
      const newAns = [...ans];
      newAns[current] = idx;
      return newAns;
    });
  };

  const handleReviewFlag = () => {
    setReviewFlags(flags => {
      const newFlags = [...flags];
      newFlags[current] = !newFlags[current];
      return newFlags;
    });
  };

  // Hàm format thời gian
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (secondsLeft <= 0 && !showResult) {
      handleSubmitExam();
    }
    // eslint-disable-next-line
  }, [secondsLeft]);

  const handleSubmitExam = () => {
    let correct = 0;
    examQuestions.forEach((q: any, idx: number) => {
      const correctIdx = q.question.answers?.findIndex((a: any) => a.isCorrect);
      if (answers[idx] === correctIdx) correct++;
    });
    setScore(correct);
    setShowResult(true);
  };

  if (!exam || !Array.isArray(examQuestions) || examQuestions.length === 0) {
    return (
      <div>
        <Header bgWhite />
        <div style={{ textAlign: "center", marginTop: 60, fontSize: 20 }}>
          Không có dữ liệu bài kiểm tra!
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginTop: "-30px" }}>
        <Header bgWhite />
      </div>
      <div className="exams-container">
        <div className="exams-main-row">
          <div className="exams-main-left">
            {/* Sửa phần tiêu đề như sau */}
            <div className="exams-title" style={{ textAlign: "left", fontWeight: 700, fontSize: "22px", color: "#0c1211ff", marginBottom: "24px" }}>
              {chapterTitle ? (
                <span
                  className="exams-chapter-link"
                  style={{
                    color: "#21867a",
                    textDecoration: "underline",
                    cursor: "pointer",
                    transition: "background 0.2s, color 0.2s",
                    padding: "2px 6px",
                    borderRadius: "6px",
                  }}
                  onClick={() => navigate(`/study?chapterId=${chapterId}`)}
                  onMouseOver={e => {
                    e.currentTarget.style.background = "#e0f7fa";
                    e.currentTarget.style.color = "#23bdee";
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#21867a";
                  }}
                  title="Quay về chương này"
                >
                  Chương: {chapterTitle}
                </span>
              ) : null}
              {chapterTitle ? " > " : ""}
              Kiểm tra: {examTitle}
            </div>
            <div className="exams-question-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                {/* SVG và tiêu đề */}
                <svg width="36" height="34" viewBox="0 0 36 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M33.0173 23.0142C31.957 25.3909 30.2986 27.4851 28.1871 29.114C26.0756 30.7428 23.5753 31.8565 20.9047 32.3578C18.2342 32.8592 15.4747 32.7328 12.8676 31.9898C10.2605 31.2468 7.88505 29.9098 5.94904 28.0956C4.01303 26.2814 2.57536 24.0454 1.76173 21.5829C0.948099 19.1205 0.783274 16.5066 1.28167 13.9699C1.78006 11.4331 2.9265 9.05064 4.62075 7.03084C6.315 5.01103 8.50548 3.41535 11.0007 2.3833" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M34.3339 16C34.3339 14.0302 33.9028 12.0796 33.0652 10.2597C32.2277 8.43986 31 6.78628 29.4523 5.3934C27.9047 4.00052 26.0674 2.89563 24.0453 2.14181C22.0232 1.38799 19.8559 1 17.6672 1V16H34.3339Z" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span style={{ fontWeight: 600, fontSize: "18px" }}>Câu hỏi số {current + 1}</span>
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <input
                  type="checkbox"
                  checked={reviewFlags[current]}
                  onChange={handleReviewFlag}
                  style={{ width: "20px", height: "20px" }}
                />
                <span style={{ fontWeight: 500 }}>Phân vân</span>
              </label>
            </div>
            <div className="exams-question-block">
              {/* Hiển thị câu hỏi hiện tại */}
              <div className="exams-question">
                {examQuestions[current]?.question?.questionText}
                {examQuestions[current]?.question?.imageUrl && (
                  <div style={{ marginTop: 16, display: "flex", justifyContent: "center" }}>
                    <img
                      src={examQuestions[current].question.imageUrl}
                      alt="Hình minh họa"
                      style={{ maxWidth: 400, maxHeight: 140, display: "block" }}
                    />
                  </div>
                )}
              </div>
              <div className="exams-options">
                {examQuestions[current]?.question?.answers?.map((opt: any, idx: number) => (
                  <label key={idx} className="exams-option">
                    <input
                      type="radio"
                      name={`question-${current}`}
                      checked={answers[current] === idx}
                      onChange={() => handleAnswer(idx)}
                    />
                    <span className="exams-option-text">{opt.answerText}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="exams-action-row" style={{ display: "flex", justifyContent: "space-between" }}>
              <button
                className="exams-prev-btn"
                onClick={() => setCurrent(current > 0 ? current - 1 : current)}
                style={{
                  background: "#ffbc63",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: "18px",
                  border: "none",
                  borderRadius: "12px",
                  padding: "12px 48px",
                  marginTop: "18px",
                  cursor: "pointer",
                  height: 48
                }}
              >
                Câu hỏi phía trước
              </button>
              <button
                className="exams-next-btn"
                onClick={() => setCurrent(current < examQuestions.length - 1 ? current + 1 : current)}
                style={{
                  background: "#49bbbd",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: "18px",
                  border: "none",
                  borderRadius: "12px",
                  padding: "12px 48px",
                  marginTop: "18px",
                  cursor: "pointer"
                }}
              >
                Câu hỏi tiếp theo
              </button>
            </div>
          </div>
          <div className="exams-main-right">
            <div className="exams-timer" style={{
              background: "#b6e6e6",
              borderRadius: "8px",
              padding: "12px 0",
              textAlign: "center",
              fontWeight: 600,
              fontSize: "20px",
              marginBottom: "12px"
            }}>
              {formatTime(secondsLeft)}
            </div>
            <button
              style={{
                background: "#ff5252",
                color: "#fff",
                fontWeight: 600,
                fontSize: "18px",
                border: "none",
                borderRadius: "8px",
                padding: "12px 0",
                width: "100%",
                marginBottom: "18px",
                cursor: "pointer"
              }}
              onClick={() => setShowReview(true)}
              disabled={showResult}
            >
              NỘP BÀI
            </button>
            <div className="exams-question-list">
              <div style={{ fontWeight: 600, marginBottom: "8px" }}>Danh sách câu hỏi</div>
              <div className="exams-question-numbers">
                {examQuestions.map((q: any, idx: number) => {
                  const status = getStatus(idx);
                  let bg = "#eaf6fb";
                  if (status === "current") bg = "#23bdee";
                  else if (status === "review") bg = "#ffbc63";
                  else if (status === "answered") bg = "#4caf50";
                  return (
                    <span
                      key={q.id}
                      className="exams-question-number"
                      style={{
                        background: bg,
                        color: status === "current" ? "#fff" : "#252641",
                        borderRadius: "6px",
                        width: "28px",
                        height: "28px",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "2px",
                        fontWeight: 600,
                        cursor: "pointer",
                        border: "1px solid #ccc"
                      }}
                      onClick={() => handleSelect(idx)}
                    >
                      {idx + 1}
                    </span>
                  );
                })}
              </div>
              <div className="exams-legend" style={{ marginTop: "18px" }}>
                <div style={{ fontWeight: 600, marginBottom: "6px" }}>Chú thích</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "15px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ width: "18px", height: "18px", background: "#eaf6fb", borderRadius: "4px", border: "1px solid #ccc", display: "inline-block" }}></span>
                    Câu hỏi chưa trả lời
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ width: "18px", height: "18px", background: "#23bdee", borderRadius: "4px", border: "1px solid #ccc", display: "inline-block" }}></span>
                    Câu hỏi hiện tại
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ width: "18px", height: "18px", background: "#ffbc63", borderRadius: "4px", border: "1px solid #ccc", display: "inline-block" }}></span>
                    Câu hỏi đang cân nhắc
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ width: "18px", height: "18px", background: "#4caf50", borderRadius: "4px", border: "1px solid #ccc", display: "inline-block" }}></span>
                    Câu hỏi đã trả lời
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {showResult && (
          <div className="exams-result-modal" style={{
            position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
            background: "rgba(0,0,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999
          }}>
            <div style={{
              background: "#fff", borderRadius: "16px", padding: "32px", minWidth: "400px", maxHeight: "80vh", overflowY: "auto", textAlign: "center"
            }}>
              <h2 style={{ color: "#23bdee", textAlign: "center" }}>Kết quả bài kiểm tra</h2>
              <div style={{ fontSize: "24px", fontWeight: 700, margin: "24px 0" }}>
                Điểm số của bạn: {Math.round(score / examQuestions.length * 10)}/10
              </div>
              <button
                style={{
                  background: "#49bbbd", color: "#fff", fontWeight: 600, fontSize: "18px",
                  border: "none", borderRadius: "12px", padding: "12px 48px", cursor: "pointer"
                }}
                onClick={() => navigate("/study")}
              >
                Đóng
              </button>
            </div>
          </div>
        )}
        {showReview && (
          <div className="exams-review-modal" style={{
            position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
            background: "rgba(0,0,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999
          }}>
            <div style={{
              background: "#fff", borderRadius: "16px", padding: "32px", minWidth: "400px", maxHeight: "80vh", overflowY: "auto"
            }}>
              <h2 style={{ color: "#23bdee", textAlign: "center" }}>Xác nhận nộp bài</h2>
              <div style={{ marginBottom: "16px", fontWeight: 500 }}>
                Thời gian còn lại: <span style={{ color: "#ff5252" }}>{formatTime(secondsLeft)}</span>
              </div>
              <div style={{ marginBottom: "16px" }}>
                <strong>Danh sách câu hỏi:</strong>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "8px" }}>
                  {examQuestions.map((q: any, idx: number) => {
                    const answered = answers[idx] !== null;
                    const flagged = reviewFlags[idx];
                    return (
                      <span
                        key={q.id}
                        style={{
                          background: answered ? "#4caf50" : "#eaf6fb",
                          color: flagged ? "#ffbc63" : "#252641",
                          borderRadius: "6px",
                          width: "32px",
                          height: "32px",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 600,
                          border: flagged ? "2px solid #ffbc63" : "1px solid #ccc",
                          cursor: "pointer",
                          position: "relative"
                        }}
                        title={
                          answered
                            ? flagged
                              ? "Đã trả lời & Đánh dấu"
                              : "Đã trả lời"
                            : flagged
                              ? "Chưa trả lời & Đánh dấu"
                              : "Chưa trả lời"
                        }
                        onClick={() => {
                          setCurrent(idx);
                          setShowReview(false);
                        }}
                      >
                        {idx + 1}
                        {flagged && (
                          <span style={{
                            position: "absolute",
                            top: "-6px",
                            right: "-6px",
                            fontSize: "14px",
                            color: "#ffbc63"
                          }}>★</span>
                        )}
                      </span>
                    );
                  })}
                </div>
              </div>
              {/* Thống kê trạng thái */}
              <div style={{ marginBottom: "16px", fontSize: "15px" }}>
                <span style={{ color: "#4caf50", fontWeight: 600 }}>
                  Đã trả lời: {answers.filter(a => a !== null).length}
                </span>
                {" | "}
                <span style={{ color: "#eaf6fb", fontWeight: 600 }}>
                  Chưa trả lời: {answers.filter(a => a === null).length}
                </span>
                {" | "}
                <span style={{ color: "#ffbc63", fontWeight: 600 }}>
                  Đã đánh dấu: {reviewFlags.filter(f => f).length}
                </span>
              </div>
              {/* Cảnh báo nếu còn câu chưa trả lời */}
              {answers.filter(a => a === null).length > 0 && (
                <div style={{ color: "#d32f2f", marginBottom: "12px", fontWeight: 500 }}>
                  Bạn còn {answers.filter(a => a === null).length} câu chưa trả lời!
                </div>
              )}
              <div style={{ display: "flex", gap: "16px", justifyContent: "center", marginTop: "18px" }}>
                <button
                  style={{
                    background: "#49bbbd", color: "#fff", fontWeight: 600, fontSize: "18px",
                    border: "none", borderRadius: "12px", padding: "12px 32px", cursor: "pointer"
                  }}
                  onClick={() => setShowReview(false)}
                >
                  Quay lại làm bài
                </button>
                <button
                  style={{
                    background: "#ff5252", color: "#fff", fontWeight: 600, fontSize: "18px",
                    border: "none", borderRadius: "12px", padding: "12px 32px", cursor: "pointer"
                  }}
                  onClick={() => {
                    setShowReview(false);
                    handleSubmitExam();
                  }}
                >
                  Nộp bài và kết thúc
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Exams;