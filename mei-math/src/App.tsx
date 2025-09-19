import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import StudyPage from "./pages/study-page";
import TheoreticalVideo from "./pages/theoretical-video";
import Pratice from "./pages/pratice";
import Exams from "./pages/exams";
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/study" element={<StudyPage />} />
        <Route path="/theoretical-video" element={<TheoreticalVideo />} />
        <Route path="/pratice" element={<Pratice />} />
        <Route path="/exams" element={<Exams />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
