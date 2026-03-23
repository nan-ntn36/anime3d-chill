/**
 * MovieGrid — Grid responsive hiển thị danh sách phim
 */

import MovieCard from './MovieCard';
import { SkeletonCard } from '@components/ui/Skeleton';
import './MovieGrid.css';

export default function MovieGrid({ movies = [], loading = false, columns = 5 }) {
  if (loading) {
    return (
      <div className={`movie-grid movie-grid--cols-${columns}`}>
        {Array.from({ length: columns * 2 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (!movies.length) {
    return (
      <div className="movie-grid__empty">
        <p>Không tìm thấy phim nào.</p>
      </div>
    );
  }

  return (
    <div className={`movie-grid movie-grid--cols-${columns}`}>
      {movies.map((movie) => (
        <MovieCard key={movie.slug || movie.id} movie={movie} />
      ))}
    </div>
  );
}
