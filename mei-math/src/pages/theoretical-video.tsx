import React, { useState, useEffect } from "react";
import Header from "../components/header";
import "../css/theoretical-video.css";
import { useNavigate, useSearchParams } from "react-router-dom";
import { fetchAllChapters } from "../api/chapterAPI";
import { trackWatchVideo } from "../components/GoogleAnalytics";
import { createOrUpdatePracticeSession } from "../api/praticeAPI";
import { useAuth } from "../contexts/AuthContext";
import {
  getReviewsByLessonId,
  getUserLikedReviews,
  createLessonReview,
  toggleLikeReview,
  deleteLessonReview,
} from "../api/lessonReviewAPI";
import type { LessonReview, ReviewStatistics } from "../api/lessonReviewAPI";
    

const TheoreticalVideo: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth(); // Thêm useAuth
  const [chapterTitle, setChapterTitle] = useState(""); // Thêm state cho chapter title
  const videoUrl = searchParams.get("videoUrl") || "/videos/ToanLop3_Dayso.mp4";
  const title = searchParams.get("title") || "";
  const lessonId = searchParams.get("lessonId"); // Lấy lessonId từ URL
  const chapterId = searchParams.get("chapterId"); // Thêm chapterId từ URL
  const gradeId = searchParams.get("gradeId"); // Lấy gradeId từ URL
  const semester = searchParams.get("semester"); // Lấy semester từ URL

  // States cho reviews
  const [reviews, setReviews] = useState<LessonReview[]>([]);
  const [statistics, setStatistics] = useState<ReviewStatistics | null>(null);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [userLikedReviews, setUserLikedReviews] = useState<number[]>([]);
  const [selectedRating, setSelectedRating] = useState<number | undefined>(undefined);
  
  // States cho form tạo review
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // Track khi xem video
  useEffect(() => {
    if (title && lessonId) {
      trackWatchVideo(title, Number(lessonId));
    }
  }, [title, lessonId]);

  // Fetch chapter title khi component mount
  useEffect(() => {
    if (chapterId) {
      fetchAllChapters()
        .then((chaptersData) => {
          const chapters = chaptersData.chapters ?? [];
          const chapter = chapters.find((ch: any) => ch.id === Number(chapterId));
          if (chapter) {
            setChapterTitle(chapter.title);
          }
        })
        .catch(() => setChapterTitle(""));
    }
  }, [chapterId]);

  // Load reviews khi component mount
  useEffect(() => {
    if (lessonId) {
      loadReviews();
      if (user?.id) {
        loadUserLikedReviews();
      }
    }
  }, [lessonId, selectedRating, user?.id]);

  const loadReviews = async () => {
    if (!lessonId) return;
    
    setLoadingReviews(true);
    try {
      const result = await getReviewsByLessonId(Number(lessonId), selectedRating);
      setReviews(result.reviews);
      setStatistics(result.statistics);
    } catch (error) {
      console.error("Error loading reviews:", error);
    } finally {
      setLoadingReviews(false);
    }
  };

  const loadUserLikedReviews = async () => {
    if (!lessonId) return;
    
    try {
      const result = await getUserLikedReviews(Number(lessonId));
      setUserLikedReviews(result.likes);
    } catch (error) {
      console.error("Error loading user liked reviews:", error);
    }
  };

  const handleCreateReview = async () => {
    if (!user?.id || !lessonId) {
      alert("Vui lòng đăng nhập để đánh giá!");
      return;
    }

    setSubmittingReview(true);
    try {
      const result = await createLessonReview({
        userId: user.id,
        lessonId: Number(lessonId),
        rating: newRating,
        comment: newReviewText.trim() || undefined,
      });

      if (result.review) {
        alert("Đánh giá thành công!");
        // Reset form
        setShowReviewForm(false);
        setNewRating(5);
        setNewReviewText("");
        // Reload reviews and statistics
        await loadReviews();
        await loadUserLikedReviews();
      }
    } catch (error) {
      alert("Không thể gửi đánh giá. Vui lòng thử lại!");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleToggleLike = async (reviewId: number) => {
    if (!user?.id || !lessonId) {
      alert("Vui lòng đăng nhập để thích đánh giá!");
      return;
    }

    const isCurrentlyLiked = userLikedReviews.includes(reviewId);
    
    try {
      await toggleLikeReview(reviewId, Number(lessonId), !isCurrentlyLiked);
      
      // Update local state
      if (isCurrentlyLiked) {
        setUserLikedReviews(userLikedReviews.filter(id => id !== reviewId));
      } else {
        setUserLikedReviews([...userLikedReviews, reviewId]);
      }
      
      loadReviews(); // Reload to get updated like counts
    } catch (error) {
      alert("Không thể cập nhật. Vui lòng thử lại!");
    }
  };

  const handleDeleteReview = async (reviewUserId: number) => {
    if (!user?.id || !lessonId) return;
    if (user.id !== reviewUserId) {
      alert("Bạn chỉ có thể xóa đánh giá của mình!");
      return;
    }

    if (!window.confirm("Bạn có chắc chắn muốn xóa đánh giá này?")) {
      return;
    }

    try {
      const result = await deleteLessonReview(user.id, Number(lessonId));
      if (result.success) {
        alert("Xóa đánh giá thành công!");
        loadReviews();
      }
    } catch (error) {
      alert("Không thể xóa đánh giá. Vui lòng thử lại!");
    }
  };

  return (
    <div>
      <div style={{ marginTop: "-30px" }}>
        <Header bgWhite />
      </div>
      <div className="video-page-container">
        {/* Thêm text-info phía trên video */}
        <div className="video-page-info">
          {chapterTitle ? (
            <span
              className="video-chapter-link"
              style={{
                color: "#21867a",
                textDecoration: "underline",
                cursor: "pointer",
                transition: "background 0.2s, color 0.2s",
                padding: "2px 6px",
                borderRadius: "6px",
              }}
              onClick={() => {
                // Truyền đầy đủ gradeId, semester và chapterId để quay về đúng trang
                const params = new URLSearchParams();
                if (chapterId) params.append("chapterId", chapterId);
                if (gradeId) params.append("gradeId", gradeId);
                if (semester) params.append("semester", semester);
                navigate(`/study?${params.toString()}`);
              }}
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
          Video: {title}
        </div>
        
        <div className="video-player-wrapper">
          <video
  className="video-player"
  controls
  poster="/static/images/banner-home-img.png"
  src={videoUrl}
/>
        </div>
        <div className="video-info-row">
          <div className="video-info-left">
            <div className="video-info-title">{title}</div>
            <div className="video-info-stats">
              <span className="video-info-stat">
                {/* SVG lượt view */}
                <svg width="23" height="16" viewBox="0 0 23 16" fill="none">
                  <path d="M22.3438 7.70312C22.4219 7.85938 22.4609 8.05469 22.4609 8.28906C22.4609 8.48438 22.4219 8.67969 22.3438 8.83594C20.2344 12.9766 16.0156 15.75 11.25 15.75C6.44531 15.75 2.22656 12.9766 0.117188 8.83594C0.0390625 8.67969 0 8.48438 0 8.25C0 8.05469 0.0390625 7.85938 0.117188 7.70312C2.22656 3.5625 6.44531 0.75 11.25 0.75C16.0156 0.75 20.2344 3.5625 22.3438 7.70312ZM11.25 13.875V13.9141C14.3359 13.9141 16.875 11.375 16.875 8.28906V8.25C16.875 5.16406 14.3359 2.625 11.25 2.625C8.125 2.625 5.625 5.16406 5.625 8.25C5.625 11.375 8.125 13.875 11.25 13.875ZM11.25 4.5V4.53906C13.3203 4.53906 15 6.17969 15 8.25C15 10.3203 13.3203 12 11.25 12C9.17969 12 7.5 10.3203 7.5 8.25C7.5 7.9375 7.53906 7.58594 7.61719 7.27344C7.92969 7.50781 8.32031 7.625 8.75 7.625C9.76562 7.625 10.5859 6.80469 10.5859 5.78906C10.5859 5.35938 10.4688 4.96875 10.2344 4.65625C10.5469 4.57812 10.8984 4.53906 11.25 4.5Z" fill="#49BBBD"/>
                </svg>
                <span>261,232</span>
              </span>
              <span className="video-info-stat">
                {/* SVG like */}
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <path d="M6 10L10 1C10.7956 1 11.5587 1.31607 12.1213 1.87868C12.6839 2.44129 13 3.20435 13 4V8H18.66C18.9499 7.99672 19.2371 8.0565 19.5016 8.17522C19.7661 8.29393 20.0016 8.46873 20.1919 8.68751C20.3821 8.90629 20.5225 9.16382 20.6033 9.44225C20.6842 9.72068 20.7035 10.0134 20.66 10.3L19.28 19.3C19.2077 19.7769 18.9654 20.2116 18.5979 20.524C18.2304 20.8364 17.7623 21.0055 17.28 21H6M6 10V21M6 10H3C2.46957 10 1.96086 10.2107 1.58579 10.5858C1.21071 10.9609 1 11.4696 1 12V19C1 19.5304 1.21071 20.0391 1.58579 20.4142C1.96086 20.7893 2.46957 21 3 21H6" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>261,232</span>
              </span>
            </div>
          </div>
          <div className="video-info-right">
            <button 
              className="video-action-btn"
              onClick={async () => {
                if (!lessonId) {
                  alert("Không tìm thấy thông tin bài học!");
                  return;
                }
                try {
                  const userId = user?.id || 1;
                  const result = await createOrUpdatePracticeSession(userId, Number(lessonId));
                  console.log("createOrUpdatePracticeSession result:", result);
                  const practiceSessionId = result.practiceSession?.id ?? result.data?.practiceSession?.id;

                  if (!practiceSessionId) {
                    console.error("No practiceSession id returned from API", result);
                    throw new Error("Failed to create practice session ID");
                  }

                  // Navigate to practice với đầy đủ params như study-page
                  navigate(
                    `/pratice?lessonId=${lessonId}&title=${encodeURIComponent(title)}&chapterId=${chapterId}&practiceSessionId=${practiceSessionId}&gradeId=${gradeId}&semester=${semester}`
                  );
                } catch (error) {
                  console.error("createOrUpdatePracticeSession error:", error);
                  alert("Không thể tạo phiên thực hành!");
                }
              }}
            >
              Thực hành ngay
            </button>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="reviews-section">
          <div className="reviews-header">
            <h2 className="reviews-title">Đánh giá bài học</h2>
            {user && (
              <button 
                className="btn-add-review"
                onClick={() => setShowReviewForm(!showReviewForm)}
              >
                {showReviewForm ? "Hủy" : "+ Viết đánh giá"}
              </button>
            )}
          </div>

          {/* Statistics */}
          {statistics && (
            <div className="review-statistics">
              <div className="stats-summary">
                <div className="average-rating">
                  <span className="rating-number">{statistics.averageRating.toFixed(1)}</span>
                  <div className="stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className={star <= Math.round(statistics.averageRating) ? "star filled" : "star"}>
                        ⭐
                      </span>
                    ))}
                  </div>
                  <span className="total-reviews">({statistics.totalReviews} đánh giá)</span>
                </div>
                <div className="rating-bars">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="rating-bar-row">
                      <span className="rating-label">{rating} ⭐</span>
                      <div className="rating-bar">
                        <div 
                          className="rating-bar-fill"
                          style={{
                            width: `${statistics.totalReviews > 0 
                              ? (statistics.ratingDistribution[rating.toString() as keyof typeof statistics.ratingDistribution] / statistics.totalReviews) * 100 
                              : 0}%`
                          }}
                        />
                      </div>
                      <span className="rating-count">
                        {statistics.ratingDistribution[rating.toString() as keyof typeof statistics.ratingDistribution]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Review Form */}
          {showReviewForm && user && (
            <div className="review-form">
              <h3>Viết đánh giá của bạn</h3>
              <div className="form-group">
                <label>Đánh giá:</label>
                <div className="rating-input">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={star <= newRating ? "star-input filled" : "star-input"}
                      onClick={() => setNewRating(star)}
                    >
                      ⭐
                    </span>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Nhận xét (tùy chọn):</label>
                <textarea
                  value={newReviewText}
                  onChange={(e) => setNewReviewText(e.target.value)}
                  placeholder="Chia sẻ cảm nhận của bạn về bài học..."
                  rows={4}
                  className="review-textarea"
                />
              </div>
              <button 
                className="btn-submit-review"
                onClick={handleCreateReview}
                disabled={submittingReview}
              >
                {submittingReview ? "Đang gửi..." : "Gửi đánh giá"}
              </button>
            </div>
          )}

          {/* Filter */}
          <div className="reviews-filter">
            <label>Lọc theo:</label>
            <select 
              value={selectedRating || ""} 
              onChange={(e) => setSelectedRating(e.target.value ? Number(e.target.value) : undefined)}
              className="rating-filter"
            >
              <option value="">Tất cả đánh giá</option>
              <option value="5">5 sao</option>
              <option value="4">4 sao</option>
              <option value="3">3 sao</option>
              <option value="2">2 sao</option>
              <option value="1">1 sao</option>
            </select>
          </div>

          {/* Reviews List */}
          {loadingReviews ? (
            <div className="loading-reviews">Đang tải đánh giá...</div>
          ) : reviews.length === 0 ? (
            <div className="no-reviews">
              <p>Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá bài học này!</p>
            </div>
          ) : (
            <div className="reviews-list">
              {reviews.map((review) => (
                <div key={review.id} className="review-item">
                  <div className="review-header">
                    <div className="user-info">
                      <img 
                        src={review.user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.user?.fullName || "User")}&background=random`}
                        alt={review.user?.fullName}
                        className="user-avatar"
                      />
                      <div className="user-details">
                        <span className="user-name">{review.user?.fullName || "Người dùng"}</span>
                        <div className="review-stars">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star} className={star <= review.rating ? "star filled" : "star"}>
                              ⭐
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="review-meta">
                      <span className="review-date">
                        {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                      </span>
                      {user?.id === review.userId && (
                        <button 
                          className="btn-delete-review"
                          onClick={() => handleDeleteReview(review.userId)}
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="review-text">{review.comment}</p>
                  )}
                  <div className="review-actions">
                    <button
                      className={`btn-like ${userLikedReviews.includes(review.id) ? "liked" : ""}`}
                      onClick={() => handleToggleLike(review.id)}
                      disabled={!user}
                    >
                      👍 Hữu ích
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TheoreticalVideo;