import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import StudyPage from "./pages/study-page";
import TheoreticalVideo from "./pages/theoretical-video";
import Pratice from "./pages/pratice";
import Exams from "./pages/exams";
import ExamsHistory from "./pages/exams-history";
import ExamsReview from "./pages/exams-review";
import DashUser from "./pages/dash-user";
import Profile from "./pages/profile";
import News from "./pages/news";
import NewsDetail from "./pages/news-detail";
import Login from "./auth/login";
import Register from "./auth/register";
import OTP from "./auth/otp"; 
import { AuthProvider } from "./contexts/AuthContext";
import GoogleAnalytics from "./components/GoogleAnalytics";
import './App.css';
import HomeAdmin from "./admin/home-admin";
import ChapterAdmin from "./admin/chapter";
import LessonAdmin from "./admin/lesson"; 
import QuestionAdmin from "./admin/question"; 
import ExamAdmin from "./admin/exam"; 
import UserAdmin from "./admin/user";
import AnswerAdmin from "./admin/answer";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <GoogleAnalytics />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/study" element={<StudyPage />} />
          <Route path="/theoretical-video" element={<TheoreticalVideo />} />
          <Route path="/pratice" element={<Pratice />} />
          <Route path="/exams" element={<Exams />} />
          <Route path="/exams-history" element={<ExamsHistory />} />
          <Route path="/exams/review/:resultId" element={<ExamsReview />} />
          <Route path="/dashboard" element={<DashUser />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/news" element={<News />} />
          <Route path="/news/:articleSlug" element={<NewsDetail />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/auth/otp" element={<OTP />} /> {/* Thêm route này */}
          <Route path="/home-admin" element={<HomeAdmin />} />
          <Route path="/admin/chapters" element={<ChapterAdmin />} /> {/* Thêm route này */}
          <Route path="/admin/lessons" element={<LessonAdmin />} /> {/* Thêm route này */}
          <Route path="/admin/questions" element={<QuestionAdmin />} /> {/* Thêm route này */}
          <Route path="/admin/exams" element={<ExamAdmin />} /> {/* Thêm route này */}
          <Route path="/admin/users" element={<UserAdmin />} /> {/* Thêm route này */}
          <Route path="/admin/answers" element={<AnswerAdmin />} /> {/* Thêm route này */}
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
