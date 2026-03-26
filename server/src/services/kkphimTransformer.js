/**
 * KKPhim Data Transformer
 * Chuẩn hóa dữ liệu thô từ phimapi.com (KKPhim) → format frontend
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
 * KKPhim list API trả về: { status, items, pagination }
 * pagination: { totalItems, totalItemsPerPage, currentPage, totalPages }
 * @param {object} rawResponse - response từ KKPhim API
 * @param {number} [limit] - giới hạn số items trả về (VD: 12)
 * @returns {{ items: Array, pagination: object }}
 */
function transformMovieList(rawResponse, limit) {
  // KKPhim: items ở root, hoặc trong data.items (v1 api endpoint)
  const rawItems = rawResponse?.items
    || rawResponse?.data?.items
    || [];

  let items = Array.isArray(rawItems)
    ? rawItems.map(normalizeMovieItem).filter(Boolean)
    : [];

  // KKPhim pagination: trực tiếp trong root hoặc trong params.pagination hoặc data.params.pagination
  const paginate = rawResponse?.pagination
    || rawResponse?.data?.params?.pagination
    || rawResponse?.params?.pagination
    || {};

  const totalItems = parseInt(paginate.totalItems || paginate.total_items || items.length, 10);
  const originalPerPage = parseInt(paginate.totalItemsPerPage || paginate.items_per_page || items.length, 10);

  // Nếu có limit → slice items và tính lại pagination
  const effectivePerPage = limit || originalPerPage;
  if (limit && items.length > limit) {
    items = items.slice(0, limit);
  }

  const pagination = {
    currentPage: parseInt(paginate.currentPage || paginate.current_page || 1, 10),
    totalPages: effectivePerPage > 0 ? Math.ceil(totalItems / effectivePerPage) : 1,
    totalItems,
    itemsPerPage: effectivePerPage,
  };

  return { items, pagination };
}

/**
 * Transform chi tiết phim
 * KKPhim detail API trả về: { status, movie, episodes }
 * episodes tách riêng khỏi movie object
 * @param {object} rawResponse - response từ KKPhim API
 * @returns {object} normalized movie detail
 */
function transformMovieDetail(rawResponse) {
  // KKPhim: movie ở root, episodes tách riêng
  const raw = rawResponse?.movie || rawResponse?.data?.item || rawResponse;
  const rawEpisodes = rawResponse?.episodes || raw?.episodes || [];

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
    episodes: transformEpisodes(rawEpisodes),
  };
}

/**
 * Transform danh sách tập phim
 * KKPhim episode format: { server_name, server_data: [{ name, slug, link_embed, link_m3u8 }] }
 * @param {Array} rawEpisodes - mảng server data từ KKPhim
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
