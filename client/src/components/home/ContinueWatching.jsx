/**
 * ContinueWatching — "Đang Xem" section on homepage
 * Shows recently watched movies from localStorage
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlay, FiClock, FiTrash2 } from 'react-icons/fi';
import './ContinueWatching.css';

const PROGRESS_KEY = 'anime3d_watch_progress';

/**
 * Format seconds → mm:ss or hh:mm:ss
 */
function formatTime(seconds) {
  if (!seconds || seconds <= 0) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function readProgress() {
  try {
    const data = localStorage.getItem(PROGRESS_KEY);
    if (!data) return [];
    const map = JSON.parse(data);
    return Object.values(map)
      .filter((item) => item.movieSlug && item.episode)
      .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
      .slice(0, 12);
  } catch {
    return [];
  }
}

export default function ContinueWatching() {
  const [items, setItems] = useState(() => readProgress());

  // Re-read on mount (handles React StrictMode double-render)
  useEffect(() => {
    setItems(readProgress());
  }, []);

  const handleRemove = (movieSlug, episode) => {
    try {
      const data = localStorage.getItem(PROGRESS_KEY);
      if (!data) return;
      const map = JSON.parse(data);
      const key = `${movieSlug}:${episode}`;
      delete map[key];
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(map));
      setItems(readProgress());
    } catch {
      // ignore
    }
  };

  if (items.length === 0) return null;


  return (
    <section className="cw-section">
      <div className="container">
        <div className="cw-header">
          <h2 className="cw-title">
            <FiClock className="cw-title__icon" />
            Đang Xem
          </h2>
        </div>

          <div className="cw-grid">
            {items.map((item) => {
              const hasDuration = item.duration > 0;
              const percent = hasDuration
                ? Math.min(Math.round((item.currentTime / item.duration) * 100), 100)
                : 0;
              const remaining = hasDuration ? item.duration - item.currentTime : 0;

              return (
                <div key={`${item.movieSlug}:${item.episode}`} className="cw-card">
                  <Link
                    to={`/phim/${item.movieSlug}/xem?tap=${item.episode}`}
                    className="cw-card__thumb"
                  >
                    {item.movieThumb && typeof item.movieThumb === 'string' && (
                      <img src={item.movieThumb} alt={typeof item.movieName === 'string' ? item.movieName : 'movie'} loading="lazy" />
                    )}
                    <div className="cw-card__overlay">
                      <FiPlay className="cw-card__play-icon" />
                      {Number(item.currentTime) > 0 && (
                        <span className="cw-card__time">
                          Xem tiếp từ {formatTime(Number(item.currentTime))}
                        </span>
                      )}
                    </div>
                    {hasDuration && (
                      <div className="cw-card__progress">
                        <div
                          className="cw-card__progress-fill"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    )}
                  </Link>

                  <div className="cw-card__info">
                    <Link to={`/phim/${item.movieSlug}/xem?tap=${item.episode}`} className="cw-card__title">
                      {String(item.movieName)}
                    </Link>
                    <div className="cw-card__meta">
                      <span className="cw-card__episode">{String(item.episode)}</span>
                      {hasDuration && (
                        <span className="cw-card__remaining">Còn {formatTime(Number(remaining))}</span>
                      )}
                    </div>
                  </div>

                  <button
                    className="cw-card__remove"
                    onClick={() => handleRemove(item.movieSlug, item.episode)}
                    title="Xóa khỏi danh sách"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>
  );
}
