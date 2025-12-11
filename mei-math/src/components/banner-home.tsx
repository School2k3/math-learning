import React from "react";
import { useNavigate } from "react-router-dom";
import "../css/banner-home.css";

const BannerHome: React.FC = () => {
  const navigate = useNavigate();

  const handleLearnNow = () => {
    navigate("/study");
  };

  const handleAbout = () => {
    const aboutSection = document.getElementById("about-section");
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="banner-home">
      <div className="banner-home__content">
        <h1 style={{ marginRight: 150 }}>
          Với <span className="banner-home__highlight">MEI</span> toán trở nên
          thật đơn giản
        </h1>
        <p style={{ marginRight: 220 }}>
          MEI là một sân chơi thú vị, nơi bạn vừa học vừa <br></br>khám phá theo
          cách sinh động và dễ hiểu hơn.
        </p>
        <div className="banner-home__actions">
          <button className="banner-home__btn-primary" onClick={handleLearnNow}>
            Học thử ngay
          </button>
          <button className="banner-home__btn-secondary" onClick={handleAbout}>
            Giới thiệu về MEI
          </button>
        </div>
        <div className="banner-home__info">
          <div className="banner-home__card">
            <svg
              width="50"
              height="53"
              viewBox="0 0 50 53"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                y="0.581543"
                width="50"
                height="51.7351"
                rx="8"
                fill="#23BDEE"
              />
              <g clipPath="url(#clip0_1_907)">
                <path
                  d="M18.1247 12.2217C17.5823 12.2217 17.1426 12.6767 17.1426 13.2379V15.2704H19.1069V13.2379C19.1069 12.6767 18.6671 12.2217 18.1247 12.2217Z"
                  fill="white"
                />
                <path
                  d="M31.8747 12.2217C31.3323 12.2217 30.8926 12.6767 30.8926 13.2379V15.2704H32.8568V13.2379C32.8569 12.6767 32.4172 12.2217 31.8747 12.2217Z"
                  fill="white"
                />
                <path
                  d="M35.8036 15.2705H32.8571V19.3354C32.8571 19.8967 32.4174 20.3517 31.875 20.3517C31.3325 20.3517 30.8928 19.8967 30.8928 19.3354V15.2705H19.1071V19.3354C19.1071 19.8967 18.6674 20.3517 18.125 20.3517C17.5825 20.3517 17.1428 19.8967 17.1428 19.3354V15.2705H14.1964C12.5692 15.2705 11.25 16.6354 11.25 18.3192V37.6275C11.25 39.3112 12.5692 40.6762 14.1964 40.6762H35.8036C37.4308 40.6762 38.75 39.3112 38.75 37.6275V18.3192C38.75 16.6354 37.4308 15.2705 35.8036 15.2705ZM36.7857 37.6275C36.7857 38.1888 36.346 38.6437 35.8035 38.6437H14.1964C13.654 38.6437 13.2143 38.1888 13.2143 37.6275V24.4165H36.7857V37.6275Z"
                  fill="white"
                />
                <path
                  d="M19.1076 26.4487H17.1433C16.6009 26.4487 16.1611 26.9037 16.1611 27.465C16.1611 28.0263 16.6009 28.4812 17.1433 28.4812H19.1076C19.65 28.4812 20.0897 28.0263 20.0897 27.465C20.0897 26.9037 19.65 26.4487 19.1076 26.4487Z"
                  fill="white"
                />
                <path
                  d="M25.9826 26.4487H24.0183C23.4759 26.4487 23.0361 26.9037 23.0361 27.465C23.0361 28.0263 23.4759 28.4812 24.0183 28.4812H25.9826C26.525 28.4812 26.9647 28.0263 26.9647 27.465C26.9647 26.9037 26.525 26.4487 25.9826 26.4487Z"
                  fill="white"
                />
                <path
                  d="M32.8576 26.4487H30.8933C30.3509 26.4487 29.9111 26.9037 29.9111 27.465C29.9111 28.0263 30.3509 28.4812 30.8933 28.4812H32.8576C33.4 28.4812 33.8397 28.0263 33.8397 27.465C33.8397 26.9037 33.3999 26.4487 32.8576 26.4487Z"
                  fill="white"
                />
                <path
                  d="M19.1076 30.5137H17.1433C16.6009 30.5137 16.1611 30.9687 16.1611 31.5299C16.1611 32.0912 16.6009 32.5462 17.1433 32.5462H19.1076C19.65 32.5462 20.0897 32.0912 20.0897 31.5299C20.0897 30.9687 19.65 30.5137 19.1076 30.5137Z"
                  fill="white"
                />
                <path
                  d="M25.9826 30.5137H24.0183C23.4759 30.5137 23.0361 30.9687 23.0361 31.5299C23.0361 32.0912 23.4759 32.5462 24.0183 32.5462H25.9826C26.525 32.5462 26.9647 32.0912 26.9647 31.5299C26.9647 30.9687 26.525 30.5137 25.9826 30.5137Z"
                  fill="white"
                />
                <path
                  d="M32.8576 30.5137H30.8933C30.3509 30.5137 29.9111 30.9687 29.9111 31.5299C29.9111 32.0912 30.3509 32.5462 30.8933 32.5462H32.8576C33.4 32.5462 33.8397 32.0912 33.8397 31.5299C33.8397 30.9687 33.3999 30.5137 32.8576 30.5137Z"
                  fill="white"
                />
                <path
                  d="M19.1076 34.5786H17.1433C16.6009 34.5786 16.1611 35.0336 16.1611 35.5949C16.1611 36.1561 16.6009 36.611 17.1433 36.611H19.1076C19.65 36.611 20.0897 36.1561 20.0897 35.5948C20.0897 35.0335 19.65 34.5786 19.1076 34.5786Z"
                  fill="white"
                />
                <path
                  d="M25.9826 34.5786H24.0183C23.4759 34.5786 23.0361 35.0336 23.0361 35.5949C23.0361 36.1561 23.4759 36.6111 24.0183 36.6111H25.9826C26.525 36.6111 26.9647 36.1561 26.9647 35.5949C26.9647 35.0336 26.525 34.5786 25.9826 34.5786Z"
                  fill="white"
                />
                <path
                  d="M32.8576 34.5786H30.8933C30.3509 34.5786 29.9111 35.0336 29.9111 35.5949C29.9111 36.1561 30.3509 36.6111 30.8933 36.6111H32.8576C33.4 36.6111 33.8397 36.1561 33.8397 35.5949C33.8397 35.0336 33.3999 34.5786 32.8576 34.5786Z"
                  fill="white"
                />
              </g>
              <defs>
                <clipPath id="clip0_1_907">
                  <rect
                    width="27.5"
                    height="28.4543"
                    fill="white"
                    transform="translate(11.25 12.2217)"
                  />
                </clipPath>
              </defs>
            </svg>

            <span>25 Assisted Student</span>
          </div>
          <div className="banner-home__card_mail">
            <div className="banner-home__icon-box">
              {/* SVG email */}
              <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
                <path
                  d="M28.9284 4.28564H1.07129L14.9999 15.7585L29.0859 4.31779C29.0344 4.30272 28.9817 4.29199 28.9284 4.28564Z"
                  fill="white"
                />
                <path
                  d="M15.676 17.9742C15.2813 18.2974 14.7133 18.2974 14.3186 17.9742L0 6.17773V24.6427C0 25.2345 0.479694 25.7142 1.07145 25.7142H28.9285C29.5203 25.7142 30 25.2345 30 24.6427V6.33631L15.676 17.9742Z"
                  fill="white"
                />
              </svg>
            </div>
            <span>
              <b>Congratulations</b>
              <br />
              Your admission completed
            </span>
          </div>
        </div>
      </div>
      <img
        src="/banner-home-img.png"
        alt="Banner Girl"
        className="banner-home__img"
      />
    </section>
  );
};

export default BannerHome;
