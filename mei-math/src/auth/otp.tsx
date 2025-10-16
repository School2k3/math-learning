import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { verifyOTPAPI, resendOTPAPI } from "../api/otpAPI";
import "../css/otp.css";

const OTP: React.FC = () => {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);
  const navigate = useNavigate();
  const location = useLocation();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  // Lấy email từ state trước đó
  const email = location.state?.email || "";
  const message = location.state?.message || "";

  useEffect(() => {
    // Hiển thị message từ register page
    if (message) {
      setSuccess(message);
    }
  }, [message]);

  useEffect(() => {
    // Countdown timer
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return; // Chỉ cho phép số

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join("");
    
    if (otpCode.length !== 6) {
      setError("Vui lòng nhập đủ 6 số");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const result = await verifyOTPAPI({
        email: email,
        otp: otpCode,
      });

      if (result.success) {
        setSuccess("Email đã được xác thực thành công!");
        
        // Chuyển đến trang đăng nhập sau 2 giây
        setTimeout(() => {
          navigate("/auth/login", {
            state: { 
              message: "Đăng ký thành công! Vui lòng đăng nhập.",
              email: email
            }
          });
        }, 2000);
      } else {
        setError(result.message || "Mã OTP không chính xác");
      }
    } catch (error) {
      setError("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setTimeLeft(60);
    setError("");
    setSuccess("");
    
    try {
      const result = await resendOTPAPI(email);
      
      if (result.success) {
        setSuccess("Mã OTP đã được gửi lại!");
      } else {
        setError("Không thể gửi lại mã OTP");
      }
    } catch (error) {
      setError("Có lỗi xảy ra khi gửi lại mã OTP");
    }
  };

  return (
    <div className="otp-page">
      <div className="otp-left">
        <img src="/img-auth.png" alt="Học tập với MEI" className="otp-img" />
        <div style={{marginBottom: "12px"}} className="otp-img-caption">Học Tập dễ dàng với MEI</div>
      </div>
      <div className="otp-right">
        <div className="otp-welcome">
          <button className="otp-tab otp-tab-active">Xác thực OTP</button>
        </div>
        <div className="otp-desc">
          Vui lòng nhập mã OTP gồm 6 chữ số đã được gửi tới email:
          <br />
          <strong>{email}</strong>
        </div>
        
        {error && (
          <div style={{ color: "red", marginBottom: 10, textAlign: "center" }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ color: "green", marginBottom: 10, textAlign: "center" }}>
            {success}
          </div>
        )}

        <form className="otp-form" onSubmit={handleSubmit}>
          <div className="otp-inputs">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength={1}
                className="otp-input"
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                disabled={loading}
              />
            ))}
          </div>

          <div className="otp-timer">
            {timeLeft > 0 ? (
              <span>Gửi lại mã sau: {timeLeft}s</span>
            ) : (
              <button
                type="button"
                className="otp-resend-btn"
                onClick={handleResendOTP}
                disabled={loading}
              >
                Gửi lại mã OTP
              </button>
            )}
          </div>

          <button 
            className="otp-submit-btn" 
            type="submit"
            disabled={loading || success.includes("thành công")}
          >
            {loading ? "Đang xác thực..." : "Xác thực"}
          </button>
          
          <button
            type="button"
            className="otp-back-btn"
            onClick={() => navigate("/auth/register")}
            disabled={loading}
          >
            Quay lại
          </button>
        </form>
      </div>
    </div>
  );
};

export default OTP;