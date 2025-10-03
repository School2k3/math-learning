import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import StudyPage from "./pages/study-page";
import TheoreticalVideo from "./pages/theoretical-video";
import Pratice from "./pages/pratice";
import Exams from "./pages/exams";
import Login from "./auth/login";
import Register from "./auth/register";
import OTP from "./auth/otp"; // Thêm import này
import { AuthProvider } from "./contexts/AuthContext";
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/study" element={<StudyPage />} />
          <Route path="/theoretical-video" element={<TheoreticalVideo />} />
          <Route path="/pratice" element={<Pratice />} />
          <Route path="/exams" element={<Exams />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/auth/otp" element={<OTP />} /> {/* Thêm route này */}
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
