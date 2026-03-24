/**
 * GenreCards — "Bạn đang quan tâm gì?" section
 * Horizontal scroll of genre cards with gradient backgrounds
 */

import { Link } from 'react-router-dom';
import './GenreCards.css';

const GENRES = [
  { name: 'Hành Động', slug: 'hanh-dong' },
  { name: 'Kinh Dị', slug: 'kinh-di' },
  { name: 'Tình Cảm', slug: 'tinh-cam' },
  { name: 'Hoạt Hình', slug: 'hoat-hinh' },
  { name: 'Viễn Tưởng', slug: 'vien-tuong' },
];

const TOTAL_GENRES = 20; // approximate total genres available

export default function GenreCards() {
  const remaining = TOTAL_GENRES - GENRES.length;

  return (
    <section className="genre-cards container">
      <h2 className="genre-cards__title">Bạn đang quan tâm gì?</h2>
      <div className="genre-cards__grid">
        {GENRES.map((genre) => (
          <Link
            key={genre.slug}
            to={`/the-loai/${genre.slug}`}
            className="genre-cards__card"
          >
            <span className="genre-cards__card-name">{genre.name}</span>
            <span className="genre-cards__card-link">Xem chủ đề &gt;</span>
          </Link>
        ))}
        <Link to="/the-loai" className="genre-cards__card genre-cards__card--more">
          <span className="genre-cards__more-text">+{remaining} chủ đề</span>
        </Link>
      </div>
    </section>
  );
}
