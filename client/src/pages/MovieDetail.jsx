import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';

/**
 * MovieDetail — Chi tiết phim (placeholder cho Day 7+)
 */
export default function MovieDetail() {
  const { slug } = useParams();

  return (
    <>
      <Helmet>
        <title>Chi Tiết Phim — Anime3D-Chill</title>
      </Helmet>

      <section className="container" style={{ padding: 'var(--space-8) var(--space-4)' }}>
        <div className="animate-slideUp">
          <span className="badge">Đang phát triển</span>
          <h1 style={{ marginTop: 'var(--space-4)' }}>Chi tiết phim: {slug}</h1>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-2)' }}>
            Trang sẽ hiển thị thông tin, player, và danh sách tập phim.
          </p>

          {/* Placeholder player */}
          <div className="skeleton" style={{ width: '100%', aspectRatio: '16/9', marginTop: 'var(--space-6)', borderRadius: 'var(--radius-lg)' }} />
        </div>
      </section>
    </>
  );
}
