/**
 * MovieView Model
 * Bảng movie_views — analytics lượt xem phim
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MovieView = sequelize.define('MovieView', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    movieSlug: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'movie_slug',
    },
    userId: {
      type: DataTypes.INTEGER,
      defaultValue: null,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id',
      },
      comment: 'NULL nếu guest',
    },
    sessionId: {
      type: DataTypes.STRING(100),
      defaultValue: null,
      field: 'session_id',
      comment: 'Guest session ID',
    },
    viewedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'viewed_at',
    },
  }, {
    tableName: 'movie_views',
    timestamps: false,
    underscored: true,
    indexes: [
      { fields: ['movie_slug', 'viewed_at'], name: 'idx_movie_date' },
      { fields: ['user_id', 'viewed_at'], name: 'idx_user_date' },
    ],
  });

  return MovieView;
};
