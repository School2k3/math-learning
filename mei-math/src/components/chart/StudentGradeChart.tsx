import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { fetchStudentsByGrade } from "../../api/adminStatsAPI";

interface StudentGradeData {
  grade: string;
  students: number;
  color: string;
}

interface StudentGradeChartProps {
  dateRange?: {
    startDate: string;
    endDate: string;
  };
}

const StudentGradeChart: React.FC<StudentGradeChartProps> = ({ dateRange }) => {
  const [data, setData] = useState<StudentGradeData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const result = await fetchStudentsByGrade();
        const chartData = result.data.map((item, index) => ({
          grade: `Lớp ${item.grade}`,
          students: item.count,
          color: ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#8dd1e1"][index % 5]
        }));
        setData(chartData);
      } catch (error) {
        console.error("Error loading student grades:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [dateRange]);

  if (loading) {
    return (
      <div className="chart-container">
        <h3 className="chart-title">Số lượng học sinh theo lớp</h3>
        <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }
  
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