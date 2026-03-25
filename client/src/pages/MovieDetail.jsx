/**
 * MovieDetail — Trang chi tiết phim (Day 9)
 * Hero backdrop, info panel, episodes grid, favorite toggle, SEO
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  FiPlay,
  FiHeart,
  FiCalendar,
  FiGlobe,
  FiClock,
  FiFilm,
  FiGrid,
  FiList,
  FiExternalLink,
  FiAlertCircle,
  FiArrowLeft,
} from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useMovieDetail } from '@/hooks/useMovies';
import { useFavoriteToggle } from '@/hooks/useMovies';
import useAuthStore from '@/store/authStore';
import './MovieDetail.css';

/**
 * Skeleton loading hiển thị khi đang fetch data
 */
function MovieDetailSkeleton() {
  return (
    <div className="movie-detail-skeleton">
      <div className="movie-detail-skeleton__hero">
        <div className="movie-detail-skeleton__poster skeleton" />
        <div className="movie-detail-skeleton__info">
          <div className="movie-detail-skeleton__line movie-detail-skeleton__line--short skeleton" />
          <div className="movie-detail-skeleton__line movie-detail-skeleton__line--title skeleton" />
          <div className="movie-detail-skeleton__line movie-detail-skeleton__line--medium skeleton" />
          <div className="movie-detail-skeleton__line skeleton" />
          <div className="movie-detail-skeleton__line movie-detail-skeleton__line--short skeleton" />
        </div>
      </div>
    </div>
  );
}

/**
 * Error fallback khi load thất bại
 */
function MovieDetailError({ error, onRetry }) {
  return (
    <div className="movie-detail__error">
      <FiAlertCircle className="movie-detail__error-icon" />
      <h2>Không thể tải phim</h2>
      <p>{error?.message || 'Đã có lỗi xảy ra khi tải thông tin phim. Vui lòng thử lại.'}</p>
      <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
        <button className="btn btn-primary" onClick={onRetry}>
          Thử lại
        </button>
        <Link to="/" className="btn btn-secondary">
          <FiArrowLeft /> Về trang chủ
        </Link>
      </div>
    </div>
  );
}

/**
 * Strip HTML tags from description
 */
function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').trim();
}

/**
 * MovieDetail Page — Main Component
 */
export default function MovieDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  // ── Data fetching ──────────────────────────────────────
  const { data: movie, isLoading, isError, error, refetch } = useMovieDetail(slug);
  const { toggle: toggleFavorite, isFavorited, isPending: favPending } = useFavoriteToggle(movie);

  // ── Local state ────────────────────────────────────────
  const [selectedServer, setSelectedServer] = useState(0);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [descExpanded, setDescExpanded] = useState(false);
  const [selectedEp, setSelectedEp] = useState(null);

  // ── Derived data ───────────────────────────────────────
  const episodes = useMemo(() => movie?.episodes || [], [movie]);
  const currentServer = episodes[selectedServer] || null;
  const currentEpisodes = currentServer?.items || [];
  const description = useMemo(() => stripHtml(movie?.description), [movie]);

  // ── Prefetch m3u8 URL tập 1 ────────────────────────────
  useEffect(() => {
    if (currentEpisodes.length > 0 && currentEpisodes[0]?.m3u8Url) {
      // Prefetch tập 1 m3u8 bằng <link rel="prefetch">
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = currentEpisodes[0].m3u8Url;
      link.as = 'fetch';
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
      return () => {
        document.head.removeChild(link);
      };
    }
  }, [currentEpisodes]);

  // ── Handlers ───────────────────────────────────────────
  const handlePlayFirst = useCallback(() => {
    if (currentEpisodes.length > 0) {
      const ep = currentEpisodes[0];
      // Navigate to player page (will be built Day 10-11)
      navigate(`/phim/${slug}/xem?tap=${ep.slug || '1'}&sv=${selectedServer}`);
    }
  }, [currentEpisodes, slug, selectedServer, navigate]);

  const handleEpisodeClick = useCallback(
    (ep) => {
      setSelectedEp(ep.slug);
      navigate(`/phim/${slug}/xem?tap=${ep.slug}&sv=${selectedServer}`);
    },
    [slug, selectedServer, navigate]
  );

  const handleFavoriteClick = useCallback(() => {
    if (!isAuthenticated) {
      toast('Vui lòng đăng nhập để thêm yêu thích', { icon: '🔒' });
      return;
    }
    toggleFavorite();
  }, [isAuthenticated, toggleFavorite]);

  // ── Loading state ──────────────────────────────────────
  if (isLoading) return <MovieDetailSkeleton />;

  // ── Error state ────────────────────────────────────────
  if (isError || !movie) {
    return <MovieDetailError error={error} onRetry={refetch} />;
  }

  // ── SEO data ───────────────────────────────────────────
  const seoTitle = `${movie.title}${movie.year ? ` (${movie.year})` : ''} — Anime3D-Chill`;
  const seoDesc = description
    ? description.slice(0, 160)
    : `Xem phim ${movie.title} vietsub chất lượng ${movie.quality || 'HD'} tại Anime3D-Chill`;
  const seoImage = movie.poster || movie.thumb;

  return (
    <>
      {/* ── SEO ──────────────────────────────────────────── */}
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDesc} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDesc} />
        {seoImage && <meta property="og:image" content={seoImage} />}
        <meta property="og:type" content="video.movie" />
        <link rel="canonical" href={`${window.location.origin}/phim/${slug}`} />
      </Helmet>

      <article className="movie-detail">
        {/* ── Hero Section ───────────────────────────────── */}
        <section className="movie-detail__hero">
          {/* Backdrop */}
          <div className="movie-detail__backdrop">
            <img
              src={movie.thumb || movie.poster}
              alt=""
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>

          {/* Hero Content */}
          <div className="movie-detail__hero-content">
            {/* Poster */}
            <div className="movie-detail__poster">
              <img
                src={movie.poster || movie.thumb || '/placeholder-poster.svg'}
                alt={movie.title}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.target.src = '/placeholder-poster.svg';
                }}
              />
            </div>

            {/* Info */}
            <div className="movie-detail__info">
              {/* Badges */}
              <div className="movie-detail__badges">
                {movie.quality && (
                  <span className="movie-detail__badge movie-detail__badge--quality">
                    {movie.quality}
                  </span>
                )}
                {movie.language && (
                  <span className="movie-detail__badge movie-detail__badge--lang">
                    {movie.language}
                  </span>
                )}
                {movie.currentEpisode && (
                  <span className="movie-detail__badge movie-detail__badge--status">
                    {movie.currentEpisode}
                  </span>
                )}
                {movie.year && (
                  <span className="movie-detail__badge movie-detail__badge--year">
                    {movie.year}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="movie-detail__title">{movie.title}</h1>
              {movie.originalTitle && movie.originalTitle !== movie.title && (
                <p className="movie-detail__original-title">{movie.originalTitle}</p>
              )}

              {/* Meta */}
              <div className="movie-detail__meta">
                {movie.year && (
                  <>
                    <span className="movie-detail__meta-item">
                      <FiCalendar size={14} /> {movie.year}
                    </span>
                    <span className="movie-detail__meta-divider" />
                  </>
                )}
                {movie.duration && (
                  <>
                    <span className="movie-detail__meta-item">
                      <FiClock size={14} /> {movie.duration}
                    </span>
                    <span className="movie-detail__meta-divider" />
                  </>
                )}
                {movie.totalEpisodes > 0 && (
                  <>
                    <span className="movie-detail__meta-item">
                      <FiFilm size={14} /> {movie.totalEpisodes} tập
                    </span>
                    <span className="movie-detail__meta-divider" />
                  </>
                )}
                {movie.country?.length > 0 && (
                  <span className="movie-detail__meta-item">
                    <FiGlobe size={14} /> {movie.country.join(', ')}
                  </span>
                )}
              </div>

              {/* Genre Tags */}
              {movie.genres?.length > 0 && (
                <div className="movie-detail__tags">
                  {movie.genres.map((genre) => (
                    <span key={genre} className="movie-detail__tag">
                      {genre}
                    </span>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="movie-detail__actions">
                {currentEpisodes.length > 0 && (
                  <button
                    className="movie-detail__btn-play"
                    onClick={handlePlayFirst}
                    id="btn-play-movie"
                  >
                    <FiPlay /> Xem Phim
                  </button>
                )}

                <button
                  className={`movie-detail__btn-fav ${isFavorited ? 'movie-detail__btn-fav--active' : ''}`}
                  onClick={handleFavoriteClick}
                  disabled={favPending}
                  id="btn-toggle-favorite"
                >
                  {isFavorited ? <FaHeart /> : <FiHeart />}
                  {isFavorited ? 'Đã thích' : 'Yêu thích'}
                </button>

                {movie.trailerUrl && (
                  <a
                    href={movie.trailerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="movie-detail__btn-trailer"
                  >
                    <FiExternalLink /> Trailer
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── Body Section ───────────────────────────────── */}
        <div className="movie-detail__body">
          {/* Left Column: Description + Cast */}
          <div className="movie-detail__description">
            <h2 className="movie-detail__section-title">Nội Dung Phim</h2>
            {description ? (
              <>
                <div
                  className={`movie-detail__desc-text ${!descExpanded ? 'movie-detail__desc-text--truncated' : ''}`}
                  dangerouslySetInnerHTML={{ __html: movie.description }}
                />
                {description.length > 300 && (
                  <button
                    className="movie-detail__desc-toggle"
                    onClick={() => setDescExpanded(!descExpanded)}
                  >
                    {descExpanded ? '← Thu gọn' : 'Xem thêm →'}
                  </button>
                )}
              </>
            ) : (
              <p className="movie-detail__desc-text">Chưa có mô tả cho phim này.</p>
            )}

            {/* Directors */}
            {movie.directors?.length > 0 && (
              <div className="movie-detail__cast">
                <p className="movie-detail__cast-label">Đạo diễn</p>
                <div className="movie-detail__cast-list">
                  {movie.directors.map((d) => (
                    <span key={d} className="movie-detail__cast-item">
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Actors */}
            {movie.actors?.length > 0 && (
              <div className="movie-detail__cast">
                <p className="movie-detail__cast-label">Diễn viên</p>
                <div className="movie-detail__cast-list">
                  {movie.actors.map((a) => (
                    <span key={a} className="movie-detail__cast-item">
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Episodes */}
          <aside className="movie-detail__sidebar">
            <div className="movie-detail__episodes-panel">
              {/* Header + Server Selector */}
              <div className="movie-detail__episodes-header">
                <h3 className="movie-detail__episodes-title">Danh Sách Tập</h3>
                {episodes.length > 1 && (
                  <select
                    className="movie-detail__server-select"
                    value={selectedServer}
                    onChange={(e) => setSelectedServer(Number(e.target.value))}
                    id="select-server"
                  >
                    {episodes.map((server, idx) => (
                      <option key={idx} value={idx}>
                        {server.serverName}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* View Toggle */}
              <div className="movie-detail__view-toggle">
                <button
                  className={`movie-detail__view-btn ${viewMode === 'grid' ? 'movie-detail__view-btn--active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  title="Xem dạng lưới"
                >
                  <FiGrid />
                </button>
                <button
                  className={`movie-detail__view-btn ${viewMode === 'list' ? 'movie-detail__view-btn--active' : ''}`}
                  onClick={() => setViewMode('list')}
                  title="Xem dạng danh sách"
                >
                  <FiList />
                </button>
              </div>

              {/* Episode List */}
              <div className="movie-detail__episodes-list">
                {currentEpisodes.length > 0 ? (
                  viewMode === 'grid' ? (
                    <div className="movie-detail__episodes-grid">
                      {currentEpisodes.map((ep) => (
                        <button
                          key={ep.slug}
                          className={`movie-detail__ep-btn ${selectedEp === ep.slug ? 'movie-detail__ep-btn--active' : ''}`}
                          onClick={() => handleEpisodeClick(ep)}
                          title={ep.name}
                        >
                          {ep.name}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="movie-detail__episodes-column">
                      {currentEpisodes.map((ep) => (
                        <button
                          key={ep.slug}
                          className={`movie-detail__ep-btn movie-detail__ep-btn--list ${selectedEp === ep.slug ? 'movie-detail__ep-btn--active' : ''}`}
                          onClick={() => handleEpisodeClick(ep)}
                        >
                          <FiPlay size={12} />
                          <span className="movie-detail__ep-name">{ep.name}</span>
                        </button>
                      ))}
                    </div>
                  )
                ) : (
                  <div className="movie-detail__no-episodes">
                    Chưa có tập phim nào
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </article>
    </>
  );
}
