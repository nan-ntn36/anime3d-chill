/**
 * MovieCarousel — Slider nổi bật dùng CSS scroll-snap
 * Hiển thị các phim nổi bật dạng horizontal scroll
 */

import { useRef } from 'react';
import MovieCard from './MovieCard';
import { SkeletonCard } from '@components/ui/Skeleton';
import './MovieCarousel.css';

export default function MovieCarousel({ movies = [], loading = false, title }) {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.offsetWidth * 0.7;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  return (
    <div className="movie-carousel">
      {title && (
        <div className="movie-carousel__header">
          <h2 className="movie-carousel__title">{title}</h2>
          <div className="movie-carousel__nav">
            <button onClick={() => scroll('left')} className="movie-carousel__arrow" aria-label="Trước">
              ‹
            </button>
            <button onClick={() => scroll('right')} className="movie-carousel__arrow" aria-label="Sau">
              ›
            </button>
          </div>
        </div>
      )}

      <div className="movie-carousel__track" ref={scrollRef}>
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div className="movie-carousel__item" key={i}>
                <SkeletonCard />
              </div>
            ))
          : movies.map((movie) => (
              <div className="movie-carousel__item" key={movie.slug || movie.id}>
                <MovieCard movie={movie} />
              </div>
            ))
        }
      </div>
    </div>
  );
}
