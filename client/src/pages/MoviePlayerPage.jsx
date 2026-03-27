/**
 * MoviePlayerPage — Trang xem phim (Day 10-11)
 * Page wrapper: player + episode sidebar + movie info
 */

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiMonitor, FiChevronRight, FiPlay, FiRotateCcw } from 'react-icons/fi';
import { useMovieDetail } from '@/hooks/useMovies';
import usePlayerStore from '@/store/playerStore';
import MoviePlayer from '@/components/movie/MoviePlayer';
import PlayerErrorBoundary from '@/components/movie/PlayerErrorBoundary';
import CommentSection from '@/components/movie/CommentSection';
import RankingSidebar from '@/components/home/RankingSidebar';
import { saveProgress, getProgress, saveWatchVisit } from '@/services/watchProgressService';

/**
 * Strip HTML tags
 */
function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').trim();
}

function formatSeconds(s) {
  if (!s) return '0:00';
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

export default function MoviePlayerPage() {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const tapParam = searchParams.get('tap') || '';
  const svParam = parseInt(searchParams.get('sv') || '0', 10);

  // ── Data ───────────────────────────────────────────────
  const { data: movie, isLoading, isError } = useMovieDetail(slug);
  const { isTheaterMode, toggleTheaterMode, resetPlayer } = usePlayerStore();

  const [selectedServer, setSelectedServer] = useState(svParam);

  // ── Cleanup on unmount ─────────────────────────────────
  useEffect(() => {
    return () => resetPlayer();
  }, [resetPlayer]);

  // ── Derived data ───────────────────────────────────────
  const episodes = useMemo(() => movie?.episodes || [], [movie]);
  const currentServer = episodes[selectedServer] || episodes[0] || null;
  const currentEpisodes = currentServer?.items || [];

  // Find current episode
  const currentEp = useMemo(() => {
    if (!currentEpisodes.length) return null;
    const found = currentEpisodes.find((ep) => ep.slug === tapParam);
    return found || currentEpisodes[0];
  }, [currentEpisodes, tapParam]);

  // m3u8 URL and embed URL for current episode
  const m3u8Url = currentEp?.m3u8Url || '';
  const embedUrl = currentEp?.embedUrl || '';

  // ── Watch Progress ───────────────────────────────────────
  const { currentTime, duration } = usePlayerStore();
  const lastSavedTime = useRef(0);

  // Resume prompt state
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [resumeFrom, setResumeFrom] = useState(0);
  const [userStartTime, setUserStartTime] = useState(0);

  // Lấy startTime khi load phim — show resume prompt if > 60s
  const startTime = useMemo(() => {
    if (!movie || !currentEp) return 0;
    const progress = getProgress(movie.slug, currentEp.slug);
    const savedTime = progress?.currentTime || 0;
    const savedDuration = progress?.duration || 0;
    // Show prompt if saved progress > 60s and not near the end
    if (savedTime > 60 && savedDuration > 0 && (savedDuration - savedTime) > 30) {
      setResumeFrom(savedTime);
      setShowResumePrompt(true);
      return 0; // don't auto-resume, wait for user choice
    }
    return savedTime;
  }, [movie, currentEp]);

  // Lưu tiến độ định kỳ (Mỗi 15s hoặc khi gần hết video) — chỉ hoạt động với m3u8 mode
  useEffect(() => {
    if (!movie || !currentEp) return;
    
    // Lưu khi currentTime chênh lệch so với lần cuối lưu lớn hơn 15s hoặc video sắp hết.
    if (Math.abs(currentTime - lastSavedTime.current) >= 15 || (duration > 0 && duration - currentTime < 2)) {
      saveProgress({
        movieSlug: movie.slug,
        movieName: movie.title,
        movieThumb: movie.thumb || movie.poster,
        episode: currentEp.slug,
        serverName: currentServer?.serverName || 'V.I.P',
        currentTime,
        duration,
      });
      lastSavedTime.current = currentTime;
    }
  }, [currentTime, duration, movie, currentEp, currentServer]);

  // Lưu lịch sử xem khi mở tập (hoạt động cho cả embed lẫn m3u8)
  useEffect(() => {
    if (!movie || !currentEp) return;
    saveWatchVisit({
      movieSlug: movie.slug,
      movieName: movie.title,
      movieThumb: movie.thumb || movie.poster,
      episode: currentEp.slug,
      serverName: currentServer?.serverName || 'V.I.P',
    });
  }, [movie?.slug, currentEp?.slug]); // eslint-disable-line react-hooks/exhaustive-deps

  // Lưu tiến độ lần cuối khi đổi tập hoặc thoát trang
  useEffect(() => {
    return () => {
      const state = usePlayerStore.getState();
      if (movie && currentEp && state.currentTime > 30) {
        saveProgress({
          movieSlug: movie.slug,
          movieName: movie.title,
          movieThumb: movie.thumb || movie.poster,
          episode: currentEp.slug,
          serverName: currentServer?.serverName || 'V.I.P',
          currentTime: state.currentTime,
          duration: state.duration,
        });
      }
    };
  }, [movie, currentEp, currentServer]);

  // ── Episode navigation ─────────────────────────────────
  const currentEpIndex = currentEpisodes.findIndex((ep) => ep.slug === currentEp?.slug);

  const nextEp = currentEpIndex >= 0 && currentEpIndex < currentEpisodes.length - 1
    ? currentEpisodes[currentEpIndex + 1]
    : null;

  const handleEpisodeClick = useCallback(
    (ep) => {
      setSearchParams({ tap: ep.slug, sv: String(selectedServer) });
    },
    [selectedServer, setSearchParams]
  );

  const handleNextEpisode = useCallback(() => {
    if (nextEp) {
      handleEpisodeClick(nextEp);
    }
  }, [nextEp, handleEpisodeClick]);

  const handleSwitchServer = useCallback(() => {
    if (episodes.length > 1) {
      const next = (selectedServer + 1) % episodes.length;
      setSelectedServer(next);
      setSearchParams({ tap: currentEp?.slug || '', sv: String(next) });
    }
  }, [episodes.length, selectedServer, currentEp, setSearchParams]);

  // ── Preload next episode ───────────────────────────────
  const handleProgress80 = useCallback(() => {
    if (nextEp?.m3u8Url) {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = nextEp.m3u8Url;
      link.as = 'fetch';
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    }
  }, [nextEp]);

  // ── Loading state ──────────────────────────────────────
  if (isLoading) {
    return (
      <div className="page-loading">
        <div className="spinner" />
      </div>
    );
  }

  if (isError || !movie) {
    return (
      <div className="movie-detail__error" style={{ minHeight: '60vh' }}>
        <h2>Không thể tải phim</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>Vui lòng thử lại sau.</p>
        <Link to="/" className="btn btn-primary">Về trang chủ</Link>
      </div>
    );
  }

  // ── SEO ────────────────────────────────────────────────
  const epName = currentEp?.name || '';
  const seoTitle = `${movie.title} - ${epName} — Anime3D-Chill`;
  const seoDesc = `Xem ${movie.title} ${epName} vietsub ${movie.quality || 'HD'} tại Anime3D-Chill`;

  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDesc} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDesc} />
        {movie.poster && <meta property="og:image" content={movie.poster} />}
      </Helmet>

      <div className={`player-page ${isTheaterMode ? 'player-page--theater' : ''}`}>
        {/* ── Resume Prompt ──────────────────────────── */}
        {showResumePrompt && (
          <div className="resume-prompt">
            <div className="resume-prompt__content">
              <span className="resume-prompt__text">
                Bạn đã xem đến {formatSeconds(resumeFrom)} — Xem tiếp?
              </span>
              <div className="resume-prompt__actions">
                <button
                  className="btn btn-primary resume-prompt__btn"
                  onClick={() => {
                    setUserStartTime(resumeFrom);
                    setShowResumePrompt(false);
                  }}
                >
                  <FiPlay size={14} /> Xem tiếp
                </button>
                <button
                  className="btn btn-outline resume-prompt__btn"
                  onClick={() => {
                    setUserStartTime(0);
                    setShowResumePrompt(false);
                  }}
                >
                  <FiRotateCcw size={14} /> Xem từ đầu
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Player Section ───────────────────────────── */}
        <div className="player-page__main">
          <PlayerErrorBoundary>
            <MoviePlayer
              m3u8Url={m3u8Url}
              embedUrl={embedUrl}
              startTime={showResumePrompt ? 0 : (userStartTime || startTime)}
              onEnded={handleNextEpisode}
              onProgress80={handleProgress80}
              onSwitchServer={episodes.length > 1 ? handleSwitchServer : undefined}
            />
          </PlayerErrorBoundary>

          {/* Info Bar */}
          <div className="player-page__info-bar">
            <div className="player-page__breadcrumb">
              <Link to="/">Trang chủ</Link>
              <FiChevronRight className="player-page__breadcrumb-sep" size={14} />
              <Link to={`/phim/${slug}`}>{movie.title}</Link>
              <FiChevronRight className="player-page__breadcrumb-sep" size={14} />
              <span className="player-page__current-ep">{epName}</span>
            </div>
            <button
              className={`player-page__theater-toggle ${isTheaterMode ? 'player-page__theater-toggle--active' : ''}`}
              onClick={toggleTheaterMode}
            >
              <FiMonitor size={14} />
              {isTheaterMode ? 'Thoát rạp' : 'Chế độ rạp'}
            </button>
          </div>
        </div>

        {/* ── Content Below Player ─────────────────────── */}
        <div className="player-page__content">
          {/* Movie Info */}
          <div className="player-page__movie-info">
            <h2>{movie.title}</h2>
            {movie.genres?.length > 0 && (
              <div className="player-page__tags">
                {movie.genres.map((g) => (
                  <span key={g} className="player-page__tag">{g}</span>
                ))}
              </div>
            )}
            {movie.description && (
              <p className="player-page__desc">{stripHtml(movie.description).slice(0, 300)}...</p>
            )}
          </div>

          {/* Episode Sidebar */}
          <aside className="player-page__episodes">
            <div className="player-page__episodes-header">
              <h3 className="player-page__episodes-title">Danh Sách Tập</h3>
              {episodes.length > 1 && (
                <select
                  className="player-page__server-select"
                  value={selectedServer}
                  onChange={(e) => {
                    const sv = Number(e.target.value);
                    setSelectedServer(sv);
                    setSearchParams({ tap: currentEp?.slug || '', sv: String(sv) });
                  }}
                >
                  {episodes.map((server, idx) => (
                    <option key={idx} value={idx}>
                      {server.serverName}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="player-page__episodes-list">
              {currentEpisodes.map((ep) => (
                <button
                  key={ep.slug}
                  className={`player-page__ep-btn ${currentEp?.slug === ep.slug ? 'player-page__ep-btn--active' : ''}`}
                  onClick={() => handleEpisodeClick(ep)}
                  title={ep.name}
                >
                  {ep.name}
                </button>
              ))}
            </div>

            <div style={{ marginTop: 'var(--space-6)' }}>
              <RankingSidebar title="BXH TUẦN" />
            </div>
          </aside>
        </div>
        
        {/* Comments Section */}
        <div className="player-page__comments" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 var(--space-4)', width: '100%' }}>
          <CommentSection />
        </div>
      </div>
    </>
  );
}
