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

module.exports = router;
