/**
 * ThungPhimPage — Trang hiển thị tất cả phim bộ, phim lẻ (ngoại trừ hoạt hình)
 */

import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import MovieCard from '@components/movie/MovieCard';
import ErrorFallback from '@components/common/ErrorFallback';
import { useAllMovies } from '@/hooks/useMovies';
import '../pages/Home.css';

export default function ThungPhimPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useAllMovies(page);

  const movies = data?.items || [];
  const pagination = data?.pagination || {};
  const totalPages = pagination.totalPages || 1;

  return (
    <>
      <Helmet>
        <title>ThungPhim — Tất Cả Các Phim | Anime3D-Chill</title>
        <meta name="description" content="Xem tất cả các thể loại phim: phim bộ, phim lẻ, hành động, tình cảm và nhiều hơn nữa." />
      </Helmet>

      <div className="home container" style={{ paddingTop: 'calc(var(--header-height) + var(--space-8))' }}>
        <section className="home__section">
          <h2 className="home__section-title">
            <span className="home__section-icon">🎬</span>
            <span className="home__section-title-text">THUNG PHIM — TẤT CẢ</span>
          </h2>

          {isError ? (
            <ErrorFallback
              message="Không thể tải danh sách phim"
              onRetry={() => refetch()}
            />
          ) : isLoading ? (
            <div className="home__grid">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="movie-card-container">
                  <div className="skeleton" style={{ width: '100%', height: '100%', borderRadius: 'var(--radius-lg)' }} />
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="home__grid">
                {movies.map((movie) => (
                  <MovieCard key={movie.slug} movie={movie} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="pagination__btn"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <FiChevronLeft /> Trước
                  </button>

                  <div className="pagination__pages">
                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 7) {
                        pageNum = i + 1;
                      } else if (page <= 4) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 3) {
                        pageNum = totalPages - 6 + i;
                      } else {
                        pageNum = page - 3 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          className={`pagination__page ${page === pageNum ? 'pagination__page--active' : ''}`}
                          onClick={() => setPage(pageNum)}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    className="pagination__btn"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Sau <FiChevronRight />
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </>
  );
}
