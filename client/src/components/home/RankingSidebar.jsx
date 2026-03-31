/**
 * RankingSidebar — BXH Phim Hot
 * Sử dụng trending data thật từ analytics (Day 17)
 * Fallback: useNewMovies nếu trending chưa có data
 */

import { Link } from 'react-router-dom';
import { FiEye } from 'react-icons/fi';
import { useTrendingMovies, useNewMovies } from '@/hooks/useMovies';
import './RankingSidebar.css';

/**
 * Format view count: 1234 → "1.2K"
 */
function formatViews(count) {
  if (!count) return null;
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

export default function RankingSidebar({ title = "BXH PHIM HOT" }) {
  const trending = useTrendingMovies();
  const fallback = useNewMovies(1);

  // Ưu tiên trending data, fallback sang newMovies
  const hasTrending = trending.data?.items?.length > 0;
  const isLoading = hasTrending ? false : fallback.isLoading;

  const movies = hasTrending
    ? trending.data.items.slice(0, 10).map((m) => ({
        slug: m.movieSlug,
        title: m.title || m.movieSlug,
        thumb: m.thumb,
        poster: m.poster,
        year: m.year,
        quality: m.quality,
        viewCount: m.viewCount,
      }))
    : (fallback.data?.items?.slice(0, 10) || []);

  if (isLoading) {
    return (
      <div className="ranking-sidebar ranking-sidebar--loading">
        <h3 className="ranking-sidebar__title">{title}</h3>
        <div className="skeleton" style={{ height: 60, marginBottom: 10 }} />
        <div className="skeleton" style={{ height: 60, marginBottom: 10 }} />
        <div className="skeleton" style={{ height: 60, marginBottom: 10 }} />
      </div>
    );
  }

  return (
    <aside className="ranking-sidebar">
      <h3 className="ranking-sidebar__title">
        <span className="ranking-sidebar__icon">🔥</span> {title}
      </h3>
      <div className="ranking-sidebar__list">
        {movies.map((movie, index) => {
          const rank = index + 1;
          const rankColorClass = rank <= 3 ? `rank-${rank}` : 'rank-normal';
          const views = formatViews(movie.viewCount);
          
          return (
            <Link to={`/phim/${movie.slug}`} key={movie.slug} className="ranking-card">
              <div className={`ranking-card__number ${rankColorClass}`}>
                {rank}
              </div>
              <div className="ranking-card__thumb">
                <img 
                  src={movie.thumb || movie.poster || '/placeholder-poster.svg'} 
                  alt={movie.title}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="ranking-card__info">
                <h4 className="ranking-card__title">{movie.title}</h4>
                <div className="ranking-card__meta">
                  {movie.year && <span>{movie.year}</span>}
                  {movie.quality && <span className="quality">{movie.quality}</span>}
                  {views && (
                    <span className="ranking-card__views">
                      <FiEye size={10} /> {views}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
