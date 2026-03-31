import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import HeroBanner from '@components/home/HeroBanner';
import TrendingSection from '@components/home/TrendingSection';
import GenreCards from '@components/home/GenreCards';
import ContinueWatching from '@components/home/ContinueWatching';
import MovieCarousel from '@components/movie/MovieCarousel';
import MovieCard from '@components/movie/MovieCard';
import Pagination from '@components/ui/Pagination';
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
        <title>Anime3D-Chill — Xem Phim Anime Online Miễn Phí</title>
        <meta name="description" content="Xem phim anime miễn phí với giao diện hiện đại. Cập nhật phim mới mỗi ngày. Phim bộ, phim lẻ, hoạt hình chất lượng cao." />
        <link rel="canonical" href={`${window.location.origin}/`} />
        <meta property="og:title" content="Anime3D-Chill — Xem Phim Anime Online Miễn Phí" />
        <meta property="og:description" content="Xem phim anime miễn phí với giao diện hiện đại. Cập nhật phim mới mỗi ngày." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${window.location.origin}/`} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      {/* Hero Banner */}
      <HeroBanner
        movies={movies}
        loading={newMovies.isLoading || newMovies.isFetching}
      />

      {/* Trending Section — Phim Thịnh Hành */}
      <TrendingSection />

      {/* Genre Cards */}
      <GenreCards />

      {/* Continue Watching — Đang Xem */}
      <ContinueWatching />

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
                  message="Không thể tải phim mới"
                  onRetry={() => newMovies.refetch()}
                />
              ) : (newMovies.isLoading || newMovies.isFetching) ? (
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
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                  />
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
                  loading={hoatHinh.isLoading || hoatHinh.isFetching}
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
