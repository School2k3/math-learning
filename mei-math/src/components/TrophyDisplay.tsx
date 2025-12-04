import React, { useState, useEffect } from "react";
import { getUserStats } from "../api/userStatsAPI";
import { useAuth } from "../contexts/AuthContext";
import "../css/trophy-display.css";

const TrophyDisplay: React.FC = () => {
  const { user } = useAuth();
  const [trophyCount, setTrophyCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrophies = async () => {
      if (!user?.id) return;
      
      try {
        const stats = await getUserStats(user.id);
        console.log("🏆 [TrophyDisplay] Full stats response:", stats);
        console.log("🏆 [TrophyDisplay] Trophies from stats:", stats.trophies);
        console.log("🏆 [TrophyDisplay] Trophies from stats.data:", stats.data?.trophies);
        
        const trophyValue = stats.data?.trophies || stats.trophies || 0;
        console.log("🏆 [TrophyDisplay] Final trophy value:", trophyValue);
        
        setTrophyCount(trophyValue);
      } catch (error) {
        console.error("Error fetching trophies:", error);
        setTrophyCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchTrophies();
  }, [user?.id]);

  if (loading) return null;

  return (
    <div className="trophy-display-container">
      <div className="trophy-icon">
        🏆
      </div>
      <div className="trophy-count">
        {trophyCount.toLocaleString()}
      </div>
    </div>
  );
};

export default TrophyDisplay;
