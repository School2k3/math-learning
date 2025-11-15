import { useEffect } from "react";
import ReactGA from "react-ga4";
import { useLocation } from "react-router-dom";

const MEASUREMENT_ID = "G-EQZ892XBGK";

const GoogleAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    // Khởi tạo Google Analytics
    ReactGA.initialize(MEASUREMENT_ID, {
      gaOptions: {
        siteSpeedSampleRate: 100,
      },
    });

    console.log("Google Analytics initialized with ID:", MEASUREMENT_ID);
  }, []);

  useEffect(() => {
    // Gửi pageview mỗi khi route thay đổi
    const currentPath = location.pathname + location.search;
    ReactGA.send({ 
      hitType: "pageview", 
      page: currentPath,
      title: document.title 
    });

    console.log("GA Pageview:", currentPath);
  }, [location]);

  return null;
};

// Hàm helper để track events
export const trackEvent = (
  category: string,
  action: string,
  label?: string,
  value?: number
) => {
  ReactGA.event({
    category,
    action,
    label,
    value,
  });
  
  console.log("GA Event:", { category, action, label, value });
};

// Hàm track khi người dùng bắt đầu làm bài tập
export const trackStartPractice = (lessonTitle: string, lessonId: number) => {
  trackEvent("Practice", "Start Practice", lessonTitle, lessonId);
};

// Hàm track khi hoàn thành bài tập
export const trackCompletePractice = (
  lessonTitle: string,
  score: number,
  totalQuestions: number
) => {
  trackEvent("Practice", "Complete Practice", lessonTitle, score);
  trackEvent("Practice", "Score Rate", lessonTitle, Math.round((score / totalQuestions) * 100));
};

// Hàm track khi bắt đầu làm bài kiểm tra
export const trackStartExam = (examTitle: string, examId: number) => {
  trackEvent("Exam", "Start Exam", examTitle, examId);
};

// Hàm track khi hoàn thành bài kiểm tra
export const trackCompleteExam = (
  examTitle: string,
  score: number,
  totalQuestions: number
) => {
  trackEvent("Exam", "Complete Exam", examTitle, score);
  trackEvent("Exam", "Score Rate", examTitle, Math.round((score / totalQuestions) * 100));
};

// Hàm track khi xem video lý thuyết
export const trackWatchVideo = (videoTitle: string, lessonId: number) => {
  trackEvent("Video", "Watch Video", videoTitle, lessonId);
};

// Hàm track khi sử dụng chatbot
export const trackChatBotMessage = (messageType: "user" | "bot") => {
  trackEvent("ChatBot", "Send Message", messageType);
};

// Hàm track khi đăng nhập
export const trackLogin = (method: string) => {
  trackEvent("Auth", "Login", method);
};

// Hàm track khi đăng ký
export const trackRegister = (method: string) => {
  trackEvent("Auth", "Register", method);
};

// Hàm track khi đăng xuất
export const trackLogout = () => {
  trackEvent("Auth", "Logout");
};

// Hàm track khi thay đổi lớp/học kỳ
export const trackChangeClassOrSemester = (grade: number, semester: number) => {
  trackEvent("Navigation", "Change Class/Semester", `Lớp ${grade} - HK${semester}`);
};

// Hàm track khi xem lịch sử bài kiểm tra
export const trackViewExamHistory = () => {
  trackEvent("Navigation", "View Exam History");
};

// Hàm track khi xem profile
export const trackViewProfile = () => {
  trackEvent("Navigation", "View Profile");
};

export default GoogleAnalytics;
