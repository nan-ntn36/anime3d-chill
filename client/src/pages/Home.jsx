/**
 * HomePage — Trang chủ: phim mới, phim bộ, phim lẻ, thể loại
 * Dữ liệu thật từ API qua TanStack Query hooks
 */

import { Helmet } from 'react-helmet-async';
import MovieCarousel from '@components/movie/MovieCarousel';
import ErrorFallback from '@components/common/ErrorFallback';
import { useNewMovies, useMoviesByList, useMoviesByGenre } from '@/hooks/useMovies';
import './Home.css';

export default function Home() {
  const newMovies = useNewMovies(1);
  const phimBo = useMoviesByList('phim-bo', 1);
  const phimLe = useMoviesByList('phim-le', 1);
  const hanhDong = useMoviesByGenre('hanh-dong', 1);

  return (
    <>
      <Helmet>
        <title>Anime3D-Chill — Xem Phim Anime Online</title>
        <meta name="description" content="Xem phim anime miễn phí với giao diện 3D hiện đại. Cập nhật phim mới mỗi ngày." />
      </Helmet>

      <div className="home container">
        {/* Hero Section */}
        <section className="home__hero animate-slideUp">
          <h1>
            Chào mừng đến <span className="text-gradient">Anime3D-Chill</span>
          </h1>
          <p className="home__subtitle">
            Xem phim anime với giao diện hiện đại. Cập nhật mỗi ngày.
          </p>
        </section>

        {/* Phim Mới */}
        <section className="home__section">
          {newMovies.isError ? (
            <ErrorFallback
              message="Không thể tải phim mới"
              onRetry={() => newMovies.refetch()}
            />
          ) : (
            <MovieCarousel
              title="🔥 Phim Mới Cập Nhật"
              movies={newMovies.data?.items || []}
              loading={newMovies.isLoading}
            />
          )}
        </section>

        {/* Phim Bộ */}
        <section className="home__section">
          {phimBo.isError ? (
            <ErrorFallback
              message="Không thể tải phim bộ"
              onRetry={() => phimBo.refetch()}
            />
          ) : (
            <MovieCarousel
              title="📺 Phim Bộ"
              movies={phimBo.data?.items || []}
              loading={phimBo.isLoading}
            />
          )}
        </section>

        {/* Phim Lẻ */}
        <section className="home__section">
          {phimLe.isError ? (
            <ErrorFallback
              message="Không thể tải phim lẻ"
              onRetry={() => phimLe.refetch()}
            />
          ) : (
            <MovieCarousel
              title="🎬 Phim Lẻ"
              movies={phimLe.data?.items || []}
              loading={phimLe.isLoading}
            />
          )}
        </section>

        {/* Hành Động — thể loại khác biệt, tránh trùng với Phim Bộ */}
        <section className="home__section">
          {hanhDong.isError ? (
            <ErrorFallback
              message="Không thể tải phim hành động"
              onRetry={() => hanhDong.refetch()}
            />
          ) : (
            <MovieCarousel
              title="💥 Hành Động"
              movies={hanhDong.data?.items || []}
              loading={hanhDong.isLoading}
            />
          )}
        </section>
      </div>
    </>
  );
}
