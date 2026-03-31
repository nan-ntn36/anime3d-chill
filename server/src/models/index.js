/**
 * Models Index
 * Import tất cả models, define associations, export
 */

const { sequelize } = require('../config/database');
const logger = require('../utils/logger');

// Import model definitions
const UserDef = require('./User');
const RefreshTokenDef = require('./RefreshToken');
const FavoriteDef = require('./Favorite');
const WatchHistoryDef = require('./WatchHistory');
const MovieViewDef = require('./MovieView');
const CommentDef = require('./Comment');

// Initialize models
const User = UserDef(sequelize);
const RefreshToken = RefreshTokenDef(sequelize);
const Favorite = FavoriteDef(sequelize);
const WatchHistory = WatchHistoryDef(sequelize);
const MovieView = MovieViewDef(sequelize);
const Comment = CommentDef(sequelize);

// ── Associations ────────────────────────────────────────────

// User → RefreshToken (1:N)
User.hasMany(RefreshToken, {
  foreignKey: 'user_id',
  as: 'refreshTokens',
  onDelete: 'CASCADE',
});
RefreshToken.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

// User → Favorite (1:N)
User.hasMany(Favorite, {
  foreignKey: 'user_id',
  as: 'favorites',
  onDelete: 'CASCADE',
});
Favorite.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

// User → WatchHistory (1:N)
User.hasMany(WatchHistory, {
  foreignKey: 'user_id',
  as: 'watchHistory',
  onDelete: 'CASCADE',
});
WatchHistory.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

// User → MovieView (1:N, nullable)
User.hasMany(MovieView, {
  foreignKey: 'user_id',
  as: 'movieViews',
  onDelete: 'SET NULL',
});
MovieView.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

// User → Comment (1:N)
User.hasMany(Comment, {
  foreignKey: 'user_id',
  as: 'comments',
  onDelete: 'CASCADE',
});
Comment.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

// Comment → Comment (1:N for Replies)
Comment.hasMany(Comment, {
  foreignKey: 'parent_id',
  as: 'replies',
  onDelete: 'CASCADE',
});
Comment.belongsTo(Comment, {
  foreignKey: 'parent_id',
  as: 'parent',
});

/**
 * Sync all models with database
 * @param {object} options - Sequelize sync options
 */
async function syncModels(options = {}) {
  try {
    await sequelize.sync(options);
    logger.info('✅ Database models synced successfully');
  } catch (error) {
    logger.error({ err: error }, '❌ Failed to sync database models');
    throw error;
  }
}

module.exports = {
  sequelize,
  User,
  RefreshToken,
  Favorite,
  WatchHistory,
  MovieView,
  Comment,
  syncModels,
};
