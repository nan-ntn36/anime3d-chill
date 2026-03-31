import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import './AppLayout.css';

/**
 * AppLayout — Wrapper layout với Header + Footer + A11y skip link
 * Dùng cho tất cả trang có navigation
 */
export default function AppLayout() {
  return (
    <div className="app-layout">
      {/* Skip-to-content link — A11y Day 18 */}
      <a href="#main-content" className="skip-to-content">
        Chuyển đến nội dung chính
      </a>

      <Header />
      <main id="main-content" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
