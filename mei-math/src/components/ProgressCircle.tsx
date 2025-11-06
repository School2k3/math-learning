import React, { useState } from 'react';

interface ProgressCircleProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  completed?: boolean;
}

const ProgressCircle: React.FC<ProgressCircleProps> = ({ 
  progress, 
  size = 40, 
  strokeWidth = 4,
  completed = false
}) => {
  const [hovered, setHovered] = useState(false);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  // Tooltip text
  const tooltipText = completed
    ? "Bạn đã hoàn thành bài học này"
    : `Bạn đã hoàn thành ${Math.round(progress)}% bài học này`;

  return (
    <div
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <svg
        width={size}
        height={size}
        style={{ transform: 'rotate(-90deg)' }}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={completed ? "#4CAF50" : "#49BBBD"}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 0.5s ease-in-out',
          }}
        />
      </svg>
      {/* Progress text or checkmark */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: `${size * 0.25}px`,
          fontWeight: 600,
          color: completed ? "#4CAF50" : "#49BBBD",
        }}
      >
        {completed ? "✓" : `${Math.round(progress)}%`}
      </div>
      {/* Tooltip on hover */}
      {hovered && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '-36px',
            transform: 'translateX(-50%)',
            background: 'rgba(40, 40, 40, 0.95)',
            color: '#fff',
            padding: '6px 14px',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: 500,
            whiteSpace: 'nowrap',
            zIndex: 10,
            boxShadow: '0 2px 8px #0002',
          }}
        >
          {tooltipText}
        </div>
      )}
    </div>
  );
};

export default ProgressCircle;