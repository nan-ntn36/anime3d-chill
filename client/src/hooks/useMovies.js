/**
 * Movie Hooks — TanStack Query wrappers
 * Cache-first, auto-refetch, stale time management
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import movieApi from '@/api/movieApi';
import userApi from '@/api/userApi';
import useAuthStore from '@/store/authStore';
import { getGuestId } from '@/services/guestId';
import toast from 'react-hot-toast';

/**
 * Phim mới cập nhật
 */
export function useNewMovies(page = 1) {
  return useQuery({
    queryKey: ['movies', 'new', page],
    queryFn: () => movieApi.getNew(page).then((r) => r.data.data),
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
}

/**
 * Tất cả phim (AllPhim / ThungPhim)
 */
export function useAllMovies(page = 1) {
  return useQuery({
    queryKey: ['movies', 'all', page],
    queryFn: () => movieApi.getAll(page).then((r) => r.data.data),
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
}

/**
 * Danh sách phim theo loại (phim-bo, phim-le, ...)
 */
export function useMoviesByList(slug, page = 1) {
  return useQuery({
    queryKey: ['movies', 'list', slug, page],
    queryFn: () => movieApi.getByList(slug, page).then((r) => r.data.data),
    staleTime: 15 * 60 * 1000,
    enabled: !!slug,
    placeholderData: (prev) => prev,
  });
}

/**
 * Chi tiết phim
 */
export function useMovieDetail(slug) {
  return useQuery({
    queryKey: ['movies', 'detail', slug],
    queryFn: () => movieApi.getDetail(slug).then((r) => r.data.data),
    staleTime: 30 * 60 * 1000,
    enabled: !!slug,
  });
}

/**
 * Phim theo thể loại
 */
export function useMoviesByGenre(slug, page = 1) {
  return useQuery({
    queryKey: ['movies', 'genre', slug, page],
    queryFn: () => movieApi.getByGenre(slug, page).then((r) => r.data.data),
    staleTime: 15 * 60 * 1000,
    enabled: !!slug,
    placeholderData: (prev) => prev,
  });
}

/**
 * Phim theo quốc gia
 */
export function useMoviesByCountry(slug, page = 1) {
  return useQuery({
    queryKey: ['movies', 'country', slug, page],
    queryFn: () => movieApi.getByCountry(slug, page).then((r) => r.data.data),
    staleTime: 15 * 60 * 1000,
    enabled: !!slug,
    placeholderData: (prev) => prev,
  });
}

/**
 * Tìm kiếm phim
 */
export function useSearchMovies(keyword, page = 1) {
  return useQuery({
    queryKey: ['movies', 'search', keyword, page],
    queryFn: () => movieApi.search(keyword, page).then((r) => r.data.data),
    staleTime: 3 * 60 * 1000,
    enabled: keyword?.trim().length > 1,
    placeholderData: (prev) => prev,
  });
}

/**
 * Phim theo năm
 */
export function useMoviesByYear(year, page = 1) {
  return useQuery({
    queryKey: ['movies', 'year', year, page],
    queryFn: () => movieApi.getByYear(year, page).then((r) => r.data.data),
    staleTime: 15 * 60 * 1000,
    enabled: !!year,
    placeholderData: (prev) => prev,
  });
}

/**
 * Danh sách thể loại + thumbnail
 */
export function useGenres() {
  return useQuery({
    queryKey: ['categories', 'genres'],
    queryFn: () => movieApi.getGenres().then((r) => r.data.data),
    staleTime: 60 * 60 * 1000, // 1 giờ
  });
}

/**
 * Danh sách quốc gia + thumbnail
 */
export function useCountries() {
  return useQuery({
    queryKey: ['categories', 'countries'],
    queryFn: () => movieApi.getCountries().then((r) => r.data.data),
    staleTime: 60 * 60 * 1000,
  });
}

/* ═══════════════════════════════════════════════════════════
   Favorite Toggle Hook — Day 9
   ═══════════════════════════════════════════════════════════ */

/**
 * Toggle yêu thích phim
 * @param {object} movie - movie object từ useMovieDetail
 * @returns {{ toggle, isFavorited, isPending }}
 */
export function useFavoriteToggle(movie) {
  const { isAuthenticated } = useAuthStore();
  const [isFavorited, setIsFavorited] = useState(false);

  const addMutation = useMutation({
    mutationFn: () =>
      userApi.addFavorite({
        movieSlug: movie?.slug,
        movieName: movie?.title,
        movieThumb: movie?.thumb || movie?.poster,
      }),
    onSuccess: () => {
      setIsFavorited(true);
      toast.success('Đã thêm vào yêu thích');
    },
    onError: (err) => {
      // If 409 Conflict → already favorited
      if (err?.response?.status === 409) {
        setIsFavorited(true);
        return;
      }
      toast.error('Không thể thêm yêu thích');
    },
  });

  const removeMutation = useMutation({
    mutationFn: () => userApi.removeFavorite(movie?.slug),
    onSuccess: () => {
      setIsFavorited(false);
      toast.success('Đã xóa khỏi yêu thích');
    },
    onError: () => {
      toast.error('Không thể xóa yêu thích');
    },
  });

  const toggle = useCallback(() => {
    if (!isAuthenticated || !movie?.slug) return;

    // Optimistic UI
    setIsFavorited((prev) => !prev);

    if (isFavorited) {
      removeMutation.mutate();
    } else {
      addMutation.mutate();
    }
  }, [isAuthenticated, isFavorited, movie?.slug, addMutation, removeMutation]);

  return {
    toggle,
    isFavorited,
    isPending: addMutation.isPending || removeMutation.isPending,
  };
}

/* ═══════════════════════════════════════════════════════════
   Trending Movies Hook — Day 17
   ═══════════════════════════════════════════════════════════ */

/**
 * Phim thịnh hành (trending) — cache 15 phút
 */
export function useTrendingMovies() {
  return useQuery({
    queryKey: ['movies', 'trending'],
    queryFn: () => movieApi.getTrending().then((r) => r.data.data),
    staleTime: 15 * 60 * 1000, // 15 phút — khớp với backend cache
    gcTime: 30 * 60 * 1000,
  });
}

/* ═══════════════════════════════════════════════════════════
   Record View Hook — Day 17
   ═══════════════════════════════════════════════════════════ */

/**
 * Ghi nhận lượt xem phim — fire-and-forget
 * Deduplicate: chỉ ghi 1 lần mỗi slug trong session component
 * @param {string} movieSlug
 */
export function useRecordView(movieSlug) {
  const hasRecorded = useRef(false);

  useEffect(() => {
    if (!movieSlug || hasRecorded.current) return;
    hasRecorded.current = true;

    const sessionId = getGuestId();
    movieApi.recordView({ movieSlug, sessionId }).catch(() => {
      // Silent fail — analytics không nên block UX
    });
  }, [movieSlug]);
}
