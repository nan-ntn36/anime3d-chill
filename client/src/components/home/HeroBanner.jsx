/**
 * HeroBanner — Full-screen hero carousel (rophim-style)
 * Shows featured movies with poster background, metadata, and thumbnail nav
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiPlay, FiInfo } from 'react-icons/fi';
import { SkeletonCard } from '@components/ui/Skeleton';
import './HeroBanner.css';

const AUTO_ROTATE_MS = 6000;

export default function HeroBanner({ movies = [], loading = false }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);
  const progressRef = useRef(null);

  // Limit to first 8 movies
  const slides = movies.slice(0, 8);

  const goTo = useCallback((index) => {
    setActiveIndex(index);
    setProgress(0);
  }, []);

  // Auto-rotate
  useEffect(() => {
    if (slides.length <= 1) return;

    const startTime = Date.now();

    progressRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setProgress(Math.min((elapsed / AUTO_ROTATE_MS) * 100, 100));
    }, 50);

    timerRef.current = setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
      setProgress(0);
    }, AUTO_ROTATE_MS);

    return () => {
      clearTimeout(timerRef.current);
      clearInterval(progressRef.current);
    };
  }, [activeIndex, slides.length]);

  // Loading state
  if (loading) {
    return (
      <div className="hero-banner hero-banner--loading">
        <div className="hero-banner__skeleton-content">
          <div className="skeleton" style={{ width: '60%', height: 40, marginBottom: 12 }} />
          <div className="skeleton" style={{ width: '30%', height: 20, marginBottom: 16 }} />
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <div className="skeleton" style={{ width: 60, height: 28 }} />
            <div className="skeleton" style={{ width: 70, height: 28 }} />
            <div className="skeleton" style={{ width: 50, height: 28 }} />
          </div>
          <div className="skeleton" style={{ width: '50%', height: 14, marginBottom: 8 }} />
          <div className="skeleton" style={{ width: '40%', height: 14, marginBottom: 24 }} />
          <div className="skeleton" style={{ width: 160, height: 44, borderRadius: 9999 }} />
        </div>
      </div>
    );
  }

  if (slides.length === 0) return null;

  return (
    <div className="hero-banner">
      {slides.map((movie, index) => {
        const bgImage = movie.poster || movie.thumb || '';
        return (
          <div
            key={movie.slug || index}
            className={`hero-banner__slide ${index === activeIndex ? 'hero-banner__slide--active' : ''}`}
          >
            {/* Background */}
            {bgImage && (
              <img
                className="hero-banner__bg"
                src={bgImage}
                alt=""
                loading={index === 0 ? 'eager' : 'lazy'}
                referrerPolicy="no-referrer"
              />
            )}
            <div className="hero-banner__overlay" />

            {/* Content */}
            <div className="hero-banner__content">
              <h1 className="hero-banner__title">{movie.title}</h1>

              {movie.originName && (
                <p className="hero-banner__origin-name">{movie.originName}</p>
              )}

              {/* Badges */}
              <div className="hero-banner__badges">
                {movie.year && <span className="hero-banner__badge">{movie.year}</span>}
                {movie.quality && <span className="hero-banner__badge">{movie.quality}</span>}
                {movie.language && <span className="hero-banner__badge">{movie.language}</span>}
                {movie.currentEpisode && <span className="hero-banner__badge">{movie.currentEpisode}</span>}
              </div>

              {/* Genres */}
              {movie.genres?.length > 0 && (
                <div className="hero-banner__genres">
                  {movie.genres.slice(0, 4).map((genre) => {
                    const genreSlug = typeof genre === 'object' ? genre.slug : genre.toLowerCase().replace(/\s+/g, '-');
                    const genreName = typeof genre === 'object' ? genre.name : genre;
                    return (
                      <Link
                        key={genreSlug}
                        to={`/the-loai/${genreSlug}`}
                        className="hero-banner__genre"
                      >
                        {genreName}
                      </Link>
                    );
                  })}
                </div>
              )}

              {/* Description */}
              {movie.content && (
                <p
                  className="hero-banner__desc"
                  dangerouslySetInnerHTML={{
                    __html: movie.content.replace(/<[^>]*>/g, '').slice(0, 200),
                  }}
                />
              )}

              {/* Actions */}
              <div className="hero-banner__actions">
                <Link to={`/phim/${movie.slug}`} className="hero-banner__play-btn">
                  <FiPlay /> Xem Phim
                </Link>
                <Link to={`/phim/${movie.slug}`} className="hero-banner__icon-btn" title="Chi tiết">
                  <FiInfo />
                </Link>
              </div>
            </div>
          </div>
        );
      })}

      {/* Thumbnail nav */}
      {slides.length > 1 && (
        <div className="hero-banner__thumbs">
          {slides.map((movie, index) => (
            <button
              key={movie.slug || index}
              className={`hero-banner__thumb ${index === activeIndex ? 'hero-banner__thumb--active' : ''}`}
              onClick={() => goTo(index)}
              aria-label={`Xem ${movie.title}`}
            >
              <img
                src={movie.thumb || movie.poster || '/placeholder-poster.svg'}
                alt={movie.title}
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            </button>
          ))}
        </div>
      )}

      {/* Progress bar */}
      {slides.length > 1 && (
        <div className="hero-banner__progress">
          <div
            className="hero-banner__progress-bar"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
