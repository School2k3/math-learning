import React from "react";
import "../css/info-home.css";

const InfoHome: React.FC = () => {
  return (
    <div className="info-home-container">
      <div className="info-home-stats">
        <div className="info-home-stat">
          <div className="info-home-stat-number">15</div>
          <div className="info-home-stat-label">Học sinh</div>
        </div>
        <div className="info-home-stat">
          <div className="info-home-stat-number">75%</div>
          <div className="info-home-stat-label">Học sinh tiến bộ</div>
        </div>
        <div className="info-home-stat">
          <div className="info-home-stat-number">350</div>
          <div className="info-home-stat-label">Hơn 350 câu hỏi khác nhau</div>
        </div>
        <div className="info-home-stat">
          <div className="info-home-stat-number">26</div>
          <div className="info-home-stat-label">Chủ đề đa dạng</div>
        </div>
        <div className="info-home-stat">
          <div className="info-home-stat-number">05</div>
          <div className="info-home-stat-label">Với 5 khối lớp từ 1-5</div>
        </div>
      </div>
      <div className="info-home-title">
        <span style={{ color: "#00bfae", fontWeight: 700 }}>MEI</span> là gì ?
      </div>
      <div className="info-home-desc">
        MEI là 1 website hỗ trợ ôn tập môn Toán cho học sinh tiểu học. Website
        cung cấp các nội dung ôn tập lý thuyết và hệ thống bài tập thành phong
        phú, giúp học sinh củng cố kiến thức. Ngoài ra, hệ thống còn cho phép
        thầy cô và điền giải các kết quả làm bài, hỗ trợ học sinh, phụ huynh và
        giáo viên nắm bắt quá trình học tập.
      </div>
      <div className="info-home-image">
        <img src="/mei-is.png" alt="MEI" />
      </div>

      {/* Thêm phần tin tức phía dưới */}
      <div className="info-news-section">
        <h2
          style={{
            color: "#00bfae",
            fontWeight: 600,
            marginTop: 48,
            marginBottom: 8,
          }}
        >
          Kiến thức và Tin tức mới nhất
        </h2>
        <div style={{ color: "#666", marginBottom: 32 }}>
          Kiến thức mới cũng như tin tức hot luôn được MEI cập nhật sớm nhất để
          bắt kịp sự phát triển
        </div>
        <div
          className="info-news-list"
          style={{
            display: "flex",
            gap: 32,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <div className="info-news-main" style={{ maxWidth: 340 }}>
            <img
              src="/mei-is.png"
              alt="news"
              style={{
                width: "100%",
                borderRadius: 16,
                marginBottom: 12,
              }}
            />
            <div
              style={{
                background: "#00bfae",
                color: "#fff",
                display: "inline-block",
                borderRadius: 12,
                padding: "2px 16px",
                fontSize: 14,
                marginBottom: 8,
              }}
            >
              Tin tức
            </div>
            <div
              style={{
                fontWeight: 700,
                fontSize: 18,
                margin: "8px 0",
              }}
            >
              Class adds $30 million to its balance sheet for a Zoom-friendly
              edtech solution
            </div>
            <div
              style={{
                color: "#666",
                fontSize: 15,
                marginBottom: 8,
              }}
            >
              Class, launched less than a year ago by Blackboard co-founder
              Michael Chasen, integrates exclusively...
            </div>
            <a
              href="#"
              style={{
                color: "#00bfae",
                fontSize: 15,
              }}
            >
              Read more
            </a>
          </div>
          <div
            className="info-news-side"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 24,
              maxWidth: 340,
            }}
          >
            <div style={{ display: "flex", gap: 16 }}>
              <img
                src="/mei-is.png"
                alt="news"
                style={{
                  width: 90,
                  height: 60,
                  borderRadius: 12,
                  objectFit: "cover",
                }}
              />
              <div>
                <div
                  style={{
                    background: "#00bfae",
                    color: "#fff",
                    display: "inline-block",
                    borderRadius: 12,
                    padding: "2px 12px",
                    fontSize: 13,
                    marginBottom: 4,
                  }}
                >
                  Tin tức
                </div>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: 15,
                  }}
                >
                  Class Technologies Inc. Closes $30 Million Series A Financing to
                  Meet High Demand
                </div>
                <div
                  style={{
                    color: "#666",
                    fontSize: 13,
                    marginTop: 2,
                  }}
                >
                  Class Technologies Inc., the company that created Class,...
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 16 }}>
              <img
                src="/mei-is.png"
                alt="news"
                style={{
                  width: 90,
                  height: 60,
                  borderRadius: 12,
                  objectFit: "cover",
                }}
              />
              <div>
                <div
                  style={{
                    background: "#00bfae",
                    color: "#fff",
                    display: "inline-block",
                    borderRadius: 12,
                    padding: "2px 12px",
                    fontSize: 13,
                    marginBottom: 4,
                  }}
                >
                  Tin tức
                </div>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: 15,
                  }}
                >
                  Zoom’s earliest investors are betting millions on a better Zoom
                  for schools
                </div>
                <div
                  style={{
                    color: "#666",
                    fontSize: 13,
                    marginTop: 2,
                  }}
                >
                  Zoom was never created to be a consumer product. Nonetheless,
                  the...
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 16 }}>
              <img
                src="/mei-is.png"
                alt="news"
                style={{
                  width: 90,
                  height: 60,
                  borderRadius: 12,
                  objectFit: "cover",
                }}
              />
              <div>
                <div
                  style={{
                    background: "#00bfae",
                    color: "#fff",
                    display: "inline-block",
                    borderRadius: 12,
                    padding: "2px 12px",
                    fontSize: 13,
                    marginBottom: 4,
                  }}
                >
                  Tin tức
                </div>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: 15,
                  }}
                >
                  Former Blackboard CEO Raises $16M to Bring LMS Features to Zoom
                  Classrooms
                </div>
                <div
                  style={{
                    color: "#666",
                    fontSize: 13,
                    marginTop: 2,
                  }}
                >
                  This year, investors have reaped big financial returns from
                  betting on Zoom...
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoHome;