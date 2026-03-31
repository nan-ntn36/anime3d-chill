/**
 * Comment Controller
 * Xử lý logic đọc, tạo, sửa, xóa bình luận của phim
 */

const { Comment, User } = require('../models');
const { AppError } = require('../middleware/errorHandler');
const { sendSuccess } = require('../utils/response');
const logger = require('../utils/logger');

/**
 * Lấy bình luận mới nhất trên toàn hệ thống
 * @route GET /api/v1/comments/recent
 */
exports.getRecentComments = async (req, res, next) => {
  try {
    let { limit = 5 } = req.query;
    limit = parseInt(limit, 10);

    const comments = await Comment.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'role', 'avatar'],
        }
      ],
      order: [['createdAt', 'DESC']], // Lấy list comment mới nhất up to now
      limit,
    });

    return sendSuccess(res, comments);
  } catch (error) {
    logger.error('Error fetching recent comments:', error);
    next(new AppError(500, 'Lỗi hệ thống khi tải bình luận mới nhất'));
  }
};

/**
 * Láy danh sách bình luận của 1 phim
 * @route GET /api/v1/comments/:movieSlug
 */
exports.getMovieComments = async (req, res, next) => {
  try {
    const { movieSlug } = req.params;
    let { page = 1, limit = 20 } = req.query;
    
    page = parseInt(page, 10);
    limit = parseInt(limit, 10);
    const offset = (page - 1) * limit;

    // Lấy các bình luận GỐC (parentId = null)
    const { count, rows: comments } = await Comment.findAndCountAll({
      where: { movieSlug, parentId: null },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'role', 'avatar'],
        },
        // Include list replies trực tiếp
        {
          model: Comment,
          as: 'replies',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'role', 'avatar'],
            }
          ],
          required: false, // Dù không có reply vẫn lấy
        }
      ],
      order: [['createdAt', 'DESC']], // Mới nhất lên đầu
      limit,
      offset,
      distinct: true, // Không đếm dư do include
    });

    const totalPages = Math.ceil(count / limit);

    return sendSuccess(res, {
      items: comments,
      pagination: {
        totalItems: count,
        totalPages,
        currentPage: page,
        itemsPerPage: limit,
      },
    });

  } catch (error) {
    logger.error({ err: error }, 'Error fetching comments');
    next(new AppError('Không thể lấy danh sách bình luận', 500));
  }
};

/**
 * Đăng bình luận mới
 * @route POST /api/v1/comments
 */
exports.createComment = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { movieSlug, content, parentId } = req.body;

    // Nếu có parentId, check parent có tồn tại không
    if (parentId) {
      const parent = await Comment.findByPk(parentId);
      if (!parent) {
        return next(new AppError('Bình luận gốc không tồn tại', 404));
      }
      // Không cho phép reply đa cấp sâu dằng dặc (giới hạn 1 cấp).
      // Nếu parent có parentId, biến comment mới thành reply cho parentId gốc
      if (parent.parentId) {
        return next(new AppError('Không hỗ trợ trả lời đa cấp sâu', 400));
      }
    }

    const newComment = await Comment.create({
      userId,
      movieSlug,
      content,
      parentId: parentId || null,
    });

    // Lấy lại kèm User để frontend tiện hiển thị luôn
    const commentWithUser = await Comment.findByPk(newComment.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'role', 'avatar'],
        }
      ]
    });

    return sendSuccess(res, commentWithUser, 201);
  } catch (error) {
    logger.error({ err: error, body: req.body }, 'Error creating comment');
    next(new AppError('Lỗi khi đăng bình luận', 500));
  }
};

/**
 * Cập nhật bình luận
 * @route PUT /api/v1/comments/:id
 */
exports.updateComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role; // Giả sử model có role

    const comment = await Comment.findByPk(id);

    if (!comment) {
      return next(new AppError('Không tìm thấy bình luận', 404));
    }

    // Kiểm tra quyền: Chỉ chủ sở hữu hoặc admin mới sửa được
    if (comment.userId !== userId && userRole !== 'admin') {
      return next(new AppError('Không có quyền sửa bình luận này', 403));
    }

    comment.content = content;
    await comment.save();

    return sendSuccess(res, comment);
  } catch (error) {
    logger.error({ err: error }, 'Error updating comment');
    next(new AppError('Lỗi khi cập nhật bình luận', 500));
  }
};

/**
 * Xóa bình luận
 * @route DELETE /api/v1/comments/:id
 */
exports.deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const comment = await Comment.findByPk(id);

    if (!comment) {
      return next(new AppError('Không tìm thấy bình luận', 404));
    }

    // Kiểm tra quyền
    if (comment.userId !== userId && userRole !== 'admin') {
      return next(new AppError('Không có quyền xoá bình luận này', 403));
    }

    await comment.destroy(); // Soft delete

    return sendSuccess(res, { message: 'Xóa bình luận thành công' });
  } catch (error) {
    logger.error({ err: error }, 'Error deleting comment');
    next(new AppError('Lỗi khi xóa bình luận', 500));
  }
};
