/**
 * KKPhim Transformer Tests
 * Test: normalizeImageUrl, normalizeMovieItem, transformMovieList, transformMovieDetail
 */

import { describe, it, expect } from 'vitest';

const {
  transformMovieList,
  transformMovieDetail,
  transformEpisodes,
  normalizeMovieItem,
  normalizeImageUrl,
} = require('../../src/services/kkphimTransformer');

// ── Test Data (mock KKPhim API responses) ─────────────

const mockRawItem = {
  _id: '507f1f77bcf86cd799439011',
  slug: 'naruto',
  name: 'Naruto',
  original_name: 'ナルト',
  poster_url: '/uploads/movies/naruto-poster.jpg',
  thumb_url: '/uploads/movies/naruto-thumb.jpg',
  year: 2002,
  country: [{ name: 'Nhật Bản', slug: 'nhat-ban' }],
  category: [{ name: 'Hành Động', slug: 'hanh-dong' }],
  quality: 'HD',
  language: 'Vietsub',
  episode_total: '220',
  episode_current: 'Hoàn Tất (220/220)',
  time: '23 phút/tập',
  modified: { time: '2025-01-15T10:00:00Z' },
};

const mockListResponse = {
  data: {
    items: [mockRawItem],
    params: {
      pagination: {
        totalItems: 100,
        totalItemsPerPage: 24,
        currentPage: 1,
      },
    },
  },
};

const mockDetailResponse = {
  movie: {
    ...mockRawItem,
    description: '<p>Câu chuyện về <strong>Naruto</strong></p>',
    content: 'Câu chuyện về Naruto text',
    director: ['Hayato Date'],
    actor: ['Junko Takeuchi', 'Noriaki Sugiyama'],
    type: 'series',
    trailer_url: 'https://youtube.com/watch?v=abc',
  },
  episodes: [
    {
      server_name: 'Server #1',
      server_data: [
        { name: 'Tập 1', slug: 'tap-1', link_embed: 'https://embed.com/1', link_m3u8: 'https://m3u8.com/1.m3u8' },
        { name: 'Tập 2', slug: 'tap-2', link_embed: 'https://embed.com/2', link_m3u8: 'https://m3u8.com/2.m3u8' },
      ],
    },
  ],
};

// ── Tests ──────────────────────────────────────────────

describe('normalizeImageUrl', () => {
  it('should add CDN prefix to relative URLs', () => {
    expect(normalizeImageUrl('/uploads/movie.jpg')).toBe('https://phimimg.com/uploads/movie.jpg');
  });

  it('should remove leading slash before joining', () => {
    expect(normalizeImageUrl('/test.jpg')).toBe('https://phimimg.com/test.jpg');
  });

  it('should keep absolute URLs unchanged', () => {
    expect(normalizeImageUrl('https://example.com/img.jpg')).toBe('https://example.com/img.jpg');
  });

  it('should return null for empty/null input', () => {
    expect(normalizeImageUrl(null)).toBeNull();
    expect(normalizeImageUrl('')).toBeNull();
    expect(normalizeImageUrl(undefined)).toBeNull();
  });
});

describe('normalizeMovieItem', () => {
  it('should normalize all fields correctly', () => {
    const result = normalizeMovieItem(mockRawItem);

    expect(result.id).toBe('507f1f77bcf86cd799439011');
    expect(result.slug).toBe('naruto');
    expect(result.title).toBe('Naruto');
    expect(result.originalTitle).toBe('ナルト');
    expect(result.poster).toBe('https://phimimg.com/uploads/movies/naruto-poster.jpg');
    expect(result.thumb).toBe('https://phimimg.com/uploads/movies/naruto-thumb.jpg');
    expect(result.year).toBe(2002);
    expect(result.quality).toBe('HD');
    expect(result.language).toBe('Vietsub');
    expect(result.totalEpisodes).toBe(220);
    expect(result.currentEpisode).toBe('Hoàn Tất (220/220)');
    expect(result.duration).toBe('23 phút/tập');
  });

  it('should extract country names from objects', () => {
    const result = normalizeMovieItem(mockRawItem);
    expect(result.country).toEqual(['Nhật Bản']);
  });

  it('should extract genre names from category objects', () => {
    const result = normalizeMovieItem(mockRawItem);
    expect(result.genres).toEqual(['Hành Động']);
  });

  it('should handle country/genre as plain strings', () => {
    const withStrings = { ...mockRawItem, country: ['Japan'], category: ['Action'] };
    const result = normalizeMovieItem(withStrings);
    expect(result.country).toEqual(['Japan']);
    expect(result.genres).toEqual(['Action']);
  });

  it('should return null for null input', () => {
    expect(normalizeMovieItem(null)).toBeNull();
    expect(normalizeMovieItem(undefined)).toBeNull();
  });

  it('should handle missing fields gracefully', () => {
    const minimal = { slug: 'test' };
    const result = normalizeMovieItem(minimal);
    expect(result.slug).toBe('test');
    expect(result.title).toBe('');
    expect(result.poster).toBeNull();
    expect(result.year).toBeNull();
    expect(result.country).toEqual([]);
    expect(result.genres).toEqual([]);
    expect(result.totalEpisodes).toBe(0);
  });
});

describe('transformMovieList', () => {
  it('should transform items and pagination from KKPhim v1 API format', () => {
    const result = transformMovieList(mockListResponse);

    expect(result.items).toHaveLength(1);
    expect(result.items[0].slug).toBe('naruto');
    expect(result.items[0].title).toBe('Naruto');

    expect(result.pagination.totalItems).toBe(100);
    expect(result.pagination.itemsPerPage).toBe(24);
    expect(result.pagination.currentPage).toBe(1);
    expect(result.pagination.totalPages).toBe(Math.ceil(100 / 24));
  });

  it('should handle root-level items format', () => {
    const rootFormat = {
      items: [mockRawItem, mockRawItem],
      pagination: { totalItems: 50, totalItemsPerPage: 10, currentPage: 2 },
    };
    const result = transformMovieList(rootFormat);

    expect(result.items).toHaveLength(2);
    expect(result.pagination.totalItems).toBe(50);
    expect(result.pagination.currentPage).toBe(2);
  });

  it('should handle empty items', () => {
    const result = transformMovieList({ data: { items: [] } });
    expect(result.items).toHaveLength(0);
    expect(result.pagination.totalItems).toBe(0);
  });

  it('should handle malformed response', () => {
    const result = transformMovieList({});
    expect(result.items).toEqual([]);
  });

  it('should handle null response', () => {
    const result = transformMovieList(null);
    expect(result.items).toEqual([]);
  });

  it('should apply limit when provided', () => {
    const manyItems = {
      items: Array.from({ length: 20 }, (_, i) => ({ slug: `movie-${i}`, name: `Movie ${i}` })),
    };
    const result = transformMovieList(manyItems, 5);
    expect(result.items).toHaveLength(5);
  });
});

describe('transformMovieDetail', () => {
  it('should transform movie details correctly', () => {
    const result = transformMovieDetail(mockDetailResponse);

    expect(result.slug).toBe('naruto');
    expect(result.title).toBe('Naruto');
    expect(result.description).toContain('Naruto');
    expect(result.directors).toEqual(['Hayato Date']);
    expect(result.actors).toContain('Junko Takeuchi');
    expect(result.type).toBe('series');
    expect(result.trailerUrl).toBe('https://youtube.com/watch?v=abc');
  });

  it('should transform episodes', () => {
    const result = transformMovieDetail(mockDetailResponse);

    expect(result.episodes).toHaveLength(1);
    expect(result.episodes[0].serverName).toBe('Server #1');
    expect(result.episodes[0].items).toHaveLength(2);
    expect(result.episodes[0].items[0].name).toBe('Tập 1');
    expect(result.episodes[0].items[0].embedUrl).toBe('https://embed.com/1');
    expect(result.episodes[0].items[0].m3u8Url).toBe('https://m3u8.com/1.m3u8');
  });

  it('should return null for null/undefined input', () => {
    expect(transformMovieDetail(null)).toBeNull();
    expect(transformMovieDetail(undefined)).toBeNull();
  });

  it('should handle empty object gracefully (returns empty movie)', () => {
    const result = transformMovieDetail({});
    // When rawResponse={}, raw fallsback to rawResponse itself = {}
    // normalizeMovieItem({}) returns object with empty defaults
    expect(result).toBeDefined();
    expect(result.slug).toBe('');
    expect(result.episodes).toEqual([]);
  });
});

describe('transformEpisodes', () => {
  it('should transform episode servers and items', () => {
    const raw = [
      {
        server_name: 'VIP',
        server_data: [
          { name: 'Ep 1', slug: 'ep-1', link_embed: 'embed1', link_m3u8: 'm3u8-1' },
        ],
      },
    ];
    const result = transformEpisodes(raw);

    expect(result).toHaveLength(1);
    expect(result[0].serverName).toBe('VIP');
    expect(result[0].items[0].slug).toBe('ep-1');
  });

  it('should return empty array for non-array input', () => {
    expect(transformEpisodes(null)).toEqual([]);
    expect(transformEpisodes(undefined)).toEqual([]);
    expect(transformEpisodes('invalid')).toEqual([]);
  });

  it('should handle empty server_data', () => {
    const result = transformEpisodes([{ server_name: 'Test', server_data: [] }]);
    expect(result[0].items).toEqual([]);
  });
});
