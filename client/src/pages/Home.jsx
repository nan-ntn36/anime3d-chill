/**
 * HomePage — Trang chủ: hero banner, anime grid, genre cards, movie sections
 * Layout theo webfilm-swart.vercel.app reference
 */

import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import HeroBanner from '@components/home/HeroBanner';
import GenreCards from '@components/home/GenreCards';
import MovieCarousel from '@components/movie/MovieCarousel';
import MovieCard from '@components/movie/MovieCard';
import RankingSidebar from '@components/home/RankingSidebar';
import TopRankingFooter from '@components/home/TopRankingFooter';
import ErrorFallback from '@components/common/ErrorFallback';
import { useNewMovies, useMoviesByList } from '@/hooks/useMovies';
import './Home.css';

export default function Home() {
  const [page, setPage] = useState(1);
  const newMovies = useNewMovies(page);
  const hoatHinh = useMoviesByList('hoat-hinh', 1);

  const movies = newMovies.data?.items || [];
  const pagination = newMovies.data?.pagination || {};
  const totalPages = pagination.totalPages || 1;

  return (
    <>
      <Helmet>
        <title>Anime3D-Chill — Xem Phim Anime Online</title>
        <meta name="description" content="Xem phim anime miễn phí với giao diện hiện đại. Cập nhật phim mới mỗi ngày." />
      </Helmet>

      {/* Hero Banner */}
      <HeroBanner
        movies={movies}
        loading={newMovies.isLoading}
      />

      {/* Genre Cards */}
      <GenreCards />

      {/* Main content */}
      <div className="home container">
        <div className="home__layout">
          {/* Left: Anime Grid */}
          <div className="home__main">
            {/* ── ANIME MỚI LÊN SÓNG — Grid with pagination ── */}
            <section className="home__section">
              <h2 className="home__section-title">
                <span className="home__section-icon">🔥</span>
                <span className="home__section-title-text">ANIME MỚI LÊN SÓNG</span>
              </h2>

              {newMovies.isError ? (
                <ErrorFallback
                  message="Không thể tải phim hoạt hình"
                  onRetry={() => newMovies.refetch()}
                />
              ) : newMovies.isLoading ? (
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

            {/* ── Hoạt Hình Carousel ── */}
            <section className="home__section">
              {hoatHinh.isError ? (
                <ErrorFallback message="Không thể tải hoạt hình" onRetry={() => hoatHinh.refetch()} />
              ) : (
                <MovieCarousel
                  title="Hoạt Hình"
                  icon="🎨"
                  movies={hoatHinh.data?.items || []}
                  loading={hoatHinh.isLoading}
                  viewAllLink="/danh-sach/hoat-hinh"
                />
              )}
            </section>
          </div>

          {/* Right: Ranking sidebar */}
          <div className="home__sidebar">
            <RankingSidebar title="BXH RANKING" />
          </div>
        </div>
      </div>

      {/* Top 10 Footer Section */}
      <TopRankingFooter />
    </>
  );
}
