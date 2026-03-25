import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiPlay, FiBookmark } from 'react-icons/fi';
import './HeroBanner.css';

const AUTO_ROTATE_MS = 6000;

export default function HeroBanner({ movies = [], loading = false }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);
  const progressRef = useRef(null);

  const slides = movies.slice(0, 6);

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

  // Loading skeleton
  if (loading) {
    return (
      <div className="hero-banner hero-banner--loading">
        <div className="hero-banner__skeleton">
          <div className="skeleton" style={{ width: 140, height: 24, marginBottom: 12, borderRadius: 20 }} />
          <div className="skeleton" style={{ width: '50%', height: 48, marginBottom: 12 }} />
          <div className="skeleton" style={{ width: '35%', height: 16, marginBottom: 16 }} />
          <div className="skeleton" style={{ width: '40%', height: 14, marginBottom: 8 }} />
          <div className="skeleton" style={{ width: '35%', height: 14, marginBottom: 24 }} />
          <div style={{ display: 'flex', gap: 12 }}>
            <div className="skeleton" style={{ width: 160, height: 48, borderRadius: 9999 }} />
            <div className="skeleton" style={{ width: 140, height: 48, borderRadius: 9999 }} />
          </div>
        </div>
      </div>
    );
  }

  if (slides.length === 0) return null;

  return (
    <div className="hero-banner">
      {slides.map((movie, index) => {
        const bgImage = movie.thumb || movie.poster || '';
        const rawDesc = movie.content
          ? movie.content.replace(/<[^>]*>?/gm, '').substring(0, 180)
          : '';
        const desc = rawDesc || `Trải nghiệm thế giới Anime đầy kịch tính với siêu phẩm "${movie.title}". Chất lượng hình ảnh 4K sắc nét và đường truyền cực kỳ ổn định tại Anime-3D.`;

        return (
          <div
            key={movie.slug || index}
            className={`hero-banner__slide ${index === activeIndex ? 'hero-banner__slide--active' : ''}`}
          >
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

            {/* Content — left side */}
            <div className="hero-banner__content container">
              <div className="hero-banner__tag-row">
                <span className="hero-banner__tag">🔥 ANIME TRENDING</span>
                <div className="hero-banner__meta-line">
                  {movie.year && <span>{movie.year}</span>}
                  {movie.currentEpisode && <><span className="hero-banner__meta-dot">•</span><span>{movie.currentEpisode}</span></>}
                </div>
              </div>

              <h1 className="hero-banner__title">{movie.title}</h1>

              {desc && <p className="hero-banner__desc">{desc}</p>}

              <div className="hero-banner__actions">
                <Link to={`/phim/${movie.slug}`} className="hero-banner__btn-primary">
                  <FiPlay /> XEM NGAY
                </Link>
                <button className="hero-banner__btn-secondary">
                  <FiBookmark /> LƯU LẠI
                </button>
              </div>
            </div>
          </div>
        );
      })}

      {/* Thumbnail Navigation — bottom-right, vertical poster style */}
      {slides.length > 1 && (
        <>
          <div className="hero-banner__thumbs">
            {slides.map((movie, index) => (
              <button
                key={movie.slug || index}
                className={`hero-banner__thumb ${index === activeIndex ? 'hero-banner__thumb--active' : ''}`}
                onClick={() => goTo(index)}
                aria-label={`Xem ${movie.title}`}
              >
                <img
                  src={movie.poster || movie.thumb || '/placeholder-poster.svg'}
                  alt={movie.title}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              </button>
            ))}
          </div>

          {/* Progress indicators — horizontal below thumbnails */}
          <div className="hero-banner__indicators">
            {slides.map((_, index) => (
              <div
                key={index}
                className={`hero-banner__indicator ${index === activeIndex ? 'hero-banner__indicator--active' : ''}`}
              >
                <div
                  className="hero-banner__indicator-fill"
                  style={{
                    width: index === activeIndex ? `${progress}%` : index < activeIndex ? '100%' : '0%'
                  }}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
