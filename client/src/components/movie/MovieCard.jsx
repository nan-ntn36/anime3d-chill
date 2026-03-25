import { Link } from 'react-router-dom';
import { FiPlay, FiHeart, FiStar, FiInfo } from 'react-icons/fi';
import './MovieCard.css';

export default function MovieCard({ movie }) {
  if (!movie) return null;

  const {
    slug,
    title,
    originalTitle,
    poster,
    thumb,
    year,
    quality,
    language,
    currentEpisode,
    genres = [],
    content,
  } = movie;

  const imageUrl = thumb || poster || '/placeholder-poster.svg';
  const posterUrl = poster || thumb || '/placeholder-poster.svg';
  const cleanDescription = content
    ? content.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...'
    : '';

  return (
    <div className="movie-card-container">
      <Link to={`/phim/${slug}`} className="movie-card" title={title}>
        {/* Poster Image */}
        <div className="movie-card__poster">
          <img
            src={imageUrl}
            alt={title}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={(e) => { e.target.src = '/placeholder-poster.svg'; }}
          />
          {year && <span className="movie-card__year-badge">{year}</span>}
        </div>

        {/* Static title */}
        <div className="movie-card__info">
          <h3 className="movie-card__title">{title}</h3>
          {originalTitle && originalTitle !== title && (
            <p className="movie-card__original">{originalTitle}</p>
          )}
        </div>

        {/* ── Hover Expand Panel (poster left + info right) ── */}
        <div className="movie-card__expand">
          <div className="expand__poster">
            <img
              src={posterUrl}
              alt={title}
              referrerPolicy="no-referrer"
              onError={(e) => { e.target.src = '/placeholder-poster.svg'; }}
            />
          </div>
          <div className="expand__info">
            <h3 className="expand__title">{title}</h3>
            {originalTitle && originalTitle !== title && (
              <p className="expand__original">{originalTitle}</p>
            )}

            <div className="expand__badges">
              <span className="expand-badge expand-badge--imdb">IMDB 8.9</span>
              <span className="expand-badge">{year || 2026}</span>
              <span className="expand-badge expand-badge--quality">{quality || '4K'}</span>
              <span className="expand-badge">{currentEpisode || 'Full'}</span>
            </div>

            {cleanDescription && (
              <p className="expand__desc">{cleanDescription}</p>
            )}

            <div className="expand__actions">
              <span className="expand__btn-play"><FiPlay /> XEM NGAY</span>
              <span className="expand__btn-circle"><FiHeart /></span>
              <span className="expand__btn-circle"><FiInfo /></span>
            </div>

            <div className="expand__footer">
              <span><FiStar style={{color: 'var(--color-accent)'}}/> 9.1</span>
              <span>•</span>
              <span>{year || 2026}</span>
              <span>•</span>
              <span>ANIME</span>
              <span>•</span>
              <span>{currentEpisode || 'Full'}</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
