import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

/**
 * AppLayout — Wrapper layout với Header + Footer
 * Dùng cho tất cả trang có navigation
 */
export default function AppLayout() {
  return (
    <div className="app-layout" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
