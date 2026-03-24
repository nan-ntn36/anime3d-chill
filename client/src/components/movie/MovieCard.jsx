/**
 * MovieCard — Card hiển thị 1 phim
 * Poster, title, year, quality badge, hover effect
 */

import { Link } from 'react-router-dom';
import './MovieCard.css';

export default function MovieCard({ movie }) {
  if (!movie) return null;

  const {
    slug,
    title,
    poster,
    thumb,
    year,
    quality,
    language,
    currentEpisode,
    genres = [],
  } = movie;

  const imageUrl = thumb || poster || '/placeholder-poster.svg';

  return (
    <Link to={`/phim/${slug}`} className="movie-card" title={title}>
      <div className="movie-card__poster">
        <img
          src={imageUrl}
          alt={title}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(e) => {
            e.target.src = '/placeholder-poster.svg';
          }}
        />
        <div className="movie-card__overlay">
          <span className="movie-card__play">▶</span>
        </div>

        {/* Badges */}
        <div className="movie-card__badges">
          {quality && <span className="movie-card__badge movie-card__badge--quality">{quality}</span>}
          {language && <span className="movie-card__badge movie-card__badge--lang">{language}</span>}
        </div>

        {currentEpisode && (
          <span className="movie-card__episode">{currentEpisode}</span>
        )}
      </div>

      <div className="movie-card__info">
        <h3 className="movie-card__title">{title}</h3>
        <div className="movie-card__meta">
          {year && <span>{year}</span>}
          {genres.length > 0 && <span>{genres[0]}</span>}
        </div>
      </div>
    </Link>
  );
}
