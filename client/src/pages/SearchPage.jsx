/**
 * SearchPage — Tìm kiếm phim
 * Debounce input, kết quả grid, pagination, loading/empty/error states
 * Fallback: gợi ý duyệt theo thể loại khi chưa nhập keyword (từ API)
 */

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiSearch, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import MovieCard from '@components/movie/MovieCard';
import TopicCard from '@components/ui/TopicCard';
import ErrorFallback from '@components/common/ErrorFallback';
import { useSearchMovies, useGenres } from '@/hooks/useMovies';
import './SearchPage.css';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlKeyword = searchParams.get('keyword') || '';
  const urlPage = parseInt(searchParams.get('page'), 10) || 1;

  const [inputValue, setInputValue] = useState(urlKeyword);
  const [debouncedKeyword, setDebouncedKeyword] = useState(urlKeyword);
  const [page, setPage] = useState(urlPage);

  // Lấy danh sách thể loại từ API cho phần gợi ý
  const { data: genres = [] } = useGenres();

  // Debounce input 500ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(inputValue.trim());
      setPage(1); // Reset page khi keyword thay đổi
    }, 500);
    return () => clearTimeout(timer);
  }, [inputValue]);

  // Sync URL khi keyword/page thay đổi
  useEffect(() => {
    const params = {};
    if (debouncedKeyword) params.keyword = debouncedKeyword;
    if (page > 1) params.page = page.toString();
    setSearchParams(params, { replace: true });
  }, [debouncedKeyword, page, setSearchParams]);

  // Query
  const { data, isLoading, isError, refetch } = useSearchMovies(debouncedKeyword, page);

  const movies = data?.items || [];
  const pagination = data?.pagination || {};
  const totalPages = pagination.totalPages || 1;
  const totalItems = pagination.totalItems || 0;

  const hasKeyword = debouncedKeyword.length > 1;
  const isEmpty = hasKeyword && !isLoading && !isError && movies.length === 0;

  const handleClear = () => {
    setInputValue('');
    setDebouncedKeyword('');
    setPage(1);
  };

  return (
    <>
      <Helmet>
        <title>{hasKeyword ? `"${debouncedKeyword}" — Tìm Kiếm | Anime3D-Chill` : 'Tìm Kiếm Phim | Anime3D-Chill'}</title>
        <meta name="description" content={`Tìm kiếm phim anime, phim bộ, phim lẻ trên Anime3D-Chill${hasKeyword ? `: ${debouncedKeyword}` : ''}`} />
      </Helmet>

      <div className="search-page container">
        {/* ── Search Hero ── */}
        <div className="search-page__hero">
          <h1 className="search-page__title">Tìm Kiếm Phim</h1>
          <p className="search-page__subtitle">Khám phá hàng nghìn bộ phim anime, phim bộ, phim lẻ</p>

          <form className="search-page__form" onSubmit={(e) => e.preventDefault()}>
            <div className="search-page__input-wrap">
              <FiSearch className="search-page__input-icon" />
              <input
                id="search-input"
                type="text"
                placeholder="Nhập tên phim, diễn viên, đạo diễn..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="search-page__input"
                autoFocus
                autoComplete="off"
              />
              {inputValue && (
                <button
                  type="button"
                  className="search-page__clear"
                  onClick={handleClear}
                  aria-label="Xóa tìm kiếm"
                >
                  <FiX />
                </button>
              )}
            </div>
          </form>

          {hasKeyword && !isLoading && !isError && (
            <p className="search-page__result-count">
              Tìm thấy <strong>{totalItems}</strong> kết quả cho "{debouncedKeyword}"
            </p>
          )}
        </div>

        {/* ── Results ── */}
        {hasKeyword ? (
          <section className="search-page__results">
            {isError ? (
              <ErrorFallback
                message="Không thể tìm kiếm. Hãy thử lại!"
                onRetry={() => refetch()}
              />
            ) : isLoading ? (
              <div className="search-page__grid">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="movie-card-container">
                    <div className="skeleton" style={{ width: '100%', height: '100%', borderRadius: 'var(--radius-lg)' }} />
                  </div>
                ))}
              </div>
            ) : isEmpty ? (
              <div className="search-page__empty">
                <div className="search-page__empty-icon">🔍</div>
                <h3>Không tìm thấy kết quả</h3>
                <p>Thử tìm kiếm với từ khóa khác hoặc duyệt theo thể loại phía dưới</p>
              </div>
            ) : (
              <>
                <div className="search-page__grid">
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
                        if (totalPages <= 7) pageNum = i + 1;
                        else if (page <= 4) pageNum = i + 1;
                        else if (page >= totalPages - 3) pageNum = totalPages - 6 + i;
                        else pageNum = page - 3 + i;
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
        ) : (
          /* ── Fallback: Gợi ý thể loại từ API ── */
          <section className="search-page__suggest">
            <h2 className="search-page__suggest-title">Duyệt theo thể loại</h2>
            <div className="search-page__suggest-grid">
              {genres.length > 0
                ? genres.map((genre) => (
                    <TopicCard
                      key={genre.slug}
                      name={genre.name}
                      slug={genre.slug}
                      type="genre"
                      thumb={genre.thumb}
                    />
                  ))
                : Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="topic-card skeleton" style={{ minHeight: '160px' }} />
                  ))
              }
            </div>
          </section>
        )}
      </div>
    </>
  );
}
