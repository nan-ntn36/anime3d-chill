import { Helmet } from 'react-helmet-async';

/**
 * Home — Trang chủ (placeholder cho Day 5+)
 */
export default function Home() {
  return (
    <>
      <Helmet>
        <title>Anime3D-Chill — Xem Phim Anime Online</title>
        <meta name="description" content="Xem phim anime miễn phí với giao diện 3D hiện đại. Cập nhật phim mới mỗi ngày." />
      </Helmet>

      <section className="container" style={{ padding: 'var(--space-8) var(--space-4)' }}>
        <h1 className="animate-slideUp">
          Chào mừng đến <span className="text-gradient">Anime3D-Chill</span>
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-4)', maxWidth: '600px' }}>
          Website xem phim anime với giao diện 3D hiện đại. Đang trong quá trình xây dựng...
        </p>

        {/* Placeholder cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 'var(--space-4)',
          marginTop: 'var(--space-8)',
        }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card" style={{ aspectRatio: '2/3' }}>
              <div className="skeleton" style={{ width: '100%', height: '100%' }} />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
