/**
 * MovieListPage — Danh sách phim theo thể loại / quốc gia
 * - Không có :slug → hiển thị grid TopicCard (từ API)
 * - Có :slug → hiển thị MovieGrid + pagination
 */

import { useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import MovieCard from '@components/movie/MovieCard';
import TopicCard from '@components/ui/TopicCard';
import Pagination from '@components/ui/Pagination';
import ErrorFallback from '@components/common/ErrorFallback';
import { useMoviesByGenre, useMoviesByCountry, useGenres, useCountries } from '@/hooks/useMovies';
import './MovieListPage.css';

/**
 * Xác định type (genre/country) từ pathname
 */
function getTypeFromPath(pathname) {
  if (pathname.startsWith('/quoc-gia')) return 'country';
  return 'genre';
}

export default function MovieListPage() {
  const { slug } = useParams();
  const location = useLocation();
  const type = getTypeFromPath(location.pathname);
  const [page, setPage] = useState(1);

  const isGenre = type === 'genre';
  const pageTitle = isGenre ? 'Thể Loại' : 'Quốc Gia';

  // Fetch danh sách từ API
  const genresQuery = useGenres();
  const countriesQuery = useCountries();
  const topicsQuery = isGenre ? genresQuery : countriesQuery;
  const allTopics = topicsQuery.data || [];

  // Lấy label từ API data
  const currentTopic = allTopics.find((t) => t.slug === slug);
  const label = currentTopic?.name || slug;

  // Conditionally call the correct hook
  const genreQuery = useMoviesByGenre(isGenre && slug ? slug : null, page);
  const countryQuery = useMoviesByCountry(!isGenre && slug ? slug : null, page);
  const query = isGenre ? genreQuery : countryQuery;

  // Không có slug → hiển thị danh sách topic
  if (!slug) {
    return (
      <>
        <Helmet>
          <title>{pageTitle} Phim — Anime3D-Chill</title>
          <meta name="description" content={`Duyệt phim theo ${pageTitle.toLowerCase()} trên Anime3D-Chill`} />
          <link rel="canonical" href={`${window.location.origin}${location.pathname}`} />
          <meta property="og:title" content={`${pageTitle} Phim — Anime3D-Chill`} />
          <meta property="og:description" content={`Duyệt phim theo ${pageTitle.toLowerCase()} trên Anime3D-Chill`} />
          <meta property="og:type" content="website" />
        </Helmet>

        <div className="movie-list-page container">
          <div className="movie-list-page__header">
            <h1 className="movie-list-page__title">
              <span className="movie-list-page__icon">{isGenre ? '🎭' : '🌏'}</span>
              {pageTitle} Phim
            </h1>
            <p className="movie-list-page__desc">
              {isGenre
                ? 'Khám phá phim theo thể loại yêu thích của bạn'
                : 'Duyệt phim theo quốc gia sản xuất'}
            </p>
          </div>

          {topicsQuery.isLoading || topicsQuery.isFetching ? (
            <div className="movie-list-page__topic-grid">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="topic-card skeleton" style={{ minHeight: '160px' }} />
              ))}
            </div>
          ) : topicsQuery.isError ? (
            <ErrorFallback
              message={`Không thể tải danh sách ${pageTitle.toLowerCase()}`}
              onRetry={() => topicsQuery.refetch()}
            />
          ) : (
            <div className="movie-list-page__topic-grid">
              {allTopics.map((topic) => (
                <TopicCard
                  key={topic.slug}
                  name={topic.name}
                  slug={topic.slug}
                  type={type}
                  thumb={topic.thumb}
                />
              ))}
            </div>
          )}
        </div>
      </>
    );
  }

  // Có slug → hiển thị movie grid
  const movies = query.data?.items || [];
  const pagination = query.data?.pagination || {};
  const totalPages = pagination.totalPages || 1;

  return (
    <>
      <Helmet>
        <title>{label} — {pageTitle} | Anime3D-Chill</title>
        <meta name="description" content={`Xem phim ${pageTitle.toLowerCase()} ${label} trên Anime3D-Chill`} />
        <link rel="canonical" href={`${window.location.origin}${location.pathname}`} />
        <meta property="og:title" content={`${label} — ${pageTitle} | Anime3D-Chill`} />
        <meta property="og:description" content={`Xem phim ${pageTitle.toLowerCase()} ${label} trên Anime3D-Chill`} />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="movie-list-page container">
        <div className="movie-list-page__header">
          <h1 className="movie-list-page__title">
            <span className="movie-list-page__icon">{isGenre ? '🎭' : '🌏'}</span>
            {pageTitle}: {label}
          </h1>
        </div>

        {query.isError ? (
          <ErrorFallback
            message={`Không thể tải phim ${pageTitle.toLowerCase()} "${label}"`}
            onRetry={() => query.refetch()}
          />
        ) : (query.isLoading || query.isFetching) ? (
          <div className="movie-list-page__grid">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="movie-card-container">
                <div className="skeleton" style={{ width: '100%', height: '100%', borderRadius: 'var(--radius-lg)' }} />
              </div>
            ))}
          </div>
        ) : movies.length === 0 ? (
          <div className="movie-list-page__empty">
            <div className="movie-list-page__empty-icon">📭</div>
            <h3>Chưa có phim</h3>
            <p>Hiện chưa có phim nào trong danh mục "{label}"</p>
          </div>
        ) : (
          <>
            <div className="movie-list-page__grid">
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
      </div>
    </>
  );
}
