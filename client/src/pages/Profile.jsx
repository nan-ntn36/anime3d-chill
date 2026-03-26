import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FiUser, FiClock, FiHeart, FiSettings } from 'react-icons/fi';
import { useQuery } from '@tanstack/react-query';
import useAuthStore from '@/store/authStore';
import useAuth from '@/hooks/useAuth';
import userApi from '@/api/userApi';
import MovieGrid from '@/components/movie/MovieGrid';
import Pagination from '@/components/ui/Pagination';
import './Profile.css';

export default function Profile() {
  const { user } = useAuthStore();
  const { logout, isLoggingOut } = useAuth();
  const [activeTab, setActiveTab] = useState('history');

  // History Pagination
  const [historyPage, setHistoryPage] = useState(1);
  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ['me', 'history', historyPage],
    queryFn: async () => {
      const { data } = await userApi.getHistory(historyPage);
      return data;
    },
    enabled: activeTab === 'history',
    keepPreviousData: true
  });

  // Favorites Pagination
  const [favPage, setFavPage] = useState(1);
  const { data: favData, isLoading: favLoading } = useQuery({
    queryKey: ['me', 'favorites', favPage],
    queryFn: async () => {
      const { data } = await userApi.getFavorites(favPage);
      return data;
    },
    enabled: activeTab === 'favorites',
    keepPreviousData: true
  });

  const handleLogout = async () => {
    await logout();
  };

  // Mapper từ model User History/Favorites sang model MovieCard
  const mapToMovie = (item) => ({
    id: item.id,
    slug: item.movieSlug,
    title: item.movieName,
    thumb: item.movieThumb,
    poster: item.movieThumb,
    currentEpisode: item.episode || '',
  });

  return (
    <>
      <Helmet>
        <title>{`Trang cá nhân — ${user?.username || 'Bạn'} | Anime3D-Chill`}</title>
      </Helmet>

      <div className="profile-page container">
        <aside className="profile-sidebar">
          <div className="profile-header">
            <div className="profile-avatar">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.username} />
              ) : (
                <FiUser className="profile-avatar-icon" />
              )}
            </div>
            <h2 className="profile-name">{user?.username}</h2>
            <p className="profile-email">{user?.email}</p>
            <span className="profile-role badge-vip">{user?.role === 'admin' ? 'Quản Trị Viên' : 'Thành Viên VIP'}</span>
          </div>

          <nav className="profile-nav">
            <button 
              className={`profile-nav-item ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              <FiClock /> Lịch sử xem phim
            </button>
            <button 
              className={`profile-nav-item ${activeTab === 'favorites' ? 'active' : ''}`}
              onClick={() => setActiveTab('favorites')}
            >
              <FiHeart /> Phim yêu thích
            </button>
            <button 
              className={`profile-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <FiSettings /> Quản lý tài khoản
            </button>
          </nav>

          <div className="profile-footer">
            <button 
              className="btn btn-outline btn-block" 
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? 'Đang thoát...' : 'Đăng xuất'}
            </button>
          </div>
        </aside>

        <main className="profile-content">
          {activeTab === 'history' && (
            <div className="profile-section">
              <h3 className="profile-section-title">Lịch Sử Xem Phim</h3>
              <p className="text-muted" style={{ marginBottom: '1.5rem' }}>Các tập phim bạn đã xem dở dang sẽ tiếp tục từ nơi bạn dừng lại.</p>
              
              <MovieGrid 
                movies={historyData?.data?.map(mapToMovie) || []} 
                loading={historyLoading} 
                columns={4}
              />
              
              {historyData?.meta && historyData.meta.totalPages > 1 && (
                <Pagination 
                  currentPage={historyData.meta.page}
                  totalPages={historyData.meta.totalPages}
                  onPageChange={setHistoryPage}
                />
              )}
            </div>
          )}

          {activeTab === 'favorites' && (
            <div className="profile-section">
              <h3 className="profile-section-title">Phim Yêu Thích</h3>
              <p className="text-muted" style={{ marginBottom: '1.5rem' }}>Bộ sưu tập anime tâm đắc nhất của bạn.</p>
              
              <MovieGrid 
                movies={favData?.data?.map(mapToMovie) || []} 
                loading={favLoading} 
                columns={4}
              />

              {favData?.meta && favData.meta.totalPages > 1 && (
                <Pagination 
                  currentPage={favData.meta.page}
                  totalPages={favData.meta.totalPages}
                  onPageChange={setFavPage}
                />
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="profile-section">
              <h3 className="profile-section-title">Quản Lý Thông Tin</h3>
              <div className="coming-soon">
                <FiSettings style={{ fontSize: '3rem', color: 'var(--color-border)', marginBottom: '1rem' }} />
                <p className="text-muted">Chức năng cập nhật Avatar & Đổi mật khẩu đang được lập trình.</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
