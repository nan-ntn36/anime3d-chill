/**
 * MoviePlayer — Custom Video Player with HLS.js (Day 10-11)
 * Custom controls, keyboard shortcuts, theater mode, error states
 */

import { useRef, useState, useCallback, useEffect } from 'react';
import {
  FiPlay, FiPause, FiVolume2, FiVolumeX, FiVolume1,
  FiMaximize, FiMinimize, FiMonitor, FiAlertTriangle,
  FiRefreshCw,
} from 'react-icons/fi';
import usePlayer from '@/hooks/usePlayer';
import usePlayerStore from '@/store/playerStore';
import './MoviePlayer.css';

/**
 * Format seconds → "MM:SS" hoặc "HH:MM:SS"
 */
function formatTime(sec) {
  if (!sec || isNaN(sec) || !isFinite(sec)) return '0:00';
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/**
 * MoviePlayer Component
 * @param {{ m3u8Url: string, embedUrl?: string, startTime?: number, onEnded?: () => void, onProgress80?: () => void, onSwitchServer?: () => void }} props
 */
export default function MoviePlayer({ m3u8Url, embedUrl, startTime, onEnded, onProgress80, onSwitchServer }) {
  const containerRef = useRef(null);
  const progressRef = useRef(null);
  const hideTimerRef = useRef(null);

  const {
    videoRef, isReady, isPlaying, isBuffering, error,
    volume, isMuted,
    togglePlay, seek, toggleFullscreen, toggleMute,
    handleKeyDown, retry, changeVolume,
  } = usePlayer(m3u8Url, { startTime, onEnded, onProgress80 });

  const { currentTime, duration, isFullscreen, isTheaterMode, toggleTheaterMode } = usePlayerStore();
  const [controlsVisible, setControlsVisible] = useState(true);
  // Default to embed mode when embedUrl is available (m3u8 sources are often blocked)
  const [useEmbed, setUseEmbed] = useState(!!embedUrl);
  // Initialize from window global — if already elapsed > 10s, show error immediately
  const [loadError, setLoadError] = useState(() => {
    if (m3u8Url && window.__playerLoadUrl === m3u8Url && window.__playerLoadStart) {
      const elapsed = Date.now() - window.__playerLoadStart;
      if (elapsed >= 10000) return 'Tải nguồn phim quá lâu. Nguồn có thể không khả dụng.';
    }
    return null;
  });

  // ── Loading timeout — window-global (survives HMR remount) ──
  useEffect(() => {
    if (!m3u8Url) return;

    // Only reset timestamp if URL actually changed
    if (window.__playerLoadUrl !== m3u8Url) {
      window.__playerLoadStart = Date.now();
      window.__playerLoadUrl = m3u8Url;
      setLoadError(null);
    }

    const interval = setInterval(() => {
      // Only check if same URL is still loading
      if (window.__playerLoadUrl !== m3u8Url) {
        clearInterval(interval);
        return;
      }

      const elapsed = Date.now() - (window.__playerLoadStart || Date.now());
      const storeError = usePlayerStore.getState().error;
      const video = document.querySelector('.movie-player video');
      const videoReady = video && video.readyState >= 2;

      if (elapsed >= 10000 && !videoReady && !storeError) {
        // If we have embedUrl, switch to embed mode silently
        if (embedUrl) {
          setUseEmbed(true);
          setLoadError(null);
          clearInterval(interval);
        } else {
          setLoadError('Tải nguồn phim quá lâu. Nguồn có thể không khả dụng.');
          clearInterval(interval);
        }
      }
      if (videoReady || storeError) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [m3u8Url]); // eslint-disable-line react-hooks/exhaustive-deps

  // Clear loadError when isReady becomes true
  useEffect(() => {
    if (isReady) setLoadError(null);
  }, [isReady]);

  // Combine errors: hook error OR local timeout error
  const displayError = error || loadError;
  // Show loading: not ready, not errored
  const showLoading = !isReady && !displayError;

  // ── Auto-hide controls ────────────────────────────────
  const showControls = useCallback(() => {
    setControlsVisible(true);
    clearTimeout(hideTimerRef.current);
    if (isPlaying) {
      hideTimerRef.current = setTimeout(() => setControlsVisible(false), 3000);
    }
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying) {
      setControlsVisible(true);
      clearTimeout(hideTimerRef.current);
    } else {
      hideTimerRef.current = setTimeout(() => setControlsVisible(false), 3000);
    }
    return () => clearTimeout(hideTimerRef.current);
  }, [isPlaying]);

  // ── Register keyboard shortcuts ───────────────────────
  useEffect(() => {
    const handler = (e) => {
      // 'f' key → fullscreen
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen(containerRef);
        return;
      }
      // 't' key → theater mode
      if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        toggleTheaterMode();
        return;
      }
      handleKeyDown(e);
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleKeyDown, toggleFullscreen, toggleTheaterMode]);

  // ── Fullscreen change listener ────────────────────────
  useEffect(() => {
    const onFsChange = () => {
      usePlayerStore.getState().setFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  // ── Progress bar click ────────────────────────────────
  const handleProgressClick = useCallback(
    (e) => {
      const bar = progressRef.current;
      if (!bar || !duration) return;
      const rect = bar.getBoundingClientRect();
      const pct = (e.clientX - rect.left) / rect.width;
      seek(pct * duration);
    },
    [duration, seek]
  );

  // ── Volume icon ───────────────────────────────────────
  const VolumeIcon = isMuted || volume === 0 ? FiVolumeX : volume < 0.5 ? FiVolume1 : FiVolume2;
  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

  // ── Get buffered percentage ───────────────────────────
  const getBufferedPct = () => {
    const video = videoRef.current;
    if (!video || !video.buffered.length || !duration) return 0;
    return (video.buffered.end(video.buffered.length - 1) / duration) * 100;
  };

  const playerClass = [
    'movie-player',
    isTheaterMode && 'movie-player--theater',
    isFullscreen && 'movie-player--fullscreen',
  ].filter(Boolean).join(' ');

  // ── Embed mode: use iframe ────────────────────────────
  if (useEmbed && embedUrl) {
    return (
      <div ref={containerRef} className={playerClass}>
        <iframe
          src={embedUrl}
          className="movie-player__embed"
          width="100%"
          height="100%"
          frameBorder="0"
          allowFullScreen
          allow="autoplay; fullscreen; encrypted-media"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            border: 'none',
          }}
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={playerClass}
      onMouseMove={showControls}
      onMouseLeave={() => isPlaying && setControlsVisible(false)}
      tabIndex={0}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        playsInline
        onClick={togglePlay}
        aria-label="Video player"
      />

      {/* Buffering / Loading Spinner */}
      {(showLoading || isBuffering) && !displayError && (
        <div className="movie-player__buffering">
          <div className="spinner" />
        </div>
      )}

      {/* Center Play Button (when paused & ready & no error) */}
      {!isPlaying && !isBuffering && !displayError && isReady && (
        <button
          className="movie-player__center-play"
          onClick={togglePlay}
          aria-label="Phát video"
        >
          <FiPlay />
        </button>
      )}

      {/* Error Overlay */}
      {displayError && (
        <div className="movie-player__error">
          <FiAlertTriangle className="movie-player__error-icon" />
          <p className="movie-player__error-text">{displayError}</p>
          <div className="movie-player__error-actions">
            <button className="btn btn-primary btn-sm" onClick={retry}>
              <FiRefreshCw size={14} /> Thử lại
            </button>
            {onSwitchServer && (
              <button className="btn btn-secondary btn-sm" onClick={onSwitchServer}>
                Đổi server
              </button>
            )}
          </div>
        </div>
      )}

      {/* Controls Overlay */}
      <div className={`movie-player__controls ${controlsVisible ? 'movie-player__controls--visible' : ''}`}>
        {/* Progress Bar */}
        <div
          className="movie-player__progress"
          ref={progressRef}
          onClick={handleProgressClick}
          role="slider"
          aria-label="Video progress"
          aria-valuenow={Math.floor(currentTime)}
          aria-valuemin={0}
          aria-valuemax={Math.floor(duration)}
        >
          <div className="movie-player__progress-bar">
            <div
              className="movie-player__progress-buffered"
              style={{ width: `${getBufferedPct()}%` }}
            />
            <div
              className="movie-player__progress-filled"
              style={{ width: `${progressPct}%` }}
            >
              <div className="movie-player__progress-thumb" />
            </div>
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="movie-player__bottom">
          {/* Play/Pause */}
          <button
            className="movie-player__btn"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Tạm dừng' : 'Phát'}
          >
            {isPlaying ? <FiPause /> : <FiPlay />}
          </button>

          {/* Volume */}
          <div className="movie-player__volume-group">
            <button
              className="movie-player__btn"
              onClick={toggleMute}
              aria-label={isMuted ? 'Bật tiếng' : 'Tắt tiếng'}
            >
              <VolumeIcon />
            </button>
            <div className="movie-player__volume-slider">
              <input
                type="range"
                className="movie-player__volume-input"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  usePlayerStore.getState().setVolume(v);
                }}
                aria-label="Âm lượng"
              />
            </div>
          </div>

          {/* Time */}
          <span className="movie-player__time">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          {/* Spacer */}
          <div className="movie-player__spacer" />

          {/* Theater Mode */}
          <button
            className={`movie-player__btn ${isTheaterMode ? 'movie-player__btn--active' : ''}`}
            onClick={toggleTheaterMode}
            aria-label="Chế độ rạp"
            title="Chế độ rạp (T)"
          >
            <FiMonitor />
          </button>

          {/* Fullscreen */}
          <button
            className="movie-player__btn"
            onClick={() => toggleFullscreen(containerRef)}
            aria-label="Toàn màn hình"
            title="Toàn màn hình (F)"
          >
            {isFullscreen ? <FiMinimize /> : <FiMaximize />}
          </button>
        </div>
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div className="movie-player__shortcuts">
        Space: Phát · M: Mute · F: Fullscreen · T: Rạp · ←→: Tua
      </div>
    </div>
  );
}
