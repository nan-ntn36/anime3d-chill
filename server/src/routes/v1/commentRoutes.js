/**
 * Comment Routes
 * /api/v1/comments
 */

const express = require('express');
const router = express.Router();

const { authenticate } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const {
  createCommentValidation,
  updateCommentValidation,
} = require('../../validators/commentValidators');
const commentController = require('../../controllers/commentController');

// ── Rate Limiter ──
// Chống spam: 1 IP chỉ được đăng 5 comment / 2 phút.
const rateLimit = require('express-rate-limit');
const commentLimiter = rateLimit({
  windowMs: 2 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    error: {
      message: 'Bạn đã đăng quá nhiều bình luận. Vui lòng thử lại sau ít phút.',
      code: 'RATE_LIMIT_EXCEEDED',
    },
  },
});

// GET /api/v1/comments/recent - Lấy bình luận mới nhất (trang Home)
router.get('/recent', commentController.getRecentComments);

// GET /api/v1/comments/:movieSlug - Lấy danh sách bình luận (Public)
router.get('/:movieSlug', commentController.getMovieComments);

// POST /api/v1/comments/ - Đăng bình luận mới
router.post(
  '/',
  authenticate,          // Phải login mới được comment
  commentLimiter,        // Chống spam
  validate(createCommentValidation), // Validate field
  commentController.createComment
);

// PUT /api/v1/comments/:id - Sửa bình luận
router.put(
  '/:id',
  authenticate,
  validate(updateCommentValidation),
  commentController.updateComment
);

// DELETE /api/v1/comments/:id - Xóa bình luận
router.delete('/:id', authenticate, commentController.deleteComment);

module.exports = router;
