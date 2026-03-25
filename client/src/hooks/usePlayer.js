/**
 * usePlayer Hook — Day 10-11
 * Quản lý HLS.js instance, video events, keyboard shortcuts
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import Hls from 'hls.js';
import usePlayerStore from '@/store/playerStore';

/**
 * @param {string} m3u8Url - URL m3u8 để phát
 * @param {{ onEnded?: () => void, onProgress80?: () => void }} options
 */
export default function usePlayer(m3u8Url, options = {}) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const progressFiredRef = useRef(false);
  const isReadyRef = useRef(false);

  const {
    isPlaying, volume, isMuted, isBuffering, error,
    setPlaying, setCurrentTime, setDuration,
    setVolume, toggleMute, setBuffering, setError,
    setFullscreen, loadSavedVolume,
  } = usePlayerStore();

  const [isReady, setIsReady] = useState(false);

  // ── Load saved volume on mount ────────────────────────
  useEffect(() => {
    loadSavedVolume();
  }, [loadSavedVolume]);

  // ── Initialize HLS.js ────────────────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !m3u8Url) return;

    setIsReady(false);
    isReadyRef.current = false;
    setError(null);
    setBuffering(true);
    progressFiredRef.current = false;

    // Cleanup previous instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    // Safari native HLS fallback
    if (video.canPlayType('application/vnd.apple.mpegurl') && !Hls.isSupported()) {
      video.src = m3u8Url;
      setIsReady(true);
      setBuffering(false);
      return;
    }

    if (!Hls.isSupported()) {
      setError('Trình duyệt không hỗ trợ phát video HLS.');
      setBuffering(false);
      return;
    }

    const MAX_RETRIES = 3;
    let networkRetries = 0;

    const hls = new Hls({
      maxBufferLength: 30,
      maxMaxBufferLength: 60,
      startLevel: -1,             // Auto quality
      enableWorker: true,
      lowLatencyMode: false,
    });

    hlsRef.current = hls;

    hls.loadSource(m3u8Url);
    hls.attachMedia(video);

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      setIsReady(true);
      isReadyRef.current = true;
      setBuffering(false);
    });

    hls.on(Hls.Events.ERROR, (_event, data) => {
      if (data.fatal) {
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            networkRetries++;
            if (networkRetries <= MAX_RETRIES) {
              console.warn(`[HLS] Network error, retry ${networkRetries}/${MAX_RETRIES}...`);
              hls.startLoad();
            } else {
              console.error('[HLS] Max retries reached — stream unreachable');
              setError('Nguồn phim không khả dụng. Máy chủ stream không phản hồi.');
              setBuffering(false);
              hls.destroy();
            }
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            hls.recoverMediaError();
            break;
          default:
            setError('Nguồn phim lỗi. Vui lòng thử server khác.');
            setBuffering(false);
            hls.destroy();
            break;
        }
      }
    });

    return () => {
      hls.destroy();
      hlsRef.current = null;
    };
  }, [m3u8Url, setError, setBuffering]);

  // ── Loading timeout (separate effect) ─────────────────
  // Nếu sau 10s vẫn chưa ready → show error
  useEffect(() => {
    if (!m3u8Url) return;

    const timeout = setTimeout(() => {
      if (!isReadyRef.current) {
        setError('Tải nguồn phim quá lâu. Nguồn có thể không khả dụng.');
        setBuffering(false);
        // Destroy HLS instance to stop retries
        if (hlsRef.current) {
          hlsRef.current.destroy();
          hlsRef.current = null;
        }
      }
    }, 10000);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [m3u8Url]);

  // ── Sync volume to video element ──────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = isMuted ? 0 : volume;
    video.muted = isMuted;
  }, [volume, isMuted]);

  // ── Video event listeners ─────────────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onWaiting = () => setBuffering(true);
    const onCanPlay = () => setBuffering(false);
    const onLoadedMetadata = () => setDuration(video.duration);
    const onEnded = () => {
      setPlaying(false);
      options.onEnded?.();
    };

    const onTimeUpdate = () => {
      const time = video.currentTime;
      setCurrentTime(time);

      // Preload tập tiếp theo khi đạt 80%
      if (video.duration > 0 && !progressFiredRef.current) {
        const pct = time / video.duration;
        if (pct >= 0.8) {
          progressFiredRef.current = true;
          options.onProgress80?.();
        }
      }
    };

    const onError = () => {
      setError('Lỗi phát video. Vui lòng thử lại.');
    };

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('ended', onEnded);
    video.addEventListener('error', onError);

    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('ended', onEnded);
      video.removeEventListener('error', onError);
    };
  }, [setPlaying, setBuffering, setDuration, setCurrentTime, setError, options]);

  // ── Control functions ─────────────────────────────────
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, []);

  const seek = useCallback((time) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(time, video.duration || 0));
  }, []);

  const seekRelative = useCallback((delta) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(video.currentTime + delta, video.duration || 0));
  }, []);

  const changeVolume = useCallback((delta) => {
    const newVol = Math.max(0, Math.min(1, volume + delta));
    setVolume(newVol);
  }, [volume, setVolume]);

  const toggleFullscreen = useCallback((containerRef) => {
    const el = containerRef?.current;
    if (!el) return;

    if (!document.fullscreenElement) {
      el.requestFullscreen().then(() => setFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setFullscreen(false)).catch(() => {});
    }
  }, [setFullscreen]);

  const retry = useCallback(() => {
    setError(null);
    if (hlsRef.current && m3u8Url) {
      hlsRef.current.loadSource(m3u8Url);
    }
  }, [m3u8Url, setError]);

  // ── Keyboard shortcuts ────────────────────────────────
  const handleKeyDown = useCallback(
    (e) => {
      // Ignore if typing in input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;

      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          seekRelative(-10);
          break;
        case 'ArrowRight':
          e.preventDefault();
          seekRelative(10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          changeVolume(0.05);
          break;
        case 'ArrowDown':
          e.preventDefault();
          changeVolume(-0.05);
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          toggleMute();
          break;
        case 'f':
        case 'F':
          // fullscreen handled by component via containerRef
          break;
        default:
          break;
      }
    },
    [togglePlay, seekRelative, changeVolume, toggleMute]
  );

  return {
    videoRef,
    isReady,
    isPlaying,
    isBuffering,
    error,
    volume,
    isMuted,
    togglePlay,
    seek,
    seekRelative,
    changeVolume,
    toggleFullscreen,
    toggleMute,
    handleKeyDown,
    retry,
  };
}
