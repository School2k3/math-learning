import React, { useState, useRef, useEffect } from "react";
import ChatBot from "./ChatBot";
import "./ChatBot.css";

const ChatBotButton: React.FC = () => {
  const [isChatbotVisible, setIsChatbotVisible] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });

  // Load saved position on mount and check if tooltip should be shown
  useEffect(() => {
    const loadSavedPosition = () => {
      try {
        const savedPosition = localStorage.getItem("chatbot_button_position");
        if (savedPosition) {
          const { x, y } = JSON.parse(savedPosition);
          setPosition({ x, y });
        }

        // Check if the tooltip has been shown before
        const tooltipShown = localStorage.getItem("chatbot_tooltip_shown");
        if (!tooltipShown) {
          // Show tooltip for first-time users
          setShowTooltip(true);
          // Hide tooltip after 5 seconds
          setTimeout(() => {
            setShowTooltip(false);
            localStorage.setItem("chatbot_tooltip_shown", "true");
          }, 5000);
        }
      } catch (error) {
        console.error("Error loading button position:", error);
      }
    };

    loadSavedPosition();
  }, []);

  // Save position to localStorage
  const savePosition = (x: number, y: number) => {
    try {
      localStorage.setItem("chatbot_button_position", JSON.stringify({ x, y }));
    } catch (error) {
      console.error("Error saving button position:", error);
    }
  };

  // Handle mouse down for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartPos.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  // Handle mouse move for dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = e.clientX - dragStartPos.current.x;
        const newY = e.clientY - dragStartPos.current.y;

        // Constrain to viewport
        const maxX = window.innerWidth - 60;
        const maxY = window.innerHeight - 60;

        setPosition({
          x: Math.max(0, Math.min(newX, maxX)),
          y: Math.max(0, Math.min(newY, maxY)),
        });
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        savePosition(position.x, position.y);
      }
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, position]);

  const openChatbot = () => {
    if (!isDragging) {
      setIsChatbotVisible(true);
    }
  };

  const closeChatbot = () => {
    setIsChatbotVisible(false);
  };

  const resetPosition = () => {
    setPosition({ x: 0, y: 0 });
    localStorage.removeItem("chatbot_button_position");
  };

  return (
    <>
      <div
        ref={buttonRef}
        className={`chatbot-floating-button ${isDragging ? "dragging" : ""}`}
        style={{
          right: position.x === 0 ? "20px" : "auto",
          bottom: position.y === 0 ? "20px" : "auto",
          left: position.x !== 0 ? `${position.x}px` : "auto",
          top: position.y !== 0 ? `${position.y}px` : "auto",
        }}
        onMouseDown={handleMouseDown}
        onClick={openChatbot}
        onContextMenu={(e) => {
          e.preventDefault();
          resetPosition();
        }}
      >
        {showTooltip && (
          <div className="chatbot-tooltip">
            <p>Kéo thả để di chuyển</p>
            <p>Chuột phải để reset vị trí</p>
          </div>
        )}
        <span className="chatbot-icon">💬</span>
      </div>

      <ChatBot visible={isChatbotVisible} onClose={closeChatbot} />
    </>
  );
};

export default ChatBotButton;
