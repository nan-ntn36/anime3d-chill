import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiSearch, FiMenu, FiX, FiUser, FiLogOut } from 'react-icons/fi';
import useAuthStore from '@store/authStore';
import useAuth from '@/hooks/useAuth';
import './Header.css';

/**
 * Header — Navigation chính
 * Logo, nav links, search, user menu
 * Transparent mode on homepage (scrolls to solid)
 */
export default function Header() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAuthenticated, user } = useAuthStore();
  const { logout, isLoggingOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === '/';

  // Scroll listener for transparent header on homepage
  useEffect(() => {
    if (!isHome) {
      setIsScrolled(true); // always solid on non-home pages
      return;
    }

    const onScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };

    onScroll(); // initial check
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHome]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/tim-kiem?keyword=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsMobileOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const headerClass = `header ${isScrolled ? 'header--solid' : 'header--transparent'}`;

  return (
    <header className={headerClass}>
      <div className="header__inner container">
        {/* Logo */}
        <Link to="/" className="header__logo">
          <span className="header__logo-icon" style={{ color: 'var(--color-accent)' }}>⚡</span>
          <span className="header__logo-text" style={{ fontStyle: 'italic', fontWeight: 900, letterSpacing: '1px' }}>ANIME-3D</span>
        </Link>

        {/* Nav Links */}
        <nav className={`header__nav ${isMobileOpen ? 'header__nav--open' : ''}`} aria-label="Điều hướng chính">
          <Link to="/" className="header__link" onClick={() => setIsMobileOpen(false)}>
            Trang Chủ
          </Link>
          <Link to="/thung-phim" className="header__link" onClick={() => setIsMobileOpen(false)}>
            ThungPhim
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
          <form className="header__search header__search--mobile" onSubmit={handleSearch} role="search" aria-label="Tìm kiếm phim">
            <FiSearch className="header__search-icon" aria-hidden="true" />
            <input
              type="text"
              placeholder="Tìm phim..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="header__search-input"
              aria-label="Nhập tên phim cần tìm"
            />
          </form>
        </nav>

        {/* Right section */}
        <div className="header__right">
          {/* Search — desktop */}
          <form className="header__search header__search--desktop" onSubmit={handleSearch} role="search" aria-label="Tìm kiếm phim">
            <FiSearch className="header__search-icon" aria-hidden="true" />
            <input
              type="text"
              placeholder="Tìm phim..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="header__search-input"
              aria-label="Nhập tên phim cần tìm"
            />
          </form>

          {/* User */}
          {isAuthenticated ? (
            <div className="header__user">
              <Link to="/ca-nhan" className="header__avatar" title="Trang cá nhân">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.username} />
                ) : (
                  <FiUser />
                )}
              </Link>
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
