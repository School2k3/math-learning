import React, { useState, useEffect } from "react";
import Header from "../components/header";
import "../css/pratice.css";
import { fetchQuestionsByLesson } from "../api/praticeAPI";
import { useSearchParams } from "react-router-dom";

const Pratice: React.FC = () => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const lessonId = Number(searchParams.get("lessonId"));

  useEffect(() => {
    if (lessonId) {
      fetchQuestionsByLesson(lessonId)
        .then((data) => setQuestions(data.questions ?? []))
        .finally(() => setLoading(false));
    }
  }, [lessonId]);

  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showIncorrect, setShowIncorrect] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Sửa lại hàm handleSubmit cho đúng dữ liệu
  const handleSubmit = () => {
    if (selected === null) return;
    const isCorrect = questions[current].answers[selected]?.isCorrect;
    if (isCorrect) {
      setCorrectCount(correctCount + 1);
      setSelected(null);
      setShowIncorrect(false);
      if (current < questions.length - 1) {
        setCurrent(current + 1);
      } else {
        setIsFinished(true);
      }
    } else {
      setIncorrectCount(incorrectCount + 1);
      setShowIncorrect(true);
    }
  };

  const handleNext = () => {
    setShowIncorrect(false);
    setSelected(null);
    if (current < questions.length - 1) {
      setCurrent(current + 1);
    } else {
      setIsFinished(true);
    }
  };

  return (
    <div>
      {isFinished ? (
        <div style={{ marginTop: "-360px" }}>
          <Header bgWhite />
        </div>
      ) : showIncorrect ? (
        <div style={{ marginTop: "-270px" }}>
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
            <div style={{ textAlign: "center" }}>
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
                  marginTop: "18px",
                }}
              >
                Chúc mừng bạn đã hoàn thành bài thực hành!
              </div>
              <div
                style={{
                  marginTop: "12px",
                  fontSize: "18px",
                  color: "#252641",
                }}
              >
                Số câu đúng: <b>{correctCount}</b> &nbsp;|&nbsp; Số câu sai:{" "}
                <b>{incorrectCount}</b>
              </div>
            </div>
          </div>
        ) : !showIncorrect ? (
          <div className="pratice-question-block">
            <div className="pratice-question">
              <span
                style={{
                  fontWeight: 700,
                  marginLeft: -22,
                  color: "#1fdaf3ff",
                  background: "#e0f7fa",
                  borderRadius: "8px",
                  padding: "4px 14px",
                  fontSize: "20px",
                  display: "inline-block",
                  minWidth: 80,
                  textAlign: "center",
                  boxShadow: "0 1px 4px #0001",
                }}
              >
                Câu {current + 1}:
              </span>
              <span style={{ fontSize: "18px", color: "#252641" }}>
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
                    style={{ maxWidth: 550, display: "block" }}
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
        ) : (
          <div className="pratice-incorrect-modal">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "18px",
                marginBottom: "12px",
              }}
            >
              <img
                src="/public/incorrect.png"
                alt="incorrect"
                className="pratice-incorrect-img"
                style={{ width: "100px" }}
              />
              <span
                style={{
                  color: "#21867a",
                  fontWeight: 700,
                  fontSize: "22px",
                }}
              >
                Sai rồi bé ơi, đọc kĩ lại đề nhé{" "}
                <span style={{ color: "red" }}>❤️</span>
              </span>
            </div>
            <div
              className="pratice-incorrect-explain"
              style={{
                background: "#ffbc63",
                borderRadius: "6px 6px 0 0",
                padding: "8px 16px",
                fontWeight: 600,
              }}
            >
              <span role="img" aria-label="pin">
                📍
              </span>{" "}
              Giải thích
              {/* Hiển thị giải thích nếu có, nằm trong nền màu cam */}
              {questions[current]?.explanationText && (
                <div style={{ marginTop: 8 }}>{questions[current].explanationText}</div>
              )}
              {questions[current]?.explanationImg && (
                <div style={{ marginTop: 8 }}>
                  <img
                    src={questions[current].explanationImg}
                    alt="Giải thích"
                    style={{ maxWidth: 300, display: "block" }}
                  />
                </div>
              )}
            </div>
            <div
              style={{
                background: "#fff",
                borderRadius: "0 0 6px 6px",
                padding: "16px",
              }}
            >
              <div>
                <b>Đáp án đúng:</b>{" "}
                {
                  questions[current]?.answers.find((ans: any) => ans.isCorrect)
                    ?.answerText
                }
              </div>
              <button
                className="pratice-next-btn"
                style={{
                  background: "#ff5252",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: "18px",
                  border: "none",
                  borderRadius: "12px",
                  padding: "12px 48px",
                  marginTop: "18px",
                  cursor: "pointer",
                }}
                onClick={handleNext}
              >
                Đã hiểu
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pratice;
