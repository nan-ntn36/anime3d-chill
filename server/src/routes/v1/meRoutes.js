const express = require('express');
const { authenticate } = require('../../middleware/auth');
const meController = require('../../controllers/meController');

const router = express.Router();

/**
 * Route: /api/v1/me/history
 * Quản lý lịch sử xem phim cá nhân (Cần auth)
 */
router
  .route('/history')
  .get(authenticate, meController.getHistory)
  .post(authenticate, meController.saveHistory);

/**
 * Đồng bộ batch lịch sử từ client (localStorage)
 */
router.post('/history/sync', authenticate, meController.syncHistory);

/**
 * Route: /api/v1/me/favorites
 */
router
  .route('/favorites')
  .get(authenticate, meController.getFavorites)
  .post(authenticate, meController.addFavorite);

router.delete('/favorites/:movieSlug', authenticate, meController.removeFavorite);

const validate = require('../../middleware/validate');
const { updateProfileValidation } = require('../../validators/userValidators');

/**
 * Route: /api/v1/me/profile
 */
router.patch('/profile', authenticate, validate(updateProfileValidation), meController.updateProfile);

module.exports = router;
