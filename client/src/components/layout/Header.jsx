import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiMenu, FiX, FiUser, FiLogOut } from 'react-icons/fi';
import useAuthStore from '@store/authStore';
import './Header.css';

/**
 * Header — Navigation chính
 * Logo, nav links, search, user menu
 */
export default function Header() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { isAuthenticated, user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/tim-kiem?keyword=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsMobileOpen(false);
    }
  };

  const handleLogout = () => {
    clearAuth();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header__inner container">
        {/* Logo */}
        <Link to="/" className="header__logo">
          <span className="header__logo-icon">🎬</span>
          <span className="header__logo-text text-gradient">Anime3D</span>
        </Link>

        {/* Nav Links */}
        <nav className={`header__nav ${isMobileOpen ? 'header__nav--open' : ''}`}>
          <Link to="/" className="header__link" onClick={() => setIsMobileOpen(false)}>
            Trang Chủ
          </Link>
          <Link to="/phim-moi" className="header__link" onClick={() => setIsMobileOpen(false)}>
            Phim Mới
          </Link>
          <Link to="/the-loai" className="header__link" onClick={() => setIsMobileOpen(false)}>
            Thể Loại
          </Link>
          <Link to="/quoc-gia" className="header__link" onClick={() => setIsMobileOpen(false)}>
            Quốc Gia
          </Link>

          {/* Search — mobile */}
          <form className="header__search header__search--mobile" onSubmit={handleSearch}>
            <FiSearch className="header__search-icon" />
            <input
              type="text"
              placeholder="Tìm phim..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="header__search-input"
            />
          </form>
        </nav>

        {/* Right section */}
        <div className="header__right">
          {/* Search — desktop */}
          <form className="header__search header__search--desktop" onSubmit={handleSearch}>
            <FiSearch className="header__search-icon" />
            <input
              type="text"
              placeholder="Tìm phim..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="header__search-input"
            />
          </form>

          {/* User */}
          {isAuthenticated ? (
            <div className="header__user">
              <span className="header__avatar">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.username} />
                ) : (
                  <FiUser />
                )}
              </span>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout} title="Đăng xuất">
                <FiLogOut />
              </button>
            </div>
          ) : (
            <Link to="/dang-nhap" className="btn btn-primary btn-sm">
              Đăng Nhập
            </Link>
          )}

          {/* Mobile toggle */}
          <button
            className="header__toggle"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            aria-label="Toggle menu"
          >
            {isMobileOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>
    </header>
  );
}
