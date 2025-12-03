import React, { useState, useEffect } from "react";
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { fetchWeeklyActivity } from "../../api/adminStatsAPI";

interface ActivityData {
  day: string;
  activeUsers: number;
  newRegistrations: number;
  lessonsCompleted: number;
}

interface WeeklyActivityChartProps {
  dateRange?: {
    startDate: string;
    endDate: string;
  };
}

const WeeklyActivityChart: React.FC<WeeklyActivityChartProps> = ({ dateRange }) => {
  const [data, setData] = useState<ActivityData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const result = await fetchWeeklyActivity(4, dateRange?.startDate, dateRange?.endDate);
        console.log("📊 Weekly activity result:", result);
        
        // result.data chứa array của weekly data
        const chartData = result.data.map(item => ({
          day: item.week,
          activeUsers: item.activeStudents,
          newRegistrations: item.examRegistrations,
          lessonsCompleted: item.lessonCompletion
        }));
        setData(chartData);
      } catch (error) {
        console.error("Error loading weekly activity:", error);
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
        <h3 className="chart-title">Hoạt động hàng tuần</h3>
        <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }
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