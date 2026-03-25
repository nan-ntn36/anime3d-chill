import { Link } from 'react-router-dom';
import { useNewMovies } from '@/hooks/useMovies';
import './RankingSidebar.css';

export default function RankingSidebar({ title = "BẢNG XẾP HẠNG" }) {
  // We use useNewMovies or potentially a top-rated endpoint if we had one.
  // Using useNewMovies for now to mock the leaderboard.
  const { data, isLoading } = useNewMovies(1);
  const movies = data?.items?.slice(0, 10) || [];

  if (isLoading) {
    return (
      <div className="ranking-sidebar ranking-sidebar--loading">
        <h3 className="ranking-sidebar__title">{title}</h3>
        <div className="skeleton" style={{ height: 60, marginBottom: 10 }} />
        <div className="skeleton" style={{ height: 60, marginBottom: 10 }} />
        <div className="skeleton" style={{ height: 60, marginBottom: 10 }} />
      </div>
    );
  }

  return (
    <aside className="ranking-sidebar">
      <h3 className="ranking-sidebar__title">
        <span className="ranking-sidebar__icon">🔥</span> {title}
      </h3>
      <div className="ranking-sidebar__list">
        {movies.map((movie, index) => {
          const rank = index + 1;
          const rankColorClass = rank <= 3 ? `rank-${rank}` : 'rank-normal';
          
          return (
            <Link to={`/phim/${movie.slug}`} key={movie.slug} className="ranking-card">
              <div className={`ranking-card__number ${rankColorClass}`}>
                {rank}
              </div>
              <div className="ranking-card__thumb">
                <img 
                  src={movie.thumb || movie.poster || '/placeholder-poster.svg'} 
                  alt={movie.title}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="ranking-card__info">
                <h4 className="ranking-card__title">{movie.title}</h4>
                <div className="ranking-card__meta">
                  {movie.year && <span>{movie.year}</span>}
                  {movie.quality && <span className="quality">{movie.quality}</span>}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
