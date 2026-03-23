/**
 * NguonC Data Transformer
 * Chuẩn hóa dữ liệu thô từ phim.nguonc.com → format frontend
 */

const IMG_CDN = 'https://phimimg.com';

/**
 * Chuẩn hóa URL ảnh — thêm CDN prefix nếu cần
 */
function normalizeImageUrl(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${IMG_CDN}/${url.replace(/^\//, '')}`;
}

/**
 * Chuẩn hóa 1 item phim (dùng chung cho list + detail)
 */
function normalizeMovieItem(raw) {
  if (!raw) return null;

  return {
    id: raw._id || raw.id || null,
    slug: raw.slug || '',
    title: raw.name || '',
    originalTitle: raw.original_name || raw.origin_name || '',
    poster: normalizeImageUrl(raw.poster_url),
    thumb: normalizeImageUrl(raw.thumb_url),
    year: raw.year || null,
    country: Array.isArray(raw.country)
      ? raw.country.map((c) => (typeof c === 'string' ? c : c.name))
      : [],
    genres: Array.isArray(raw.category)
      ? raw.category.map((g) => (typeof g === 'string' ? g : g.name))
      : [],
    status: raw.status || raw.episode_current || '',
    quality: raw.quality || '',
    language: raw.language || raw.lang || '',
    totalEpisodes: parseInt(raw.episode_total, 10) || 0,
    currentEpisode: raw.episode_current || '',
    duration: raw.time || '',
    modifiedAt: raw.modified?.time || raw.modified_time || null,
  };
}

/**
 * Transform danh sách phim
 * @param {object} rawResponse - response từ NguonC API
 * @returns {{ items: Array, pagination: object }}
 */
function transformMovieList(rawResponse) {
  // NguonC list API trả về: { status, paginate, items }
  const items = Array.isArray(rawResponse?.items)
    ? rawResponse.items.map(normalizeMovieItem).filter(Boolean)
    : [];

  const paginate = rawResponse?.paginate || {};
  const pagination = {
    currentPage: parseInt(paginate.current_page || 1, 10),
    totalPages: parseInt(paginate.total_page || 1, 10),
    totalItems: parseInt(paginate.total_items || items.length, 10),
    itemsPerPage: parseInt(paginate.items_per_page || items.length, 10),
  };

  return { items, pagination };
}

/**
 * Transform chi tiết phim
 * @param {object} rawResponse - response từ NguonC API
 * @returns {object} normalized movie detail
 */
function transformMovieDetail(rawResponse) {
  // NguonC detail API trả về: { status, movie }
  const raw = rawResponse?.movie || rawResponse?.data?.item || rawResponse;

  if (!raw) return null;

  const movie = normalizeMovieItem(raw);

  // Thêm fields chi tiết
  return {
    ...movie,
    description: raw.description || raw.content || '',
    directors: Array.isArray(raw.director) ? raw.director : [],
    actors: Array.isArray(raw.actor) ? raw.actor : [],
    type: raw.type || '',
    showtimes: raw.showtimes || '',
    trailerUrl: raw.trailer_url || null,
    episodes: transformEpisodes(raw.episodes || []),
  };
}

/**
 * Transform danh sách tập phim
 * @param {Array} rawEpisodes - mảng server data từ NguonC
 * @returns {Array<{ serverName: string, items: Array }>}
 */
function transformEpisodes(rawEpisodes) {
  if (!Array.isArray(rawEpisodes)) return [];

  return rawEpisodes.map((server) => ({
    serverName: server.server_name || server.serverName || 'Unknown',
    items: Array.isArray(server.server_data || server.items)
      ? (server.server_data || server.items).map((ep) => ({
          name: ep.name || ep.episode_name || '',
          slug: ep.slug || ep.episode_slug || '',
          embedUrl: ep.link_embed || ep.embed || null,
          m3u8Url: ep.link_m3u8 || ep.m3u8 || null,
        }))
      : [],
  }));
}

module.exports = {
  transformMovieList,
  transformMovieDetail,
  transformEpisodes,
  normalizeMovieItem,
  normalizeImageUrl,
};
