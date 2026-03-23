/**
 * Clean Expired Tokens Job
 * Xóa refresh tokens hết hạn hoặc đã revoke > 7 ngày
 */

const { Op } = require('sequelize');
const { RefreshToken } = require('../models');
const logger = require('../utils/logger');

/**
 * Xóa tokens hết hạn/revoke cũ
 * @returns {number} Số token đã xóa
 */
async function cleanExpiredTokens() {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const deleted = await RefreshToken.destroy({
      where: {
        [Op.or]: [
          // Token đã hết hạn
          { expiresAt: { [Op.lt]: new Date() } },
          // Token đã revoke hơn 7 ngày
          {
            revokedAt: {
              [Op.ne]: null,
              [Op.lt]: sevenDaysAgo,
            },
          },
        ],
      },
    });

    logger.info(`🧹 Cleaned ${deleted} expired/revoked refresh tokens`);
    return deleted;
  } catch (error) {
    logger.error({ err: error }, '❌ Failed to clean expired tokens');
    return 0;
  }
}

module.exports = { cleanExpiredTokens };
