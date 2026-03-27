/**
 * Dashboard — CoreUI-style stats + top movies
 */

import { Helmet } from 'react-helmet-async';
import { HiUsers, HiUserPlus, HiHeart, HiEye, HiArrowTrendingUp } from 'react-icons/hi2';
import { useAdminStats } from '@hooks/useAdmin';
import './Dashboard.css';

export default function Dashboard() {
  const { data: stats, isLoading, error } = useAdminStats();

  if (isLoading) {
    return (
      <>
        <Helmet><title>Dashboard — Admin</title></Helmet>
        <div className="stat-row">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="stat-card stat-card--primary" style={{ opacity: 0.4 }}>
              <div className="skeleton" style={{ width: 80, height: 28, background: 'rgba(255,255,255,0.2)' }} />
              <div className="skeleton" style={{ width: 120, height: 14, marginTop: 8, background: 'rgba(255,255,255,0.15)' }} />
            </div>
          ))}
        </div>
      </>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="card-body" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Không thể tải dữ liệu thống kê</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>Thử lại</button>
        </div>
      </div>
    );
  }

  const statCards = [
    { icon: HiUsers, label: 'Tổng người dùng', value: stats?.totalUsers ?? 0, color: 'primary' },
    { icon: HiUserPlus, label: 'Users mới (7 ngày)', value: stats?.newUsersThisWeek ?? 0, color: 'info' },
    { icon: HiHeart, label: 'Lượt yêu thích', value: stats?.totalFavorites ?? 0, color: 'warning' },
    { icon: HiEye, label: 'Tổng lượt xem', value: stats?.totalViews ?? 0, color: 'danger' },
  ];

  return (
    <>
      <Helmet><title>Dashboard — Admin</title></Helmet>

      {/* ── Stat Cards ──────────────────────── */}
      <div className="stat-row">
        {statCards.map((card) => (
          <div key={card.label} className={`stat-card stat-card--${card.color}`}>
            <div className="stat-card__icon"><card.icon size={40} /></div>
            <div className="stat-card__value">{card.value.toLocaleString('vi-VN')}</div>
            <div className="stat-card__label">{card.label}</div>
          </div>
        ))}
      </div>

      {/* ── Traffic & Sales style section ──── */}
      <div className="card dashboard-traffic">
        <div className="card-header">
          <span>Traffic & Engagement</span>
          <span className="badge badge-info"><HiArrowTrendingUp size={12} /> Live</span>
        </div>
        <div className="card-body">
          <div className="traffic-stats">
            <div className="traffic-stat">
              <div className="traffic-stat__border traffic-stat__border--primary" />
              <div className="traffic-stat__label">Tổng Users</div>
              <div className="traffic-stat__value">{(stats?.totalUsers ?? 0).toLocaleString('vi-VN')}</div>
            </div>
            <div className="traffic-stat">
              <div className="traffic-stat__border traffic-stat__border--info" />
              <div className="traffic-stat__label">Users mới</div>
              <div className="traffic-stat__value">{(stats?.newUsersThisWeek ?? 0).toLocaleString('vi-VN')}</div>
            </div>
            <div className="traffic-stat">
              <div className="traffic-stat__border traffic-stat__border--warning" />
              <div className="traffic-stat__label">Favorites</div>
              <div className="traffic-stat__value">{(stats?.totalFavorites ?? 0).toLocaleString('vi-VN')}</div>
            </div>
            <div className="traffic-stat">
              <div className="traffic-stat__border traffic-stat__border--danger" />
              <div className="traffic-stat__label">Lượt xem</div>
              <div className="traffic-stat__value">{(stats?.totalViews ?? 0).toLocaleString('vi-VN')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Top Movies ──────────────────────── */}
      <div className="card">
        <div className="card-header">Top Phim Xem Nhiều (30 ngày)</div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 50 }}>#</th>
                <th>Phim</th>
                <th style={{ width: 140 }}>Lượt xem</th>
                <th style={{ width: 200 }}>Tỷ lệ</th>
              </tr>
            </thead>
            <tbody>
              {stats?.topMovies?.length > 0 ? (
                stats.topMovies.map((movie, i) => {
                  const maxViews = Math.max(...stats.topMovies.map(m => parseInt(m.viewCount)));
                  const pct = Math.round((parseInt(movie.viewCount) / maxViews) * 100);
                  return (
                    <tr key={movie.movieSlug}>
                      <td>
                        <span className={`rank rank--${i + 1}`}>{i + 1}</span>
                      </td>
                      <td className="movie-slug-cell">
                        {movie.movieSlug}
                      </td>
                      <td className="views-cell">
                        {parseInt(movie.viewCount).toLocaleString('vi-VN')}
                      </td>
                      <td>
                        <div className="progress-bar">
                          <div
                            className={`progress-bar__fill progress-bar__fill--${['primary','info','warning','danger','success'][i] || 'primary'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Chưa có dữ liệu</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
