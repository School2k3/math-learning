import React, { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import "./ChatBot.css";

interface Message {
  type: "user" | "bot";
  message: string;
}

interface ChatHistoryProps {
  chatHistory: Message[];
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ chatHistory }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory]);

  return (
    <div className="chat-history" ref={scrollRef}>
      {chatHistory.length === 0 ? (
        <div className="chat-empty-state">
          <h3>👋 Xin chào!</h3>
          <p>Tôi là trợ lý AI chuyên về <strong>TOÁN HỌC</strong>.</p>
          <p>🎯 Tôi chỉ trả lời các câu hỏi về toán nhé!</p>
          <p>Bạn có thể hỏi tôi về:</p>
          <ul>
            <li>📐 Giải thích các khái niệm toán học (cộng, trừ, nhân, chia, phân số...)</li>
            <li>📝 Hướng dẫn giải bài tập toán từ lớp 1 đến lớp 5</li>
            <li>💡 Mẹo và phương pháp học toán hiệu quả</li>
            <li>🎯 Ôn tập kiến thức toán học</li>
            <li>❓ Giải đáp thắc mắc về bài toán khó</li>
          </ul>
          <p style={{ fontSize: "14px", color: "#999", marginTop: "20px" }}>
            ⚠️ Lưu ý: Tôi chỉ trả lời câu hỏi về toán học thôi nhé!
          </p>
        </div>
      ) : (
        chatHistory.map((message, index) => (
          <div
            key={index}
            className={`message-container ${
              message.type === "user" ? "user-message" : "bot-message"
            }`}
          >
            {message.type === "user" && (
              <div className="message-label">Bạn:</div>
            )}
            {message.type === "bot" && (
              <div className="message-label bot-label">🤖 Bot:</div>
            )}
            <div className="message-content">
              <ReactMarkdown>{message.message}</ReactMarkdown>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ChatHistory;
