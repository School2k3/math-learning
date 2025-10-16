import React, { useState } from "react";
import { useNavigate } from "react-router-dom";


import { registerAPI,  } from "../api/registerAPI";
import type { RegisterResponse } from "../api/registerAPI";




import "../css/register.css";

const Register: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    grade: "",
  });

  const [fieldErrors, setFieldErrors] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    grade: "",
  });

  const [touched, setTouched] = useState({
    fullName: false,
    email: false,
    username: false,
    password: false,
    confirmPassword: false,
    grade: false,
  });

  // Regex patterns
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  const nameRegex = /^[a-zA-ZÀ-ỹ\s]{2,50}$/;

  const validateField = (name: string, value: string) => {
    let errorMessage = "";

    switch (name) {
      case "fullName":
        if (!value.trim()) {
          errorMessage = "Họ và tên không được để trống";
        } else if (!nameRegex.test(value.trim())) {
          errorMessage = "Họ và tên chỉ chứa chữ cái và khoảng trắng (2-50 ký tự)";
        }
        break;

      case "email":
        if (!value.trim()) {
          errorMessage = "Email không được để trống";
        } else if (!emailRegex.test(value)) {
          errorMessage = "Email không đúng định dạng";
        }
        break;

      case "username":
        if (!value.trim()) {
          errorMessage = "Tên đăng nhập không được để trống";
        } else if (!usernameRegex.test(value)) {
          errorMessage = "Tên đăng nhập chỉ chứa chữ, số, _ và từ 3-20 ký tự";
        }
        break;

      case "password":
        if (!value) {
          errorMessage = "Mật khẩu không được để trống";
        } else if (value.length < 8) {
          errorMessage = "Mật khẩu phải có ít nhất 8 ký tự";
        } else if (!passwordRegex.test(value)) {
          errorMessage = "Mật khẩu phải có ít nhất 1 chữ hoa, 1 chữ thường và 1 số";
        }
        break;

      case "confirmPassword":
        if (!value) {
          errorMessage = "Vui lòng nhập lại mật khẩu";
        } else if (value !== formData.password) {
          errorMessage = "Mật khẩu nhập lại không khớp";
        }
        break;

      case "grade":
        if (!value) {
          errorMessage = "Vui lòng chọn khối học";
        }
        break;

      default:
        break;
    }

    return errorMessage;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validate field if it has been touched
    if (touched[name as keyof typeof touched]) {
      const errorMessage = validateField(name, value);
      setFieldErrors(prev => ({
        ...prev,
        [name]: errorMessage
      }));

      // Special case: re-validate confirmPassword when password changes
      if (name === "password" && touched.confirmPassword) {
        const confirmPasswordError = validateField("confirmPassword", formData.confirmPassword);
        setFieldErrors(prev => ({
          ...prev,
          confirmPassword: confirmPasswordError
        }));
      }
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    const errorMessage = validateField(name, value);
    setFieldErrors(prev => ({
      ...prev,
      [name]: errorMessage
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce((acc, key) => ({
      ...acc,
      [key]: true
    }), {} as typeof touched);
    setTouched(allTouched);

    // Validate all fields
    const newFieldErrors = Object.keys(formData).reduce((acc, key) => ({
      ...acc,
      [key]: validateField(key, formData[key as keyof typeof formData])
    }), {} as typeof fieldErrors);
    setFieldErrors(newFieldErrors);

    // Check if there are any errors
    const hasErrors = Object.values(newFieldErrors).some(error => error !== "");
    if (hasErrors) {
      setLoading(false);
      return;
    }

    try {
      const registerData: RegisterRequest = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        username: formData.username.trim(),
        password: formData.password,
        role: "",
        grade: parseInt(formData.grade),
      };

      const result = await registerAPI(registerData);

      if (result.success) {
        navigate("/auth/otp", {
          state: { 
            email: formData.email,
            message: "Mã OTP đã được gửi đến email của bạn"
          }
        });
      } else {
        setError(result.message || "Đăng ký thất bại");
      }
    } catch (error) {
      setError("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-left">
        <img src="/img-auth.png" alt="Học tập với MEI" className="register-img" />
        <div className="register-img-caption">Học Tập dễ dàng với MEI</div>
      </div>
      <div className="register-right">
        <div className="register-welcome">
          <button style={{ marginLeft: 180 }} className="register-tab register-tab-active">Đăng ký</button>
        </div>
        <div className="register-desc">
          Đăng ký tài khoản để bắt đầu học và luyện tập cùng MEI!
        </div>

        {error && (
          <div style={{ color: "red", marginBottom: 10, textAlign: "center" }}>
            {error}
          </div>
        )}

        <form className="register-form" onSubmit={handleSubmit}>
          <label className="register-label">Họ và Tên</label>
          <input
            type="text"
            name="fullName"
            className={`register-input ${fieldErrors.fullName ? 'register-input-error' : ''}`}
            placeholder="Nhập họ tên của bạn"
            value={formData.fullName}
            onChange={handleInputChange}
            onBlur={handleBlur}
          />
          {fieldErrors.fullName && (
            <div className="register-field-error">{fieldErrors.fullName}</div>
          )}
          
          <label className="register-label">Địa chỉ Email</label>
          <input
            type="email"
            name="email"
            className={`register-input ${fieldErrors.email ? 'register-input-error' : ''}`}
            placeholder="Nhập email của bạn"
            value={formData.email}
            onChange={handleInputChange}
            onBlur={handleBlur}
          />
          {fieldErrors.email && (
            <div className="register-field-error">{fieldErrors.email}</div>
          )}
          
          <label className="register-label">Tên đăng nhập</label>
          <input
            type="text"
            name="username"
            className={`register-input ${fieldErrors.username ? 'register-input-error' : ''}`}
            placeholder="Nhập tên đăng nhập"
            value={formData.username}
            onChange={handleInputChange}
            onBlur={handleBlur}
          />
          {fieldErrors.username && (
            <div className="register-field-error">{fieldErrors.username}</div>
          )}
          
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={{marginRight:150}} className="register-label">Mật khẩu</label>
              <div className="register-password-row">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className={`register-input ${fieldErrors.password ? 'register-input-error' : ''}`}
                  placeholder="Nhập mật khẩu"
                  value={formData.password}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                />
                <span
                  className="register-eye"
                  onClick={() => setShowPassword((v) => !v)}
                  title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? "🙈" : "👁️"}
                </span>
              </div>
              {fieldErrors.password && (
                <div className="register-field-error">{fieldErrors.password}</div>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <label style={{marginRight:100}} className="register-label">Nhập lại mật khẩu</label>
              <div className="register-password-row">
                <input
                  type={showRePassword ? "text" : "password"}
                  name="confirmPassword"
                  className={`register-input ${fieldErrors.confirmPassword ? 'register-input-error' : ''}`}
                  placeholder="Nhập lại mật khẩu"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                />
                <span
                  className="register-eye"
                  onClick={() => setShowRePassword((v) => !v)}
                  title={showRePassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showRePassword ? "🙈" : "👁️"}
                </span>
              </div>
              {fieldErrors.confirmPassword && (
                <div className="register-field-error">{fieldErrors.confirmPassword}</div>
              )}
            </div>
          </div>
          
          <label className="register-label">Chọn khối</label>
          <select 
            name="grade"
            className={`register-input ${fieldErrors.grade ? 'register-input-error' : ''}`}
            value={formData.grade}
            onChange={handleInputChange}
            onBlur={handleBlur}
          >
            <option value="">Chọn khối học</option>
            <option value="1">Khối 1</option>
            <option value="2">Khối 2</option>
            <option value="3">Khối 3</option>
            <option value="4">Khối 4</option>
            <option value="5">Khối 5</option>
          </select>
          {fieldErrors.grade && (
            <div className="register-field-error">{fieldErrors.grade}</div>
          )}
          
          <button 
            className="register-submit-btn" 
            type="submit"
            disabled={loading}
          >
            {loading ? "Đang đăng ký..." : "Đăng ký"}
          </button>
          
          <button
            type="button"
            className="register-login-btn"
            onClick={() => navigate("/auth/login")}
          >
            Đăng nhập
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;