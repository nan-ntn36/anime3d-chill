import { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { FiUser, FiClock, FiHeart, FiSettings, FiSave, FiEye, FiEyeOff } from 'react-icons/fi';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import useAuthStore from '@/store/authStore';
import useAuth from '@/hooks/useAuth';
import userApi from '@/api/userApi';
import MovieGrid from '@/components/movie/MovieGrid';
import Pagination from '@/components/ui/Pagination';
import './Profile.css';

export default function Profile() {
  const { user, setUser } = useAuthStore();
  const { logout, isLoggingOut } = useAuth();
  const [activeTab, setActiveTab] = useState('history');

  // History Pagination
  const [historyPage, setHistoryPage] = useState(1);
  const { data: historyData, isLoading: historyLoading, isFetching: historyFetching } = useQuery({
    queryKey: ['me', 'history', historyPage],
    queryFn: async () => {
      const { data } = await userApi.getHistory(historyPage);
      return data;
    },
    enabled: activeTab === 'history',
    placeholderData: (prev) => prev,
  });

  // Favorites Pagination
  const [favPage, setFavPage] = useState(1);
  const { data: favData, isLoading: favLoading, isFetching: favFetching } = useQuery({
    queryKey: ['me', 'favorites', favPage],
    queryFn: async () => {
      const { data } = await userApi.getFavorites(favPage);
      return data;
    },
    enabled: activeTab === 'favorites',
    placeholderData: (prev) => prev,
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

  // ── Settings Form State ──────────────────────────
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProfile = useCallback(async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const payload = {};

      // Avatar update
      if (avatarUrl && avatarUrl !== user?.avatar) {
        payload.avatar = avatarUrl;
      }

      // Password change
      if (newPassword) {
        if (!oldPassword) {
          toast.error('Vui lòng nhập mật khẩu cũ');
          setIsSaving(false);
          return;
        }
        if (newPassword.length < 6) {
          toast.error('Mật khẩu mới phải từ 6 ký tự');
          setIsSaving(false);
          return;
        }
        if (newPassword !== confirmPassword) {
          toast.error('Mật khẩu xác nhận không khớp');
          setIsSaving(false);
          return;
        }
        payload.oldPassword = oldPassword;
        payload.newPassword = newPassword;
      }

      if (Object.keys(payload).length === 0) {
        toast('Không có thay đổi nào', { icon: '💡' });
        setIsSaving(false);
        return;
      }

      const { data } = await userApi.updateProfile(payload);
      const updatedUser = data.data;

      // Update store
      if (updatedUser) {
        setUser({ ...user, ...updatedUser });
      }

      toast.success('Cập nhật thành công!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi cập nhật tài khoản');
    } finally {
      setIsSaving(false);
    }
  }, [avatarUrl, oldPassword, newPassword, confirmPassword, user, setUser]);

  return (
    <>
      <Helmet>
        <title>{`Trang cá nhân — ${user?.username || 'Bạn'} | Anime3D-Chill`}</title>
        <meta name="description" content="Quản lý tài khoản, lịch sử xem phim và phim yêu thích." />
        <meta name="robots" content="noindex, nofollow" />
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
                loading={historyLoading || historyFetching} 
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
                loading={favLoading || favFetching} 
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
              <h3 className="profile-section-title">Quản Lý Tài Khoản</h3>

              <form className="settings-form" onSubmit={handleSaveProfile}>
                {/* Avatar */}
                <div className="settings-group">
                  <h4 className="settings-group__title">Ảnh đại diện</h4>
                  <div className="settings-avatar-row">
                    <div className="settings-avatar-preview">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Preview" onError={(e) => { e.target.style.display = 'none'; }} />
                      ) : (
                        <FiUser size={32} />
                      )}
                    </div>
                    <div className="settings-avatar-input">
                      <input
                        type="url"
                        className="form-input"
                        placeholder="https://example.com/avatar.jpg"
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                      />
                      <p className="form-hint">Nhập URL ảnh (Imgur, ImgBB, v.v.)</p>
                    </div>
                  </div>
                </div>

                {/* Password */}
                <div className="settings-group">
                  <h4 className="settings-group__title">Đổi mật khẩu</h4>
                  
                  <div className="form-field">
                    <label>Mật khẩu hiện tại</label>
                    <div className="form-input-wrap">
                      <input
                        type={showOld ? 'text' : 'password'}
                        className="form-input"
                        placeholder="Nhập mật khẩu cũ"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                      />
                      <button type="button" className="form-input-toggle" onClick={() => setShowOld(!showOld)}>
                        {showOld ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="form-field">
                    <label>Mật khẩu mới</label>
                    <div className="form-input-wrap">
                      <input
                        type={showNew ? 'text' : 'password'}
                        className="form-input"
                        placeholder="Tối thiểu 6 ký tự"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                      <button type="button" className="form-input-toggle" onClick={() => setShowNew(!showNew)}>
                        {showNew ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="form-field">
                    <label>Xác nhận mật khẩu mới</label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Nhập lại mật khẩu mới"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary btn-save" disabled={isSaving}>
                  <FiSave size={16} />
                  {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </form>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
