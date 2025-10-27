import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface StudentGradeData {
  grade: string;
  students: number;
  color: string;
}

const data: StudentGradeData[] = [
  { grade: "Lớp 1", students: 324, color: "#8884d8" },
  { grade: "Lớp 2", students: 298, color: "#82ca9d" },
  { grade: "Lớp 3", students: 276, color: "#ffc658" },
  { grade: "Lớp 4", students: 189, color: "#ff7300" },
  { grade: "Lớp 5", students: 160, color: "#8dd1e1" },
];

interface StudentGradeChartProps {
  dateRange?: {
    startDate: string;
    endDate: string;
  };
}

const StudentGradeChart: React.FC<StudentGradeChartProps> = ({ dateRange }) => {
  // Sử dụng dateRange để filter dữ liệu
  console.log("StudentGradeChart dateRange:", dateRange);
  
  return (
    <div className="chart-container">
      <h3 className="chart-title">Số lượng học sinh theo lớp</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="grade" />
          <YAxis />
          <Tooltip 
            formatter={(value) => [value, "Học sinh"]}
            labelStyle={{ color: "#333" }}
          />
          <Bar dataKey="students" fill="#8884d8" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StudentGradeChart;