/**
 * Seed Admin & Test Users
 * Chạy khi khởi động server (dev mode) hoặc qua lệnh riêng
 */

const bcrypt = require('bcryptjs');
const logger = require('../utils/logger');

/**
 * Seed initial users nếu bảng trống
 * @param {object} User - User model
 */
async function seedUsers(User) {
  try {
    const count = await User.unscoped().count();
    if (count > 0) {
      logger.debug(`Seed skipped: ${count} users already exist`);
      return;
    }

    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
    const users = [
      {
        username: 'admin',
        email: 'admin@anime3d.local',
        password: adminPassword,
        role: 'admin',
      },
      {
        username: 'testuser1',
        email: 'user1@anime3d.local',
        password: 'User@123',
        role: 'user',
      },
      {
        username: 'testuser2',
        email: 'user2@anime3d.local',
        password: 'User@123',
        role: 'user',
      },
    ];

    // bulkCreate sẽ không trigger hooks (beforeCreate), hash thủ công
    for (const userData of users) {
      await User.create(userData);  // trigger beforeCreate hook → hash password
    }

    logger.info(`✅ Seeded ${users.length} users (admin: admin@anime3d.local)`);
  } catch (error) {
    logger.error({ err: error }, '❌ Failed to seed users');
  }
}

module.exports = { seedUsers };
