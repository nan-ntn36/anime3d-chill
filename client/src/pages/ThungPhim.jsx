/**
 * ThungPhimPage — Kho phim: tabs theo loại (Tất Cả, Phim Bộ, Phim Lẻ, Hoạt Hình, TV Shows)
 */

import { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import MovieCard from '@components/movie/MovieCard';
import Pagination from '@components/ui/Pagination';
import ErrorFallback from '@components/common/ErrorFallback';
import { useAllMovies, useMoviesByGenre, useGenres } from '@/hooks/useMovies';
import './ThungPhim.css';

export default function ThungPhimPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const activeSlug = searchParams.get('loai') || 'all';
  const page = parseInt(searchParams.get('page') || '1', 10);

  // Lấy dữ liệu 10 genres từ API (backend cache)
  const { data: genresData, isLoading: genresLoading, isError: genresError } = useGenres();

  // Tạo mảng Tabs động
  const CATEGORIES = useMemo(() => {
    const baseCat = { slug: 'all', label: 'Tất Cả', icon: '🎬', type: 'all' };
    
    // Đang tải hoặc lỗi API -> Tạm thời chỉ hiện 1 tab báo hiệu
    if (genresLoading) {
      return [baseCat, { slug: 'loading', label: 'Đang tải thể loại...', icon: '🔄', type: 'loading' }];
    }
    
    if (genresError || !genresData || !Array.isArray(genresData)) {
      return [baseCat, { slug: 'error', label: 'Lỗi tải Thể loại (API)', icon: '⚠️', type: 'error' }];
    }
    
    // Ánh xạ 10 thể loại đầu tiên từ API
    const ICONS = ['🔥', '🗺️', '👻', '😂', '🚀', '💖', '⚽', '🏫', '🥋'];
    const apiGenres = genresData.slice(0, 9).map((g, index) => ({
      slug: g.slug || g._id,  
      label: g.name,
      icon: ICONS[index] || '✨',
      type: 'genre'
    }));

    return [baseCat, ...apiGenres];
  }, [genresData, genresLoading, genresError]);

  // Luôn đảm bảo lấy nhãn chuẩn nếu tab đang tải
  const activeLabel = CATEGORIES.find(c => c.slug === activeSlug)?.label || (activeSlug === 'all' ? 'Tất Cả' : 'Đang Tải...');
  const activeIcon = CATEGORIES.find(c => c.slug === activeSlug)?.icon || '✨';

  // Xác định định tuyến fetch: 
  // - Nếu tab là "all", dùng useAllMovies. 
  // - Còn lại đều coi như "genre"
  const activeType = activeSlug === 'all' ? 'all' : 'genre';

  const allMovies = useAllMovies(activeType === 'all' ? page : 1);
  const genreMovies = useMoviesByGenre(activeType === 'genre' ? activeSlug : null, page);

  const query = activeType === 'all' ? allMovies : genreMovies;
  const { data, isLoading, isFetching, isError, refetch } = query;

  // Hiển thị loader ngay cả khi đang refresh dữ liệu (tránh web đơ vì API bên thứ 3 chậm)
  const isDataLoading = isLoading || isFetching;

  const movies = data?.items || [];
  const pagination = data?.pagination || {};
  const totalPages = pagination.totalPages || 1;

  // Reset page khi đổi tab
  const handleTabChange = (slug) => {
    setSearchParams({ loai: slug, page: '1' });
  };

  const handlePageChange = (newPage) => {
    setSearchParams({ loai: activeSlug, page: String(newPage) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <Helmet>
        <title>{activeLabel} — ThungPhim | Anime3D-Chill</title>
        <meta name="description" content={`Xem ${activeLabel}: phim bộ, phim lẻ, hoạt hình và nhiều thể loại khác tại Anime3D-Chill.`} />
        <link rel="canonical" href={`${window.location.origin}/thung-phim`} />
        <meta property="og:title" content={`${activeLabel} — ThungPhim | Anime3D-Chill`} />
        <meta property="og:description" content={`Xem ${activeLabel}: phim bộ, phim lẻ, hoạt hình tại Anime3D-Chill.`} />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="thung-phim container">
        {/* Header */}
        <div className="thung-phim__header">
          <h1 className="thung-phim__title">
            <span className="thung-phim__title-icon">🎬</span>
            Kho Phim
          </h1>
          <p className="thung-phim__subtitle">Khám phá hàng ngàn phim theo thể loại yêu thích</p>
        </div>

        {/* Category Tabs */}
        <nav className="thung-phim__tabs" role="tablist">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.slug}
              role="tab"
              aria-selected={activeSlug === cat.slug}
              className={`thung-phim__tab ${activeSlug === cat.slug ? 'thung-phim__tab--active' : ''}`}
              onClick={() => handleTabChange(cat.slug)}
            >
              <span className="thung-phim__tab-icon">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <section className="thung-phim__content">
          {isError ? (
            <ErrorFallback
              message="Không thể tải danh sách phim"
              onRetry={() => refetch()}
            />
          ) : isDataLoading ? (
            <div className="thung-phim__grid">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ aspectRatio: '2/3', borderRadius: 'var(--radius-lg)' }} />
              ))}
            </div>
          ) : movies.length === 0 ? (
            <div className="thung-phim__empty">
              <span className="thung-phim__empty-icon">🔍</span>
              <p>Không tìm thấy phim nào trong mục này</p>
            </div>
          ) : (
            <>
              {/* Movie Count */}
              <p className="thung-phim__count">
                {activeIcon} {activeLabel} — Trang {page}/{totalPages}
                {pagination.totalItems && ` · ${pagination.totalItems.toLocaleString()} phim`}
              </p>

              <div className="thung-phim__grid">
                {movies.map((movie) => (
                  <MovieCard key={movie.slug} movie={movie} />
                ))}
              </div>

              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </section>
      </div>
    </>
  );
}
