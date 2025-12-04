import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/header';

import { getAllRewards, getUserRewards, equipAvatar, exchangeReward } from '../api/rewardsAPI';
import type { Reward, UserReward } from '../api/rewardsAPI';
import { getUserStats } from '../api/userStatsAPI';
import '../css/rewards.css';

const RewardsPage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [allRewards, setAllRewards] = useState<Reward[]>([]);
  const [userRewards, setUserRewards] = useState<UserReward[]>([]);
  const [ownedAvatars, setOwnedAvatars] = useState<number>(0);
  const [trophies, setTrophies] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [equipping, setEquipping] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<'avatar' | 'badge' | 'item' | 'decoration'>('avatar');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    loadRewardsData(parsedUser.id);
  }, [navigate, selectedType]);

  const loadRewardsData = async (userId: number) => {
    try {
      setLoading(true);
      
      // Lấy tất cả rewards theo type đang chọn
      const rewards = await getAllRewards(selectedType);
      setAllRewards(rewards);

      // Lấy rewards user đã sở hữu theo type
      const userAvatars = await getUserRewards(userId, selectedType);
      setUserRewards(userAvatars);
      setOwnedAvatars(userAvatars.length);

      // Lấy số cúp từ user stats API
      const stats = await getUserStats(userId);
      console.log('Stats response:', stats);
      setTrophies(stats.data?.trophies || 0);

    } catch (error) {
      console.error('Error loading rewards data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarClick = async (reward: Reward) => {
    if (!user) return;

    const isOwned = isAvatarOwned(reward.id);

    // Nếu chưa sở hữu -> gọi API đổi cup
    if (!isOwned) {
      await handleExchangeReward(reward);
    } 
    // Nếu đã sở hữu -> gọi API trang bị
    else {
      await handleEquipAvatar(reward.id);
    }
  };

  const handleExchangeReward = async (reward: Reward) => {
    if (!user) return;

    // Kiểm tra đủ cup không
    if (trophies < reward.cost) {
      alert(`Không đủ cúp! Bạn cần ${reward.cost} cúp nhưng chỉ có ${trophies} cúp.`);
      return;
    }

    // Xác nhận đổi
    const confirmExchange = window.confirm(
      `Bạn có chắc muốn đổi ${reward.cost} cúp lấy "${reward.name}"?`
    );
    
    if (!confirmExchange) return;

    try {
      setEquipping(reward.id);
      const result = await exchangeReward(user.id, reward.id);
      
      alert(`Đổi thành công! Bạn đã nhận được "${reward.name}"`);
      console.log('Exchange result:', result);
      
      // Reload trang để cập nhật header và danh sách
      window.location.reload();
    } catch (error: any) {
      console.error('Error exchanging reward:', error);
      const errorMsg = error.message || 'Có lỗi xảy ra khi đổi quà';
      
      // Xử lý lỗi cụ thể
      if (errorMsg.includes('Not enough trophies')) {
        alert('Không đủ cúp để đổi!');
      } else if (errorMsg.includes('already owns')) {
        alert('Bạn đã sở hữu phần thưởng này rồi!');
      } else {
        alert(errorMsg);
      }
    } finally {
      setEquipping(null);
    }
  };

  const handleEquipAvatar = async (rewardId: number) => {
    if (!user) return;

    // Kiểm tra user đã sở hữu avatar này chưa
    const userReward = userRewards.find(ur => ur.rewardId === rewardId);
    if (!userReward) {
      return; // Không nên xảy ra vì đã check ở handleAvatarClick
    }

    // Lấy thông tin reward để cập nhật avatarUrl
    const reward = allRewards.find(r => r.id === rewardId);
    if (!reward) return;

    try {
      setEquipping(rewardId);
      await equipAvatar(user.id, userReward.id); // userReward.id chính là userRewardId
      
      // Cập nhật localStorage với cả currentAvatar và avatarUrl
      const updatedUser = { 
        ...user, 
        currentAvatar: rewardId,
        avatarUrl: reward.imageUrl
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      alert('Trang bị avatar thành công!');
      
      // Reload để cập nhật header
      window.location.reload();
    } catch (error: any) {
      console.error('Error equipping avatar:', error);
      alert(error.message || 'Có lỗi xảy ra khi trang bị avatar');
    } finally {
      setEquipping(null);
    }
  };

  const isAvatarOwned = (rewardId: number): boolean => {
    return userRewards.some(ur => ur.rewardId === rewardId);
  };

  const isCurrentAvatar = (rewardId: number): boolean => {
    return user?.currentAvatar === rewardId;
  };

  if (loading) {
    return (
      <>
        <Header bgWhite />
        <div className="rewards-container">
          <div className="loading-spinner-container">
            <div className="loading-spinner"></div>
            <div className="loading-text">Đang tải...</div>
          </div>
        </div>
        
      </>
    );
  }

  return (
    <>
      <Header bgWhite />
      <div className="rewards-container">
      {/* Profile Section */}
      <div className="rewards-profile">
        <div className="stats-item">
          <div className="stat-icon trophy-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 15C15.866 15 19 11.866 19 8V5H5V8C5 11.866 8.13401 15 12 15Z" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 15V19M12 19H8M12 19H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-label">Số avatar đang sở hữu</div>
            <div className="stat-value">{ownedAvatars}</div>
          </div>
        </div>

        <div className="profile-avatar">
          {user?.currentAvatar ? (
            <img 
              src={allRewards.find(r => r.id === user.currentAvatar)?.imageUrl || '/default-avatar.png'} 
              alt="Current Avatar" 
              className="current-avatar-img"
            />
          ) : (
            <div className="default-avatar">?</div>
          )}
          <div className="avatar-crown">
            <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"/>
            </svg>
          </div>
          <div className="user-name">{user?.fullName || 'User'}</div>
          <div className="user-grade">Khối {user?.grade || '-'}</div>
        </div>

        <div className="stats-item">
          <div className="stat-icon diamond-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 8L12 22L22 8L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M2 8L12 12L22 8" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-label">Số cúp hiện có</div>
            <div className="stat-value">{trophies}</div>
          </div>
        </div>
      </div>

      {/* Avatar Selection Section */}
      <div className="avatar-selection-section">
        <div className="section-header">
          <h2>AVATAR SỰ KIỆN</h2>
          <div className="type-tabs">
            <button 
              className={`type-tab ${selectedType === 'avatar' ? 'active' : ''}`}
              onClick={() => setSelectedType('avatar')}
            >
              Avatar
            </button>
            <button 
              className={`type-tab ${selectedType === 'badge' ? 'active' : ''}`}
              onClick={() => setSelectedType('badge')}
            >
              Huy hiệu
            </button>
            <button 
              className={`type-tab ${selectedType === 'item' ? 'active' : ''}`}
              onClick={() => setSelectedType('item')}
            >
              Vật phẩm
            </button>
            <button 
              className={`type-tab ${selectedType === 'decoration' ? 'active' : ''}`}
              onClick={() => setSelectedType('decoration')}
            >
              Trang trí
            </button>
          </div>
        </div>

        <div className="avatar-grid">
          {allRewards.map((reward) => (
            <div 
              key={reward.id} 
              className={`avatar-item ${isAvatarOwned(reward.id) ? 'owned' : 'locked'} ${isCurrentAvatar(reward.id) ? 'equipped' : ''}`}
              onClick={() => handleAvatarClick(reward)}
            >
              <div className="avatar-frame">
                <img 
                  src={reward.imageUrl} 
                  alt={reward.name} 
                  className="avatar-image"
                />
                {isCurrentAvatar(reward.id) && (
                  <div className="equipped-badge">Đang dùng</div>
                )}
                {!isAvatarOwned(reward.id) && (
                  <div className="locked-overlay">
                    <div className="lock-content">
                      <svg className="lock-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C9.79086 2 8 3.79086 8 6V8H6C4.89543 8 4 8.89543 4 10V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V10C20 8.89543 19.1046 8 18 8H16V6C16 3.79086 14.2091 2 12 2ZM14 8V6C14 4.89543 13.1046 4 12 4C10.8954 4 10 4.89543 10 6V8H14Z"/>
                      </svg>
                      <div className="reward-cost">{reward.cost} cúp</div>
                    </div>
                  </div>
                )}
              </div>
              {equipping === reward.id && (
                <div className="equipping-spinner">
                  <div className="spinner"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
    
    </>
  );
};

export default RewardsPage;
