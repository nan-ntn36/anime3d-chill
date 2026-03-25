import { Link } from 'react-router-dom';
import { FiStar, FiMessageCircle } from 'react-icons/fi';
import { useNewMovies } from '@/hooks/useMovies';
import './TopRankingFooter.css';

const GENRE_TAGS = [
  { name: 'Phiêu Lưu', slug: 'phieu-luu', color: '#f59e0b' },
  { name: 'Hành Động', slug: 'hanh-dong', color: '#ef4444' },
  { name: 'Hài Hước', slug: 'hai-huoc', color: '#10b981' },
  { name: 'Viễn Tưởng', slug: 'vien-tuong', color: '#6366f1' },
  { name: 'Tình Cảm', slug: 'tinh-cam', color: '#ec4899' },
];

const MOCK_COMMENTS = [
  { user: 'LUFFY_D_MŨ_CỐI', text: '"Ae xem phim ở đây mượt thật, server VIP quá..."' },
  { user: 'NARUTO_FAN_99', text: '"Anime 3D chất lượng 4K mượt mà, quá đỉnh..."' },
  { user: 'ZORO_HUNTER', text: '"Server nhanh, không lag, xem cực phê..."' },
  { user: 'SAKURA_CHAN', text: '"Phim hay quá, cập nhật nhanh lắm..."' },
];

export default function TopRankingFooter() {
  const { data } = useNewMovies(1);
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
              {hotMovies.map((m, i) => (
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
              ))}
            </div>
          </div>

          {/* TOP ĐÁNH GIÁ */}
          <div className="top-footer__col">
            <h3 className="top-footer__heading">
              <span className="top-footer__icon"><FiStar /></span> TOP ĐÁNH GIÁ
            </h3>
            <div className="top-footer__cards">
              {topMovies.map((m, i) => (
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
              ))}
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
              {MOCK_COMMENTS.map((c, i) => (
                <div key={i} className="comment-mini-card">
                  <div className="comment-mini-card__avatar">👤</div>
                  <div className="comment-mini-card__body">
                    <span className="comment-mini-card__user">{c.user}</span>
                    <span className="comment-mini-card__text">{c.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
