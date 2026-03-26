/**
 * GenreCards — "Bạn đang quan tâm gì?" section
 * Lấy data từ API thay vì hardcode
 */

import { Link } from 'react-router-dom';
import { useGenres } from '@/hooks/useMovies';
import './GenreCards.css';

const MAX_DISPLAY = 5;

export default function GenreCards() {
  const { data: genres = [], isLoading } = useGenres();

  // Hiển thị tối đa 5 thể loại + 1 card "xem thêm"
  const displayGenres = genres.slice(0, MAX_DISPLAY);
  const remaining = genres.length - MAX_DISPLAY;

  if (isLoading) {
    return (
      <section className="genre-cards container">
        <h2 className="genre-cards__title">Bạn đang quan tâm gì?</h2>
        <div className="genre-cards__grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="genre-cards__card skeleton" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="genre-cards container">
      <h2 className="genre-cards__title">Bạn đang quan tâm gì?</h2>
      <div className="genre-cards__grid">
        {displayGenres.map((genre) => (
          <Link
            key={genre.slug}
            to={`/the-loai/${genre.slug}`}
            className="genre-cards__card"
          >
            {genre.thumb && (
              <img
                src={genre.thumb}
                alt={genre.name}
                className="genre-cards__card-thumb"
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            )}
            <div className="genre-cards__card-overlay" />
            <span className="genre-cards__card-name">{genre.name}</span>
            <span className="genre-cards__card-link">Xem chủ đề &gt;</span>
          </Link>
        ))}
        {remaining > 0 && (
          <Link to="/the-loai" className="genre-cards__card genre-cards__card--more">
            <span className="genre-cards__more-text">+{remaining} chủ đề</span>
          </Link>
        )}
      </div>
    </section>
  );
}
