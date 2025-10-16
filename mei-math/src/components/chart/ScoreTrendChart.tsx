import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface ScoreData {
  month: string;
  avgScore: number;
  examsCompleted: number;
}

const data: ScoreData[] = [
  { month: "T1", avgScore: 7.2, examsCompleted: 245 },
  { month: "T2", avgScore: 7.5, examsCompleted: 268 },
  { month: "T3", avgScore: 7.8, examsCompleted: 289 },
  { month: "T4", avgScore: 7.6, examsCompleted: 312 },
  { month: "T5", avgScore: 8.1, examsCompleted: 298 },
  { month: "T6", avgScore: 8.3, examsCompleted: 334 },
];

const ScoreTrendChart: React.FC = () => {
  return (
    <div className="chart-container">
      <h3 className="chart-title">Xu hướng điểm số theo tháng</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis yAxisId="score" domain={[6, 10]} />
          <YAxis yAxisId="exams" orientation="right" />
          <Tooltip 
            formatter={(value: any, name: any) => {
              if (name === "avgScore") return [value, "Điểm trung bình"];
              if (name === "examsCompleted") return [value, "Bài kiểm tra"];
              return [value, name];
            }}
          />
          <Legend />
          <Line 
            yAxisId="score"
            type="monotone" 
            dataKey="avgScore" 
            stroke="#8884d8" 
            strokeWidth={3}
            dot={{ fill: "#8884d8", strokeWidth: 2, r: 4 }}
            name="Điểm trung bình"
          />
          <Line 
            yAxisId="exams"
            type="monotone" 
            dataKey="examsCompleted" 
            stroke="#82ca9d" 
            strokeWidth={2}
            dot={{ fill: "#82ca9d", strokeWidth: 2, r: 4 }}
            name="Số bài kiểm tra"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ScoreTrendChart;