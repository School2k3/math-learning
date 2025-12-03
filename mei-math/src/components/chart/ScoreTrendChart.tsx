import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { fetchMonthlyTrend } from "../../api/adminStatsAPI";

interface ScoreData {
  month: string;
  avgScore: number;
  examsCompleted: number;
}

interface ScoreTrendChartProps {
  dateRange?: {
    startDate: string;
    endDate: string;
  };
}

const ScoreTrendChart: React.FC<ScoreTrendChartProps> = ({ dateRange }) => {
  const [data, setData] = useState<ScoreData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const result = await fetchMonthlyTrend(6, dateRange?.startDate, dateRange?.endDate);
        console.log("📊 Monthly trend result:", result);
        
        // result.data chứa array của monthly data
        const chartData = result.data.map(item => ({
          month: item.month,
          avgScore: item.avgScore,
          examsCompleted: item.examCount
        }));
        setData(chartData);
      } catch (error) {
        console.error("Error loading score trend:", error);
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
        <h3 className="chart-title">Xu hướng điểm số theo tháng</h3>
        <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }
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