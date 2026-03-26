/**
 * ThungPhimPage — Kho phim: tabs theo loại (Tất Cả, Phim Bộ, Phim Lẻ, Hoạt Hình, TV Shows)
 */

import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import MovieCard from '@components/movie/MovieCard';
import Pagination from '@components/ui/Pagination';
import ErrorFallback from '@components/common/ErrorFallback';
import { useAllMovies, useMoviesByList } from '@/hooks/useMovies';
import './ThungPhim.css';

const CATEGORIES = [
  { slug: 'all',       label: 'Tất Cả',    icon: '🎬' },
  { slug: 'phim-bo',   label: 'Phim Bộ',    icon: '📺' },
  { slug: 'phim-le',   label: 'Phim Lẻ',    icon: '🎥' },
  { slug: 'hoat-hinh', label: 'Hoạt Hình',  icon: '🎨' },
  { slug: 'tv-shows',  label: 'TV Shows',   icon: '📡' },
];

export default function ThungPhimPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const activeSlug = searchParams.get('loai') || 'all';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const activeCategory = CATEGORIES.find(c => c.slug === activeSlug) || CATEGORIES[0];

  // Fetch data dựa trên tab đang chọn
  const allMovies = useAllMovies(activeSlug === 'all' ? page : 1);
  const listMovies = useMoviesByList(activeSlug !== 'all' ? activeSlug : null, page);

  const query = activeSlug === 'all' ? allMovies : listMovies;
  const { data, isLoading, isError, refetch } = query;

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
        <title>{activeCategory.label} — ThungPhim | Anime3D-Chill</title>
        <meta name="description" content={`Xem ${activeCategory.label}: phim bộ, phim lẻ, hoạt hình và nhiều thể loại khác tại Anime3D-Chill.`} />
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
          ) : isLoading ? (
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
                {activeCategory.icon} {activeCategory.label} — Trang {page}/{totalPages}
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
