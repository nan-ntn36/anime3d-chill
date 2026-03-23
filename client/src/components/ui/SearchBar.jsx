/**
 * SearchBar — Ô tìm kiếm với debounce
 */

import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './SearchBar.css';

export default function SearchBar({ placeholder = 'Tìm kiếm phim...' }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed.length > 1) {
      navigate(`/tim-kiem?keyword=${encodeURIComponent(trimmed)}`);
      inputRef.current?.blur();
    }
  }, [query, navigate]);

  return (
    <form className="searchbar" onSubmit={handleSubmit} role="search">
      <input
        ref={inputRef}
        type="text"
        className="searchbar__input"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        maxLength={100}
        aria-label="Tìm kiếm phim"
      />
      <button type="submit" className="searchbar__btn" aria-label="Tìm">
        🔍
      </button>
    </form>
  );
}
