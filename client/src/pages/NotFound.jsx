import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

/**
 * NotFound — 404
 */
export default function NotFound() {
  return (
    <>
      <Helmet>
        <title>404 — Không tìm thấy</title>
      </Helmet>

      <section style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - var(--header-height) - 200px)',
        textAlign: 'center',
        padding: 'var(--space-8)',
      }}>
        <h1 style={{ fontSize: '6rem', lineHeight: 1, marginBottom: 'var(--space-4)' }}>
          <span className="text-gradient">404</span>
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)', maxWidth: '400px' }}>
          Trang bạn tìm kiếm không tồn tại hoặc đã được chuyển đi nơi khác.
        </p>
        <Link to="/" className="btn btn-primary">
          ← Về Trang Chủ
        </Link>
      </section>
    </>
  );
}
