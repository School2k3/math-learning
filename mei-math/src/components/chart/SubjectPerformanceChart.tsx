import React from "react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from "recharts";

interface SubjectData {
  subject: string;
  avgScore: number;
  completion: number;
}

const data: SubjectData[] = [
  { subject: "Số học", avgScore: 8.2, completion: 85 },
  { subject: "Hình học", avgScore: 7.8, completion: 78 },
  { subject: "Đo lường", avgScore: 8.5, completion: 92 },
  { subject: "Giải toán", avgScore: 7.5, completion: 72 },
  { subject: "Logic", avgScore: 8.0, completion: 80 },
  { subject: "Thống kê", avgScore: 7.9, completion: 75 },
];

const SubjectPerformanceChart: React.FC = () => {
  return (
    <div className="chart-container">
      <h3 className="chart-title">Hiệu suất theo chủ đề</h3>
      <ResponsiveContainer width="100%" height={350}>
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 100]} 
            tick={false}
          />
          <Radar
            name="Điểm trung bình"
            dataKey="avgScore"
            stroke="#8884d8"
            fill="#8884d8"
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <Radar
            name="Tỷ lệ hoàn thành"
            dataKey="completion"
            stroke="#82ca9d"
            fill="#82ca9d"
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SubjectPerformanceChart;