import axiosInstance from './axiosConfig';

const commentApi = {
  /**
   * Lấy danh sách bình luận của phim
   * @param {string} movieSlug 
   * @param {number} page 
   * @param {number} limit 
   * @returns {Promise}
   */
  getComments: async (movieSlug, page = 1, limit = 20) => {
    return axiosInstance.get(`/comments/${movieSlug}`, {
      params: { page, limit },
    });
  },

  /**
   * Lấy bình luận mới nhất trên toàn hệ thống (cho trang chủ)
   */
  getRecentComments: async (limit = 5) => {
    return axiosInstance.get('/comments/recent', {
      params: { limit },
    });
  },

  /**
   * Tạo mới bình luận (Gốc hoặc Reply)
   * @param {object} payload { movieSlug, content, parentId? }
   */
  createComment: async (payload) => {
    return axiosInstance.post('/comments', payload);
  },

  /**
   * Sửa bình luận
   * @param {number} id 
   * @param {string} content 
   */
  updateComment: async (id, content) => {
    return axiosInstance.put(`/comments/${id}`, { content });
  },

  /**
   * Xoá bình luận
   * @param {number} id 
   */
  deleteComment: async (id) => {
    return axiosInstance.delete(`/comments/${id}`);
  },
};

export default commentApi;
