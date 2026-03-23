/**
 * Movie Hooks — TanStack Query wrappers
 * Cache-first, auto-refetch, stale time management
 */

import { useQuery } from '@tanstack/react-query';
import movieApi from '@/api/movieApi';

/**
 * Phim mới cập nhật
 */
export function useNewMovies(page = 1) {
  return useQuery({
    queryKey: ['movies', 'new', page],
    queryFn: () => movieApi.getNew(page).then((r) => r.data.data),
    staleTime: 5 * 60 * 1000,     // 5 phút (khớp cache backend)
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
