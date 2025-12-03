import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { fetchCompletionBreakdown } from "../../api/adminStatsAPI";

interface CompletionData {
  [key: string]: any;
  name: string;
  value: number;
  color: string;
}

interface LessonCompletionChartProps {
  dateRange?: {
    startDate: string;
    endDate: string;
  };
}

const LessonCompletionChart: React.FC<LessonCompletionChartProps> = ({ dateRange }) => {
  const [data, setData] = useState<CompletionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const result = await fetchCompletionBreakdown(dateRange?.startDate, dateRange?.endDate);
        console.log("📊 Completion breakdown result:", result);
        
        // result đã là CompletionBreakdownData (không cần .data)
        const chartData = [
          { name: "Hoàn thành", value: result.completed.percentage, color: "#4CAF50" },
          { name: "Đang học", value: result.inProgress.percentage, color: "#FF9800" },
        ];
        setData(chartData);
      } catch (error) {
        console.error("Error loading completion data:", error);
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
        <h3 className="chart-title">Tỷ lệ hoàn thành bài học</h3>
        <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };

  return (
    <div className="chart-container">
      <h3 className="chart-title">Tỷ lệ hoàn thành bài học</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value: any) => [`${value}%`, "Tỷ lệ"]} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LessonCompletionChart;