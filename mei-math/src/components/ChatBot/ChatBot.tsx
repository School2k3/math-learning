import React, { useState, useEffect } from "react";
import ChatHistory from "./ChatHistory";
import Loading from "./Loading";
import { trackChatBotMessage } from "../GoogleAnalytics";
import { GoogleGenerativeAI } from "@google/generative-ai";
import "./ChatBot.css";

interface ChatBotProps {
  visible: boolean;
  onClose: () => void;
}

interface Message {
  type: "user" | "bot";
  message: string;
}

const ChatBot: React.FC<ChatBotProps> = ({ visible, onClose }) => {
  const [userInput, setUserInput] = useState("");
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Gemini API key and endpoint
  const API_KEY = "AIzaSyAS4oLkNE5Q6UY18_75fpasyai1DDK9GjQ";

  // Load chat history from localStorage when component mounts
  useEffect(() => {
    const loadChatHistory = () => {
      try {
        const savedHistory = localStorage.getItem("chatbot_history");
        if (savedHistory) {
          setChatHistory(JSON.parse(savedHistory));
        }
      } catch (error) {
        console.error("Error loading chat history:", error);
      }
    };

    loadChatHistory();
  }, []);

  // Kiểm tra xem câu hỏi có liên quan đến toán học không
  const isMathRelated = (text: string): boolean => {
    const mathKeywords = [
      'toán', 'cộng', 'trừ', 'nhân', 'chia', 'số', 'tính', 'bài tập', 'phép',
      'phân số', 'thập phân', 'hình', 'chu vi', 'diện tích', 'đo', 'lường',
      'đơn vị', 'giải', 'tìm', 'so sánh', 'lớn', 'nhỏ', 'bằng', 'kết quả',
      'đề bài', 'bài toán', 'hình học', 'góc', 'tam giác', 'vuông', 'tròn',
      'kg', 'km', 'cm', 'm', 'dm', 'mm', 'lít', 'tấn', 'giờ', 'phút',
      'math', 'number', 'calculate', 'equation', 'problem'
    ];
    
    const lowerText = text.toLowerCase();
    return mathKeywords.some(keyword => lowerText.includes(keyword));
  };

  // Function to send user message to Gemini using HTTP
  const sendMessage = async () => {
    if (userInput.trim() === "") return;

    // Kiểm tra nếu câu hỏi không liên quan đến toán
    if (!isMathRelated(userInput)) {
      const warningMessage = "⚠️ Xin lỗi bạn, tôi chỉ trả lời các câu hỏi liên quan đến **toán học** thôi nhé! 📚\n\nBạn có thể hỏi tôi về:\n- Cách giải bài tập toán\n- Giải thích các khái niệm toán học\n- Phương pháp học toán hiệu quả\n- Các bài toán cụ thể cần giải đáp\n\nHãy thử hỏi một câu hỏi về toán nhé! 😊";
      
      const updatedHistory = [
        ...chatHistory,
        { type: "user" as const, message: userInput },
        { type: "bot" as const, message: warningMessage },
      ];
      
      setChatHistory(updatedHistory);
      localStorage.setItem("chatbot_history", JSON.stringify(updatedHistory));
      setUserInput("");
      
      // Track non-math question
      trackChatBotMessage("bot");
      return;
    }

    setIsLoading(true);
    try {
      // System prompt để giới hạn chatbot chỉ trả lời về toán học
      const systemPrompt = `Bạn là trợ lý AI chuyên về toán học cho học sinh tiểu học (lớp 1-5) tại Việt Nam. 

NHIỆM VỤ CỦA BẠN:
- Chỉ trả lời các câu hỏi liên quan đến TOÁN HỌC
- Giải thích các khái niệm toán học một cách đơn giản, dễ hiểu
- Hướng dẫn cách giải bài tập toán
- Cung cấp ví dụ minh họa cụ thể
- Khuyến khích học sinh tư duy và tự giải quyết vấn đề

GIỚI HẠN:
- KHÔNG trả lời các câu hỏi KHÔNG liên quan đến toán học
- KHÔNG thảo luận về chính trị, tôn giáo, bạo lực
- KHÔNG cung cấp thông tin về các môn học khác ngoài toán
- Nếu câu hỏi không liên quan đến toán, hãy lịch sự từ chối và khuyến khích hỏi về toán

PHONG CÁCH:
- Thân thiện, kiên nhẫn như một giáo viên
- Sử dụng tiếng Việt đơn giản, phù hợp với học sinh tiểu học
- Khuyến khích và động viên học sinh
- Sử dụng emoji phù hợp để tạo không khí vui vẻ

Bây giờ hãy trả lời câu hỏi sau của học sinh:

`;

      // Sử dụng Google Generative AI SDK chính thức
      const genAI = new GoogleGenerativeAI(API_KEY);
      
      // Sử dụng model mới nhất: Gemini 2.5 Flash (nhanh và miễn phí)
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      
      const fullPrompt = systemPrompt + "\n\n" + userInput;
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      const botResponse = response.text() || "Xin lỗi, tôi không thể tạo phản hồi.";

      // Create updated chat history
      const updatedHistory = [
        ...chatHistory,
        { type: "user" as const, message: userInput },
        { type: "bot" as const, message: botResponse },
      ];

      // Update state and save to localStorage
      setChatHistory(updatedHistory);
      try {
        localStorage.setItem("chatbot_history", JSON.stringify(updatedHistory));
      } catch (error) {
        console.error("Error saving chat history:", error);
      }
      
      // Track successful chatbot interaction
      trackChatBotMessage("user");
      trackChatBotMessage("bot");
    } catch (error) {
      console.error("Error sending message:", error);

      // Determine error message based on error type
      let errorMessage =
        "Xin lỗi, tôi không thể xử lý yêu cầu của bạn. Vui lòng thử lại.";
      if (error instanceof Error) {
        if (error.message && error.message.includes("Network request failed")) {
          errorMessage =
            "Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet và thử lại.";
        } else if (error.message && error.message.includes("HTTP error!")) {
          errorMessage = "Lỗi dịch vụ API. Vui lòng thử lại sau.";
        }
      }

      // Create updated chat history with error message
      const updatedHistory = [
        ...chatHistory,
        { type: "user" as const, message: userInput },
        { type: "bot" as const, message: errorMessage },
      ];

      // Update state and save to localStorage
      setChatHistory(updatedHistory);
      try {
        localStorage.setItem("chatbot_history", JSON.stringify(updatedHistory));
      } catch (storageError) {
        console.error("Error saving chat history:", storageError);
      }
    } finally {
      setUserInput("");
      setIsLoading(false);
    }
  };

  // Function to clear the chat history with confirmation
  const clearChat = () => {
    if (
      window.confirm(
        "Bạn có chắc chắn muốn xóa toàn bộ lịch sử chat? Hành động này không thể hoàn tác."
      )
    ) {
      try {
        localStorage.removeItem("chatbot_history");
        setChatHistory([]);
      } catch (error) {
        console.error("Error clearing chat history:", error);
        alert("Lỗi khi xóa lịch sử chat");
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!visible) return null;

  return (
    <div className="chatbot-modal">
      <div className="chatbot-container">
        <div className="chatbot-header">
          <button onClick={onClose} className="chatbot-close-button">
            <span>←</span>
          </button>
          <h2 className="chatbot-title">ChatBot Hỗ Trợ Học Toán</h2>
          <button onClick={clearChat} className="chatbot-clear-button">
            <span>🗑️</span>
          </button>
        </div>

        <div className="chatbot-chat-container">
          <ChatHistory chatHistory={chatHistory} />
          <Loading isLoading={isLoading} />
        </div>

        <div className="chatbot-input-container">
          <textarea
            className="chatbot-input"
            placeholder="Hỏi tôi về toán học... (VD: Làm thế nào để tính diện tích hình vuông?)"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={handleKeyPress}
            rows={1}
          />
          <button
            className={`chatbot-send-button ${
              !userInput.trim() ? "disabled" : ""
            }`}
            onClick={sendMessage}
            disabled={!userInput.trim() || isLoading}
          >
            <span>➤</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
