import React from "react";
import "./ChatBot.css";

interface LoadingProps {
  isLoading: boolean;
}

const Loading: React.FC<LoadingProps> = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <span className="loading-text">Đang suy nghĩ...</span>
    </div>
  );
};

export default Loading;
