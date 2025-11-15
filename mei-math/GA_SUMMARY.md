# ✅ Google Analytics - ĐÃ TÍCH HỢP HOÀN TẤT

## 📊 Tổng quan

**Measurement ID**: `G-EQZ892XBGK`  
**Stream ID**: `12997717592`

Google Analytics 4 đã được tích hợp **TỰ ĐỘNG** vào **TẤT CẢ** các trang quan trọng của ứng dụng.

---

## ✅ CÁC TRANG ĐÃ TÍCH HỢP

### 1. **Authentication (Xác thực)**

| Trang    | File                    | Events     | Mô tả                               |
| -------- | ----------------------- | ---------- | ----------------------------------- |
| Login    | `src/auth/login.tsx`    | `Login`    | Track khi đăng nhập (Admin/Student) |
| Register | `src/auth/register.tsx` | `Register` | Track khi đăng ký tài khoản         |

### 2. **Learning (Học tập)**

| Trang    | File                              | Events                                                  | Mô tả                                           |
| -------- | --------------------------------- | ------------------------------------------------------- | ----------------------------------------------- |
| Practice | `src/pages/pratice.tsx`           | `Start Practice`<br>`Complete Practice`<br>`Score Rate` | Track khi bắt đầu/hoàn thành bài tập + điểm số  |
| Exams    | `src/pages/exams.tsx`             | `Start Exam`<br>`Complete Exam`<br>`Score Rate`         | Track khi bắt đầu/hoàn thành kiểm tra + điểm số |
| Video    | `src/pages/theoretical-video.tsx` | `Watch Video`                                           | Track khi xem video lý thuyết                   |

### 3. **Navigation (Điều hướng)**

| Trang        | File                          | Events                  | Mô tả                          |
| ------------ | ----------------------------- | ----------------------- | ------------------------------ |
| Study Page   | `src/pages/study-page.tsx`    | `Change Class/Semester` | Track khi thay đổi lớp/học kỳ  |
| Profile      | `src/pages/profile.tsx`       | `View Profile`          | Track khi xem profile          |
| Exam History | `src/pages/exams-history.tsx` | `View Exam History`     | Track khi xem lịch sử kiểm tra |

### 4. **ChatBot**

| Component | File                                 | Events                             | Mô tả               |
| --------- | ------------------------------------ | ---------------------------------- | ------------------- |
| ChatBot   | `src/components/ChatBot/ChatBot.tsx` | `Send Message` (user/bot/non-math) | Track tin nhắn chat |

### 5. **Pageview (Tự động)**

**TẤT CẢ** các trang đều tự động track pageview khi người dùng truy cập.

---

## 📈 XEM DỮ LIỆU

### Realtime (Thời gian thực)

1. Truy cập: https://analytics.google.com
2. Chọn property: `G-EQZ892XBGK`
3. **Reports** → **Realtime**

### Events Report

**Reports** → **Engagement** → **Events**

Bạn sẽ thấy:

- Số lượng Login/Register
- Số bài tập/kiểm tra được làm
- Điểm số trung bình
- Video nào được xem nhiều nhất
- Lớp/học kỳ nào phổ biến
- Số lượng tin nhắn chatbot

---

## 🎯 DANH SÁCH EVENTS

| Category   | Action                | Label               | Value    | Khi nào             |
| ---------- | --------------------- | ------------------- | -------- | ------------------- |
| Auth       | Login                 | Admin/Student Login | -        | Đăng nhập           |
| Auth       | Register              | Email Registration  | -        | Đăng ký             |
| Practice   | Start Practice        | [Lesson Title]      | lessonId | Bắt đầu bài tập     |
| Practice   | Complete Practice     | [Lesson Title]      | score    | Hoàn thành bài tập  |
| Practice   | Score Rate            | [Lesson Title]      | %        | Điểm % bài tập      |
| Exam       | Start Exam            | [Exam Title]        | examId   | Bắt đầu kiểm tra    |
| Exam       | Complete Exam         | [Exam Title]        | score    | Hoàn thành kiểm tra |
| Exam       | Score Rate            | [Exam Title]        | %        | Điểm % kiểm tra     |
| Video      | Watch Video           | [Video Title]       | lessonId | Xem video           |
| Navigation | Change Class/Semester | Lớp X - HKY         | -        | Thay đổi lớp/HK     |
| Navigation | View Profile          | -                   | -        | Xem profile         |
| Navigation | View Exam History     | -                   | -        | Xem lịch sử         |
| ChatBot    | Send Message          | user/bot/non-math   | -        | Chat                |

---

## 🚀 TESTING

1. Chạy app: `npm run dev`
2. Mở Google Analytics → Realtime
3. Thao tác trên web:
   - Đăng nhập ✅
   - Chuyển lớp/học kỳ ✅
   - Xem video ✅
   - Làm bài tập ✅
   - Làm kiểm tra ✅
   - Chat với bot ✅
4. Xem events xuất hiện ngay lập tức!

Mở Console (F12) để xem log:

```
GA Pageview: /study
GA Event: { category: "Practice", action: "Start Practice", label: "Bài 1", value: 1 }
```

---

## 🎉 HOÀN TẤT!

**KHÔNG CẦN** làm gì thêm. Google Analytics đã tự động theo dõi:

- ✅ Tất cả pageviews
- ✅ Login/Register
- ✅ Bài tập (bắt đầu + hoàn thành + điểm)
- ✅ Kiểm tra (bắt đầu + hoàn thành + điểm)
- ✅ Xem video
- ✅ Thay đổi lớp/học kỳ
- ✅ Xem profile/lịch sử
- ✅ ChatBot messages

Chỉ cần chạy app và xem dữ liệu trên Google Analytics! 🚀
