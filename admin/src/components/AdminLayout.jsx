/**
 * AdminLayout — CoreUI-style sidebar + header + content
 */

import { NavLink, useLocation } from 'react-router-dom';
import { HiChartBarSquare, HiUsers, HiBell, HiArrowRightOnRectangle } from 'react-icons/hi2';
import useAuth from '@hooks/useAuth';
import useAuthStore from '@store/authStore';

export default function AdminLayout({ children }) {
  const location = useLocation();
  const { logout, isLoggingOut } = useAuth();
  const user = useAuthStore((s) => s.user);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  // Breadcrumb
  const pathMap = { '/': 'Dashboard', '/users': 'Quản Lý Users' };
  const currentPage = pathMap[location.pathname] || 'Dashboard';

  return (
    <div className="admin-layout">
      {/* ── Sidebar ──────────────────────────── */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand__logo">A3</div>
          <span className="sidebar-brand__text">ANIME3D ADMIN</span>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section">MAIN</div>
          <NavLink to="/" end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <HiChartBarSquare size={20} /> Dashboard
          </NavLink>
          <NavLink to="/users" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <HiUsers size={20} /> Users
          </NavLink>
        </nav>
      </aside>

      {/* ── Main ─────────────────────────────── */}
      <div className="admin-main">
        {/* Header */}
        <header className="admin-topbar">
          <div className="topbar-left">
            <nav className="topbar-nav">
              <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
                Dashboard
              </NavLink>
              <NavLink to="/users" className={({ isActive }) => isActive ? 'active' : ''}>
                Users
              </NavLink>
            </nav>
          </div>
          <div className="topbar-right">
            <button className="topbar-icon" title="Notifications">
              <HiBell size={20} />
            </button>
            <div className="topbar-user">
              <div className="topbar-user__avatar">
                {user?.username?.charAt(0).toUpperCase() || 'A'}
              </div>
              <span className="topbar-user__name">{user?.username || 'Admin'}</span>
            </div>
            <button className="topbar-icon" onClick={handleLogout} disabled={isLoggingOut} title="Đăng xuất">
              <HiArrowRightOnRectangle size={20} />
            </button>
          </div>
        </header>

        {/* Breadcrumb */}
        <div className="breadcrumb-bar">
          <div className="breadcrumb">
            <a href="/">Home</a>
            <span className="breadcrumb-sep">/</span>
            <span>{currentPage}</span>
          </div>
        </div>

        {/* Content */}
        <main className="admin-content animate-fadeIn">
          {children}
        </main>

        {/* Footer */}
        <footer className="admin-footer">
          <span>Anime3D-Chill © 2026</span>
          <span>Admin CMS v1.0</span>
        </footer>
      </div>
    </div>
  );
}
