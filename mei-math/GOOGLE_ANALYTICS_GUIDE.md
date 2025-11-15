# Hướng dẫn tích hợp Google Analytics Tracking

## ✅ Đã tích hợp

Google Analytics 4 đã được tích hợp vào project với:

- **Measurement ID**: `G-EQZ892XBGK`
- **Stream ID**: `12997717592`

## 📊 Tracking tự động

### 1. **Pageview Tracking**

Tự động track mỗi khi người dùng chuyển trang (đã cấu hình trong `GoogleAnalytics.tsx`)

### 2. **Đã tích hợp sẵn**

- ✅ Login/Logout tracking
- ✅ Register tracking
- ✅ ChatBot message tracking

## 🎯 Cách sử dụng Tracking Events

### Import functions vào file cần track:

\`\`\`tsx
import {
trackStartPractice,
trackCompletePractice,
trackStartExam,
trackCompleteExam,
trackWatchVideo,
trackChangeClassOrSemester,
trackViewExamHistory,
trackViewProfile,
trackEvent // Generic event tracking
} from "../components/GoogleAnalytics";
\`\`\`

### Ví dụ sử dụng trong các trang:

#### **1. Trang Practice (pratice.tsx)**

\`\`\`tsx
// Khi bắt đầu làm bài tập
const handleStartPractice = () => {
trackStartPractice(lessonTitle, lessonId);
// ... code khác
};

// Khi hoàn thành bài tập
const handleSubmitPractice = (score: number, totalQuestions: number) => {
trackCompletePractice(lessonTitle, score, totalQuestions);
// ... code khác
};
\`\`\`

#### **2. Trang Exams (exams.tsx)**

\`\`\`tsx
// Khi bắt đầu làm bài kiểm tra
const handleStartExam = () => {
trackStartExam(examTitle, examId);
// ... code khác
};

// Khi hoàn thành bài kiểm tra
const handleSubmitExam = (score: number, totalQuestions: number) => {
trackCompleteExam(examTitle, score, totalQuestions);
// ... code khác
};
\`\`\`

#### **3. Trang Video (theoretical-video.tsx)**

\`\`\`tsx
// Khi click xem video
const handleWatchVideo = () => {
trackWatchVideo(videoTitle, lessonId);
// ... code khác
};
\`\`\`

#### **4. Trang Study (study-page.tsx)**

\`\`\`tsx
// Khi thay đổi lớp hoặc học kỳ
const handleChangeClass = (grade: number, semester: number) => {
trackChangeClassOrSemester(grade, semester);
setSelectedClass(\`Lớp \${grade}\`);
// ... code khác
};
\`\`\`

#### **5. Trang Exam History (exams-history.tsx)**

\`\`\`tsx
// Khi vào trang lịch sử
useEffect(() => {
trackViewExamHistory();
}, []);
\`\`\`

#### **6. Trang Profile (profile.tsx)**

\`\`\`tsx
// Khi vào trang profile
useEffect(() => {
trackViewProfile();
}, []);
\`\`\`

### **Custom Event Tracking**

Nếu cần track event tùy chỉnh:

\`\`\`tsx
trackEvent(
"Category", // VD: "Button", "Form", "Video"
"Action", // VD: "Click", "Submit", "Play"
"Label", // VD: "Download PDF", "Share"
123 // Value (optional, số)
);
\`\`\`

## 📈 Xem dữ liệu trên Google Analytics

1. Truy cập: https://analytics.google.com/
2. Chọn property với Measurement ID: `G-EQZ892XBGK`
3. Vào **Reports** → **Realtime** để xem hoạt động realtime
4. Vào **Reports** → **Engagement** → **Events** để xem các events đã track

## 🔍 Events được track

### Authentication Events

- \`Login\` - Khi đăng nhập (Admin/Student)
- \`Register\` - Khi đăng ký
- \`Logout\` - Khi đăng xuất

### Practice Events

- \`Start Practice\` - Bắt đầu làm bài tập
- \`Complete Practice\` - Hoàn thành bài tập
- \`Score Rate\` - Tỷ lệ điểm (%)

### Exam Events

- \`Start Exam\` - Bắt đầu làm bài kiểm tra
- \`Complete Exam\` - Hoàn thành bài kiểm tra
- \`Score Rate\` - Tỷ lệ điểm (%)

### Video Events

- \`Watch Video\` - Xem video lý thuyết

### ChatBot Events

- \`Send Message\` - Gửi tin nhắn (user/bot)
- \`Non-Math Question\` - Câu hỏi không liên quan toán

### Navigation Events

- \`Change Class/Semester\` - Thay đổi lớp/học kỳ
- \`View Exam History\` - Xem lịch sử kiểm tra
- \`View Profile\` - Xem hồ sơ

## 🚀 Testing

### Local Testing

Analytics hoạt động ngay cả khi chạy local (\`localhost\`). Vào Google Analytics Realtime để xem dữ liệu ngay lập tức.

### Debug Mode

Mở Console (F12) để xem log của các events:
\`\`\`
GA Event: { category: "Practice", action: "Start Practice", label: "Bài 1", value: 1 }
\`\`\`

## ⚠️ Lưu ý

1. **Không track thông tin nhạy cảm** (mật khẩu, email, thông tin cá nhân)
2. **Events có giới hạn** - GA4 cho phép tối đa 500 events khác nhau
3. **Data retention** - Dữ liệu được lưu theo cài đặt trong GA4 (mặc định 2 tháng)
4. **Testing** - Luôn kiểm tra Realtime report sau khi thêm tracking mới

## 📚 Tài liệu tham khảo

- [Google Analytics 4 Documentation](https://developers.google.com/analytics/devguides/collection/ga4)
- [react-ga4 GitHub](https://github.com/codler/react-ga4)
