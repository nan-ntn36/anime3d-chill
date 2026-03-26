/**
 * TopicCard — Card component cho thể loại / quốc gia
 * Hiển thị thumbnail ảnh đại diện + tên + link
 */

import { Link } from 'react-router-dom';
import './TopicCard.css';

/**
 * @param {{ name: string, slug: string, type: 'genre'|'country', thumb: string|null }} props
 */
export default function TopicCard({ name, slug, type = 'genre', thumb }) {
  const basePath = type === 'genre' ? '/the-loai' : '/quoc-gia';

  return (
    <Link
      to={`${basePath}/${slug}`}
      className="topic-card"
    >
      {/* Background thumbnail */}
      {thumb && (
        <img
          src={thumb}
          alt={name}
          className="topic-card__thumb"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      )}
      <div className="topic-card__overlay" />
      <span className="topic-card__name">{name}</span>
      <span className="topic-card__link">Xem chủ đề &gt;</span>
    </Link>
  );
}
