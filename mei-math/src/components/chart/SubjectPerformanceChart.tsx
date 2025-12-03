import React, { useState, useEffect } from "react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from "recharts";
import { fetchPerformanceByTopic } from "../../api/adminStatsAPI";

interface SubjectData {
  subject: string;
  avgScore: number;
  completion: number;
}

interface SubjectPerformanceChartProps {
  dateRange?: {
    startDate: string;
    endDate: string;
  };
}

const SubjectPerformanceChart: React.FC<SubjectPerformanceChartProps> = ({ dateRange }) => {
  const [data, setData] = useState<SubjectData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const result = await fetchPerformanceByTopic(dateRange?.startDate, dateRange?.endDate);
        const chartData = result.data.map(item => ({
          subject: item.topic,
          avgScore: item.averageScore,
          completion: item.completionRate
        }));
        setData(chartData);
      } catch (error) {
        console.error("Error loading subject performance:", error);
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
        <h3 className="chart-title">Hiệu suất theo chủ đề</h3>
        <div style={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }
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