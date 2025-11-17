import React, { useState } from "react";
import Header from "../components/header";
import { useNavigate } from "react-router-dom";
import "../css/news.css";

interface NewsArticle {
  id: number;
  title: string;
  category: string;
  image: string;
  excerpt: string;
  date: string;
  author: string;
  readTime: string;
  link: string;
}

const News: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>("Tất cả");

  const categories = [
    "Tất cả",
    "Phương pháp học tập",
    "Kỹ năng tư duy",
    "Mẹo học Toán",
    "Tin tức giáo dục",
    "Tâm lý học sinh"
  ];

  const articles: NewsArticle[] = [
    {
      id: 1,
      title: "5 Phương pháp học Toán hiệu quả cho học sinh Tiểu học",
      category: "Phương pháp học tập",
      image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&h=250&fit=crop",
      excerpt: "Khám phá những phương pháp học Toán được chứng minh hiệu quả giúp trẻ học Toán một cách vui vẻ và dễ dàng hơn...",
      date: "15/11/2025",
      author: "PGS.TS Nguyễn Văn A",
      readTime: "5 phút đọc",
      link: "/news/phuong-phap-hoc-toan-hieu-qua"
    },
    {
      id: 2,
      title: "Cách rèn luyện tư duy logic cho trẻ từ 6-11 tuổi",
      category: "Kỹ năng tư duy",
      image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=250&fit=crop",
      excerpt: "Tư duy logic là nền tảng quan trọng giúp trẻ phát triển khả năng giải quyết vấn đề. Cùng tìm hiểu các bài tập thực hành...",
      date: "12/11/2025",
      author: "ThS. Trần Thị B",
      readTime: "7 phút đọc",
      link: "/news/ren-luyen-tu-duy-logic"
    },
    {
      id: 3,
      title: "Học bảng nhân không còn khó nhờ 7 mẹo thú vị này",
      category: "Mẹo học Toán",
      image: "https://images.unsplash.com/photo-1596496181848-3091d4878b24?w=400&h=250&fit=crop",
      excerpt: "Bảng nhân là nỗi ám ảnh của nhiều em nhỏ. Hãy cùng khám phá những mẹo học bảng nhân vừa nhanh vừa nhớ lâu...",
      date: "10/11/2025",
      author: "Cô Lê Thị C",
      readTime: "4 phút đọc",
      link: "/news/meo-hoc-bang-nhan"
    },
    {
      id: 4,
      title: "Tâm lý học sinh và cách tạo động lực học tập",
      category: "Tâm lý học sinh",
      image: "https://images.unsplash.com/photo-1503676382389-4809596d5290?w=400&h=250&fit=crop",
      excerpt: "Hiểu được tâm lý trẻ là chìa khóa giúp phụ huynh và giáo viên tạo động lực học tập bền vững cho các em...",
      date: "08/11/2025",
      author: "TS. Phạm Văn D",
      readTime: "6 phút đọc",
      link: "/news/tam-ly-hoc-sinh"
    },
    {
      id: 5,
      title: "Chương trình Toán mới 2025: Những thay đổi quan trọng",
      category: "Tin tức giáo dục",
      image: "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=400&h=250&fit=crop",
      excerpt: "Bộ Giáo dục công bố những điều chỉnh mới trong chương trình Toán Tiểu học. Phụ huynh cần biết gì?",
      date: "05/11/2025",
      author: "Ban biên tập",
      readTime: "8 phút đọc",
      link: "/news/chuong-trinh-toan-moi-2025"
    },
    {
      id: 6,
      title: "Luyện tập Toán mỗi ngày: Tại sao chỉ 15 phút cũng đủ?",
      category: "Phương pháp học tập",
      image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=250&fit=crop",
      excerpt: "Nghiên cứu chứng minh rằng luyện tập đều đặn mỗi ngày hiệu quả hơn học dồn vào cuối tuần. Cùng tìm hiểu lý do...",
      date: "03/11/2025",
      author: "ThS. Hoàng Thị E",
      readTime: "5 phút đọc",
      link: "/news/luyen-tap-moi-ngay"
    },
    {
      id: 7,
      title: "Trò chơi Toán học: Học mà chơi, chơi mà học",
      category: "Mẹo học Toán",
      image: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400&h=250&fit=crop",
      excerpt: "Khám phá 10 trò chơi Toán học thú vị giúp trẻ học Toán một cách tự nhiên và vui vẻ nhất...",
      date: "01/11/2025",
      author: "Cô Nguyễn Thị F",
      readTime: "6 phút đọc",
      link: "/news/tro-choi-toan-hoc"
    },
    {
      id: 8,
      title: "Kỹ năng giải bài toán có lời văn cho học sinh lớp 1-5",
      category: "Kỹ năng tư duy",
      image: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400&h=250&fit=crop",
      excerpt: "Bài toán có lời văn thường khiến học sinh gặp khó khăn. Hướng dẫn chi tiết các bước giải hiệu quả...",
      date: "28/10/2025",
      author: "PGS. Vũ Văn G",
      readTime: "7 phút đọc",
      link: "/news/giai-bai-toan-co-loi-van"
    }
  ];

  const filteredArticles = selectedCategory === "Tất cả" 
    ? articles 
    : articles.filter(article => article.category === selectedCategory);

  return (
    <div className="news-container">
      <Header bgWhite />
      
      <div className="news-hero">
        <div className="news-hero-content">
          <h1>📚 Tin tức & Phương pháp học tập</h1>
          <p>Cập nhật những kiến thức, phương pháp giảng dạy và học tập Toán hiệu quả nhất</p>
        </div>
      </div>

      <div className="news-content">
        {/* Categories Filter */}
        <div className="news-categories">
          {categories.map((category) => (
            <button
              key={category}
              className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Articles Grid */}
        <div className="news-grid">
          {filteredArticles.map((article) => (
            <div key={article.id} className="news-card">
              <div className="news-card-image">
                <img 
                  src={article.image} 
                  alt={article.title}
                />
                <span className="news-category-badge">{article.category}</span>
              </div>
              
              <div className="news-card-content">
                <h3 className="news-card-title">{article.title}</h3>
                <p className="news-card-excerpt">{article.excerpt}</p>
                
                <div className="news-card-meta">
                  <div className="meta-info">
                    <span className="meta-author">👤 {article.author}</span>
                    <span className="meta-date">📅 {article.date}</span>
                    <span className="meta-read-time">⏱️ {article.readTime}</span>
                  </div>
                  
                  <button 
                    className="read-more-btn"
                    onClick={() => navigate(article.link)}
                  >
                    Đọc thêm →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredArticles.length === 0 && (
          <div className="empty-state">
            <p>Chưa có bài viết nào trong danh mục này.</p>
          </div>
        )}

        {/* Newsletter Subscription */}
        <div className="newsletter-section">
          <h2>📧 Đăng ký nhận tin tức mới nhất</h2>
          <p>Nhận thông báo về các bài viết và phương pháp học tập mới mỗi tuần</p>
          <div className="newsletter-form">
            <input 
              type="email" 
              placeholder="Nhập email của bạn..."
              className="newsletter-input"
            />
            <button className="newsletter-btn">Đăng ký</button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default News;
