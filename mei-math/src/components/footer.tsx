import React from "react";
import "../css/footer.css";

const Footer: React.FC = () => {
  return (
    <footer className="footer-mei">
      <div className="footer-top">
        <div className="footer-logo-block">
          <img src="/logo-Photoroom.png" alt="MEI" className="footer-logo" />
          <div className="footer-slogan">
            Định hướng<br />tương lai
          </div>
        </div>
      </div>
      <div className="footer-newsletter-title">
        Subscribe to get our Newsletter
      </div>
      <form className="footer-newsletter-form" onSubmit={e => e.preventDefault()}>
        <input
          type="email"
          className="footer-newsletter-input"
          placeholder="Your Email"
        />
        <button className="footer-newsletter-btn">Subscribe</button>
      </form>
      <div className="footer-links">
        <a href="#">Careers</a>
        <span>|</span>
        <a href="#">Privacy Policy</a>
        <span>|</span>
        <a href="#">Terms &amp; Conditions</a>
      </div>
      <div className="footer-copyright">
        © 2021 Class Technologies Inc.
      </div>
    </footer>
  );
};

export default Footer;