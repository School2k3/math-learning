import React from "react";
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface ActivityData {
  day: string;
  activeUsers: number;
  newRegistrations: number;
  lessonsCompleted: number;
}

const data: ActivityData[] = [
  { day: "CN", activeUsers: 156, newRegistrations: 12, lessonsCompleted: 234 },
  { day: "T2", activeUsers: 342, newRegistrations: 28, lessonsCompleted: 456 },
  { day: "T3", activeUsers: 389, newRegistrations: 35, lessonsCompleted: 523 },
  { day: "T4", activeUsers: 367, newRegistrations: 31, lessonsCompleted: 487 },
  { day: "T5", activeUsers: 398, newRegistrations: 42, lessonsCompleted: 567 },
  { day: "T6", activeUsers: 445, newRegistrations: 38, lessonsCompleted: 612 },
  { day: "T7", activeUsers: 278, newRegistrations: 22, lessonsCompleted: 345 },
];

const WeeklyActivityChart: React.FC = () => {
  return (
    <div className="chart-container">
      <h3 className="chart-title">Hoạt động hàng tuần</h3>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis yAxisId="users" />
          <YAxis yAxisId="lessons" orientation="right" />
          <Tooltip 
            formatter={(value: any, name: any) => {
              switch(name) {
                case "activeUsers": return [value, "Người dùng hoạt động"];
                case "newRegistrations": return [value, "Đăng ký mới"];
                case "lessonsCompleted": return [value, "Bài học hoàn thành"];
                default: return [value, name];
              }
            }}
          />
          <Legend />
          <Bar 
            yAxisId="users"
            dataKey="activeUsers" 
            fill="#8884d8" 
            name="Người dùng hoạt động"
            radius={[2, 2, 0, 0]}
          />
          <Bar 
            yAxisId="users"
            dataKey="newRegistrations" 
            fill="#82ca9d" 
            name="Đăng ký mới"
            radius={[2, 2, 0, 0]}
          />
          <Line 
            yAxisId="lessons"
            type="monotone" 
            dataKey="lessonsCompleted" 
            stroke="#ff7300" 
            strokeWidth={3}
            dot={{ fill: "#ff7300", strokeWidth: 2, r: 4 }}
            name="Bài học hoàn thành"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeeklyActivityChart;