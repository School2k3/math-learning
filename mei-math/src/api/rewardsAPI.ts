import { buildApiUrl } from "../config/api";

export type Reward = {
  id: number;
  name: string;
  type: string;
  cost: number;
  imageUrl: string;
  description: string | null;
  createdAt: string;
};

export type UserReward = {
  id: number; // userRewardId từ backend
  userId: number;
  rewardId: number;
  reward: Reward;
};

// Lấy tất cả phần thưởng có sẵn
export const getAllRewards = async (type?: string): Promise<Reward[]> => {
  try {
    const url = type
      ? buildApiUrl(`/api/rewards?type=${type}`)
      : buildApiUrl("/api/rewards");

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.rewards || [];
  } catch (error) {
    console.error("Error fetching rewards:", error);
    throw error;
  }
};

// Lấy thông tin chi tiết 1 phần thưởng
export const getRewardById = async (id: number): Promise<Reward> => {
  try {
    const response = await fetch(buildApiUrl(`/api/rewards/${id}`), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.reward;
  } catch (error) {
    console.error("Error fetching reward by ID:", error);
    throw error;
  }
};

// Lấy danh sách phần thưởng của user (avatars đã sở hữu)
export const getUserRewards = async (
  userId: number,
  type?: string
): Promise<UserReward[]> => {
  try {
    const url = type
      ? buildApiUrl(`/api/rewards/user/${userId}?type=${type}`)
      : buildApiUrl(`/api/rewards/user/${userId}`);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.userRewards || [];
  } catch (error) {
    console.error("Error fetching user rewards:", error);
    throw error;
  }
};

// Đổi trophy lấy avatar
export const exchangeReward = async (
  userId: number,
  rewardId: number
): Promise<any> => {
  try {
    const response = await fetch(buildApiUrl("/api/rewards/exchange"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ userId, rewardId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error exchanging reward:", error);
    throw error;
  }
};

// Trang bị avatar (set làm avatar hiện tại)
export const equipAvatar = async (
  userId: number,
  userRewardId: number
): Promise<any> => {
  try {
    const response = await fetch(buildApiUrl("/api/rewards/equip"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ userId, userRewardId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error equipping avatar:", error);
    throw error;
  }
};
