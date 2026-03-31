/**
 * TrendingSection — Phim Thịnh Hành
 * Hiển thị top phim theo lượt xem (Day 17)
 * Premium design: fire-gradient ranks, view count badges, horizontal scroll
 */

import { Link } from 'react-router-dom';
import { FiTrendingUp, FiEye, FiPlay } from 'react-icons/fi';
import { useTrendingMovies } from '@/hooks/useMovies';
import './TrendingSection.css';

/**
 * Format view count: 1234 → "1.2K"
 */
function formatViews(count) {
  if (!count) return '0';
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

export default function TrendingSection() {
  const { data, isLoading, isFetching, isError } = useTrendingMovies();
  const movies = data?.items || [];

  // Không hiển thị nếu không có data (và không đang fetch)
  if (isError || (!isLoading && !isFetching && movies.length === 0)) return null;

  return (
    <section className="trending-section" id="trending-section">
      <div className="container">
        {/* Header */}
        <div className="trending-section__header">
          <h2 className="trending-section__title">
            <span className="trending-section__icon">
              <FiTrendingUp />
            </span>
            <span className="trending-section__title-text">PHIM THỊNH HÀNH</span>
          </h2>
          <span className="trending-section__badge">TOP 10</span>
        </div>

        {/* Grid */}
        {(isLoading || isFetching) ? (
          <div className="trending-section__grid">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="trending-card trending-card--skeleton">
                <div className="skeleton" style={{ width: '100%', height: '100%', borderRadius: 'var(--radius-lg)' }} />
              </div>
            ))}
          </div>
        ) : (
          <div className="trending-section__grid">
            {movies.map((movie, index) => (
              <Link
                to={`/phim/${movie.movieSlug}`}
                key={movie.movieSlug}
                className="trending-card"
                id={`trending-card-${index}`}
              >
                {/* Rank Number */}
                <div className={`trending-card__rank ${index < 3 ? `trending-card__rank--top${index + 1}` : ''}`}>
                  {index + 1}
                </div>

                {/* Poster */}
                <div className="trending-card__poster">
                  <img
                    src={movie.poster || movie.thumb || '/placeholder-poster.svg'}
                    alt={movie.title}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.target.src = '/placeholder-poster.svg';
                    }}
                  />
                  {/* Play overlay */}
                  <div className="trending-card__play-overlay">
                    <FiPlay />
                  </div>
                </div>

                {/* Info overlay */}
                <div className="trending-card__info">
                  <h3 className="trending-card__title">{movie.title}</h3>
                  <div className="trending-card__meta">
                    {movie.year && <span className="trending-card__year">{movie.year}</span>}
                    {movie.quality && <span className="trending-card__quality">{movie.quality}</span>}
                  </div>
                  <div className="trending-card__views">
                    <FiEye size={12} />
                    <span>{formatViews(movie.viewCount)} lượt xem</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
