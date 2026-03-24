/**
 * HomePage — Trang chủ: hero banner, genre cards, movie sections
 * Layout theo rophim.best reference
 */

import { Helmet } from 'react-helmet-async';
import HeroBanner from '@components/home/HeroBanner';
import GenreCards from '@components/home/GenreCards';
import MovieCarousel from '@components/movie/MovieCarousel';
import ErrorFallback from '@components/common/ErrorFallback';
import { useNewMovies, useMoviesByList, useMoviesByGenre } from '@/hooks/useMovies';
import './Home.css';

export default function Home() {
  const newMovies = useNewMovies(1);
  const phimBo = useMoviesByList('phim-bo', 1);
  const phimLe = useMoviesByList('phim-le', 1);
  const hoatHinh = useMoviesByList('hoat-hinh', 1);
  const hanhDong = useMoviesByGenre('hanh-dong', 1);

  return (
    <>
      <Helmet>
        <title>Anime3D-Chill — Xem Phim Anime Online</title>
        <meta name="description" content="Xem phim anime miễn phí với giao diện hiện đại. Cập nhật phim mới mỗi ngày." />
      </Helmet>

      {/* Hero Banner — full-width, outside container */}
      <HeroBanner
        movies={newMovies.data?.items || []}
        loading={newMovies.isLoading}
      />

      {/* Genre Cards */}
      <GenreCards />

      {/* Movie Sections */}
      <div className="home container">
        {/* Phim Mới Cập Nhật */}
        <section className="home__section">
          {newMovies.isError ? (
            <ErrorFallback
              message="Không thể tải phim mới"
              onRetry={() => newMovies.refetch()}
            />
          ) : (
            <MovieCarousel
              title="Phim Mới Cập Nhật"
              icon="🔥"
              movies={newMovies.data?.items || []}
              loading={newMovies.isLoading}
              viewAllLink="/phim-moi"
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
              title="Phim Bộ"
              icon="📺"
              movies={phimBo.data?.items || []}
              loading={phimBo.isLoading}
              viewAllLink="/danh-sach/phim-bo"
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
              title="Phim Lẻ"
              icon="🎬"
              movies={phimLe.data?.items || []}
              loading={phimLe.isLoading}
              viewAllLink="/danh-sach/phim-le"
            />
          )}
        </section>

        {/* Hoạt Hình */}
        <section className="home__section">
          {hoatHinh.isError ? (
            <ErrorFallback
              message="Không thể tải hoạt hình"
              onRetry={() => hoatHinh.refetch()}
            />
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

        {/* Hành Động */}
        <section className="home__section">
          {hanhDong.isError ? (
            <ErrorFallback
              message="Không thể tải phim hành động"
              onRetry={() => hanhDong.refetch()}
            />
          ) : (
            <MovieCarousel
              title="Hành Động"
              icon="💥"
              movies={hanhDong.data?.items || []}
              loading={hanhDong.isLoading}
              viewAllLink="/the-loai/hanh-dong"
            />
          )}
        </section>
      </div>
    </>
  );
}
