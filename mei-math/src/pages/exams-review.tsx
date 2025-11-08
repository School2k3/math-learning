import React, { useState, useEffect } from "react";
import Header from "../components/header";
import { useNavigate, useParams } from "react-router-dom";
import { fetchExamResultDetail } from "../api/examAPI";
import "../css/exams-review.css";

const ExamsReview: React.FC = () => {
  const [examDetail, setExamDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { resultId } = useParams<{ resultId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    const loadExamDetail = async () => {
      if (!resultId) return;

      try {
        const result = await fetchExamResultDetail(Number(resultId));
        console.log("Exam detail:", result);
        setExamDetail(result.examResult);
      } catch (error) {
        console.error("Error loading exam detail:", error);
      } finally {
        setLoading(false);
      }
    };

    loadExamDetail();
  }, [resultId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffSecs = Math.floor((diffMs % 60000) / 1000);
    return `${diffMins} phút ${diffSecs} giây`;
  };

  if (loading) {
    return (
      <div className="exams-review-container">
        <Header bgWhite />
        <div className="loading-state">Đang tải chi tiết bài kiểm tra...</div>
      </div>
    );
  }

  if (!examDetail) {
    return (
      <div className="exams-review-container">
        <Header bgWhite />
        <div className="error-state">Không tìm thấy kết quả bài kiểm tra</div>
      </div>
    );
  }

  const correctAnswers = examDetail.examAnswers?.filter((ans: any) => ans.isCorrect).length || 0;
  const totalQuestions = examDetail.examAnswers?.length || 0;

  return (
    <div className="exams-review-container">
      <Header bgWhite />
      
      <div className="exams-review-content">
        {/* Header Section */}
        <div className="review-header">
          <button 
            className="back-btn"
            onClick={() => navigate("/exams/history")}
          >
            ← Quay lại danh sách
          </button>
          <h1 className="review-title">Chi tiết bài kiểm tra</h1>
        </div>

        {/* Summary Card */}
        <div className="summary-card">
          <div className="summary-row">
            <div className="summary-item">
              <span className="summary-label">Bài kiểm tra:</span>
              <span className="summary-value">{examDetail.examId}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Ngày làm:</span>
              <span className="summary-value">{formatDate(examDetail.startedAt)}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Thời gian:</span>
              <span className="summary-value">
                {examDetail.finishedAt 
                  ? formatDuration(examDetail.startedAt, examDetail.finishedAt)
                  : "Chưa hoàn thành"
                }
              </span>
            </div>
          </div>
          <div className="summary-row">
            <div className="summary-item">
              <span className="summary-label">Số điểm:</span>
              <span className={`summary-value score ${examDetail.score >= 80 ? 'high' : examDetail.score >= 50 ? 'medium' : 'low'}`}>
                {examDetail.score} / 100
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Kết quả:</span>
              <span className="summary-value">
                {correctAnswers} / {totalQuestions} câu đúng
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Trạng thái:</span>
              <span className={`summary-value status ${examDetail.finishedAt ? 'completed' : 'in-progress'}`}>
                {examDetail.finishedAt ? 'Hoàn thành' : 'Đang làm'}
              </span>
            </div>
          </div>
        </div>

        {/* Questions Review */}
        <div className="questions-review">
          <h2 className="section-title">Chi tiết từng câu hỏi</h2>
          
          {examDetail.examAnswers && examDetail.examAnswers.length > 0 ? (
            examDetail.examAnswers.map((answer: any, index: number) => {
              const question = answer.question;
              const userAnswer = question?.answers?.find((a: any) => a.id === answer.chosenAnswerId);
              const correctAnswer = question?.answers?.find((a: any) => a.isCorrect);
              
              return (
                <div 
                  key={answer.id} 
                  className={`question-card ${answer.isCorrect ? 'correct' : 'incorrect'}`}
                >
                  <div className="question-header">
                    <span className="question-number">Câu {index + 1}</span>
                    <span className={`question-status ${answer.isCorrect ? 'correct' : 'incorrect'}`}>
                      {answer.isCorrect ? '✓ Đúng' : '✗ Sai'}
                    </span>
                  </div>

                  <div className="question-content">
                    <p className="question-text">{question?.questionText}</p>
                    {question?.imageUrl && (
                      <img 
                        src={question.imageUrl} 
                        alt="Question" 
                        className="question-image"
                      />
                    )}
                  </div>

                  <div className="answers-section">
                    <div className="answer-item user-answer">
                      <strong>Câu trả lời của bạn:</strong>
                      <span className={answer.isCorrect ? 'correct-text' : 'incorrect-text'}>
                        {userAnswer?.answerText || "Chưa trả lời"}
                      </span>
                    </div>

                    {!answer.isCorrect && (
                      <div className="answer-item correct-answer">
                        <strong>Đáp án đúng:</strong>
                        <span className="correct-text">
                          {correctAnswer?.answerText}
                        </span>
                      </div>
                    )}

                    {question?.explanationText && (
                      <div className="explanation-box">
                        <strong>Giải thích:</strong>
                        <p>{question.explanationText}</p>
                        {question.explanationImg && (
                          <img 
                            src={question.explanationImg} 
                            alt="Explanation" 
                            className="explanation-image"
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="no-answers">Không có dữ liệu câu trả lời</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamsReview;
