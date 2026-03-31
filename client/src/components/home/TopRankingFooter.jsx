import { Link } from 'react-router-dom';
import { FiStar, FiMessageCircle } from 'react-icons/fi';
import { useNewMovies } from '@/hooks/useMovies';
import { useRecentComments } from '@/hooks/useComments';
import './TopRankingFooter.css';

const GENRE_TAGS = [
  { name: 'Phiêu Lưu', slug: 'phieu-luu', color: '#f59e0b' },
  { name: 'Hành Động', slug: 'hanh-dong', color: '#ef4444' },
  { name: 'Hài Hước', slug: 'hai-huoc', color: '#10b981' },
  { name: 'Viễn Tưởng', slug: 'vien-tuong', color: '#6366f1' },
  { name: 'Tình Cảm', slug: 'tinh-cam', color: '#ec4899' },
];

export default function TopRankingFooter() {
  const { data, isLoading: moviesLoading } = useNewMovies(1);
  const recentComments = useRecentComments(4); // fetch 4 comments mới nhất
  
  const hotMovies = data?.items?.slice(0, 5) || [];
  const topMovies = data?.items?.slice(5, 10) || [];

  return (
    <section className="top-footer">
      <div className="container">
        <div className="top-footer__grid">
          {/* ĐANG HOT */}
          <div className="top-footer__col">
            <h3 className="top-footer__heading">
              <span className="top-footer__icon">🔥</span> ĐANG HOT
            </h3>
            <div className="top-footer__cards">
              {moviesLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="ranking-mini-card">
                    <div className="skeleton" style={{ width: 50, height: 60, borderRadius: 'var(--radius-sm)' }} />
                    <div className="ranking-mini-card__info" style={{ flex: 1 }}>
                      <div className="skeleton" style={{ height: 16, width: '80%', marginBottom: 8 }} />
                      <div className="skeleton" style={{ height: 12, width: '40%' }} />
                    </div>
                  </div>
                ))
              ) : (
                hotMovies.map((m, i) => (
                  <Link to={`/phim/${m.slug}`} key={m.slug} className="ranking-mini-card">
                    <span className={`ranking-mini-card__rank ${i < 3 ? `rank-${i + 1}` : ''}`}>{i + 1}</span>
                    <div className="ranking-mini-card__thumb">
                      <img src={m.poster || m.thumb} alt={m.title} referrerPolicy="no-referrer" />
                    </div>
                    <div className="ranking-mini-card__info">
                      <span className="ranking-mini-card__name">{m.title}</span>
                      <span className="ranking-mini-card__meta">{m.year} • {m.quality || 'FHD'}</span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* TOP ĐÁNH GIÁ */}
          <div className="top-footer__col">
            <h3 className="top-footer__heading">
              <span className="top-footer__icon"><FiStar /></span> TOP ĐÁNH GIÁ
            </h3>
            <div className="top-footer__cards">
              {moviesLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="ranking-mini-card">
                    <div className="skeleton" style={{ width: 50, height: 60, borderRadius: 'var(--radius-sm)' }} />
                    <div className="ranking-mini-card__info" style={{ flex: 1 }}>
                      <div className="skeleton" style={{ height: 16, width: '80%', marginBottom: 8 }} />
                      <div className="skeleton" style={{ height: 12, width: '40%' }} />
                    </div>
                  </div>
                ))
              ) : (
                topMovies.map((m, i) => (
                  <Link to={`/phim/${m.slug}`} key={m.slug} className="ranking-mini-card">
                    <span className={`ranking-mini-card__rank ${i < 3 ? `rank-${i + 1}` : ''}`}>{i + 1}</span>
                    <div className="ranking-mini-card__thumb">
                      <img src={m.poster || m.thumb} alt={m.title} referrerPolicy="no-referrer" />
                    </div>
                    <div className="ranking-mini-card__info">
                      <span className="ranking-mini-card__name">{m.title}</span>
                      <span className="ranking-mini-card__meta">{m.year} • {m.quality || 'FHD'}</span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* THỂ LOẠI HOT */}
          <div className="top-footer__col">
            <h3 className="top-footer__heading">
              <span className="top-footer__icon">⊞</span> THỂ LOẠI HOT
            </h3>
            <div className="top-footer__cards">
              {GENRE_TAGS.map((g, i) => (
                <Link to={`/the-loai/${g.slug}`} key={g.slug} className="genre-card">
                  <span className="genre-card__rank">{i + 1}</span>
                  <span className="genre-card__badge" style={{ background: g.color + '18', borderColor: g.color, color: g.color }}>
                    {g.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* BÌNH LUẬN MỚI */}
          <div className="top-footer__col">
            <h3 className="top-footer__heading">
              <span className="top-footer__icon"><FiMessageCircle /></span> BÌNH LUẬN MỚI
            </h3>
            <div className="top-footer__cards">
              {recentComments.isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="comment-mini-card">
                    <div className="skeleton" style={{ width: 32, height: 32, borderRadius: '50%' }} />
                    <div className="comment-mini-card__body" style={{ flex: 1 }}>
                      <div className="skeleton" style={{ height: 12, width: '40%', marginBottom: 6 }} />
                      <div className="skeleton" style={{ height: 14, width: '90%' }} />
                    </div>
                  </div>
                ))
              ) : recentComments.data?.length > 0 ? (
                recentComments.data.map((c) => {
                  // Tính thời gian relative (vừa xong, x giờ trước)
                  const d = new Date(c.createdAt);
                  const now = new Date();
                  const diffMinutes = Math.floor((now - d) / 60000);
                  let timeAgo = '';
                  if (diffMinutes < 1) timeAgo = 'Vừa xong';
                  else if (diffMinutes < 60) timeAgo = `${diffMinutes} phút trước`;
                  else if (diffMinutes < 1440) timeAgo = `${Math.floor(diffMinutes / 60)} giờ trước`;
                  else timeAgo = d.toLocaleDateString();

                  return (
                    <div key={c.id} className="comment-mini-card">
                      <div className="comment-mini-card__avatar">
                        {c.user?.avatar ? (
                          <img src={c.user.avatar} alt="avatar" style={{width: '100%', height:'100%', borderRadius:'50%', objectFit:'cover'}} />
                        ) : (
                          <span>{c.user?.username?.charAt(0) || 'U'}</span>
                        )}
                      </div>
                      <div className="comment-mini-card__body">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span className="comment-mini-card__user">{c.user?.username || 'Ẩn danh'}</span>
                          <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>{timeAgo}</span>
                        </div>
                        <span className="comment-mini-card__text">
                          "{c.content.length > 50 ? c.content.substring(0, 50) + '...' : c.content}"
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>Chưa có bình luận nào.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
