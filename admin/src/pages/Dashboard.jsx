/**
 * Admin Dashboard — Thống kê tổng quan
 */

import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { HiUsers, HiUserPlus, HiHeart, HiEye, HiArrowRight, HiArrowRightOnRectangle } from 'react-icons/hi2';
import { useAdminStats } from '@hooks/useAdmin';
import useAuth from '@hooks/useAuth';
import useAuthStore from '@store/authStore';
import './Dashboard.css';

export default function Dashboard() {
  const { data: stats, isLoading, error } = useAdminStats();
  const { logout, isLoggingOut } = useAuth();
  const user = useAuthStore((s) => s.user);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  if (isLoading) {
    return (
      <div className="admin-dashboard">
        <Helmet><title>Admin Dashboard — Anime3D-Chill</title></Helmet>
        <div className="admin-header"><h1>Admin Dashboard</h1></div>
        <div className="stat-cards">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="stat-card skeleton-card">
              <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 12 }} />
              <div className="skeleton" style={{ width: '60%', height: 14, marginTop: 12 }} />
              <div className="skeleton" style={{ width: '40%', height: 28, marginTop: 8 }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <Helmet><title>Admin Dashboard — Anime3D-Chill</title></Helmet>
        <div className="admin-error">
          <p>Không thể tải dữ liệu thống kê</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>Thử lại</button>
        </div>
      </div>
    );
  }

  const statCards = [
    { icon: HiUsers, label: 'Tổng Người Dùng', value: stats?.totalUsers ?? 0, color: 'blue' },
    { icon: HiUserPlus, label: 'Mới Tuần Này', value: stats?.newUsersThisWeek ?? 0, color: 'green' },
    { icon: HiHeart, label: 'Lượt Yêu Thích', value: stats?.totalFavorites ?? 0, color: 'pink' },
    { icon: HiEye, label: 'Tổng Lượt Xem', value: stats?.totalViews ?? 0, color: 'amber' },
  ];

  return (
    <div className="admin-dashboard">
      <Helmet>
        <title>Admin Dashboard — Anime3D-Chill</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="admin-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p className="admin-subtitle">Xin chào, {user?.username} 👋</p>
        </div>
        <div className="admin-header__actions">
          <Link to="/users" className="btn btn-primary">Quản Lý Users <HiArrowRight /></Link>
          <button className="btn btn-ghost" onClick={handleLogout} disabled={isLoggingOut}>
            <HiArrowRightOnRectangle size={18} /> Đăng xuất
          </button>
        </div>
      </div>

      <div className="stat-cards">
        {statCards.map((card) => (
          <div key={card.label} className={`stat-card stat-card--${card.color}`}>
            <div className="stat-card__icon"><card.icon size={22} /></div>
            <span className="stat-card__label">{card.label}</span>
            <span className="stat-card__value">{card.value.toLocaleString('vi-VN')}</span>
          </div>
        ))}
      </div>

      <div className="admin-section">
        <h2 className="section-title">Top Phim Xem Nhiều (30 ngày)</h2>
        {stats?.topMovies?.length > 0 ? (
          <div className="top-movies-table">
            <table>
              <thead><tr><th>#</th><th>Phim (slug)</th><th>Lượt Xem</th></tr></thead>
              <tbody>
                {stats.topMovies.map((movie, index) => (
                  <tr key={movie.movieSlug}>
                    <td><span className={`rank-badge rank-badge--${index + 1}`}>{index + 1}</span></td>
                    <td className="movie-slug">{movie.movieSlug}</td>
                    <td className="view-count">{parseInt(movie.viewCount).toLocaleString('vi-VN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="empty-text">Chưa có dữ liệu lượt xem</p>
        )}
      </div>
    </div>
  );
}
