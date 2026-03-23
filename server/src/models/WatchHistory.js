/**
 * WatchHistory Model
 * Bảng watch_history — lịch sử xem + vị trí xem tiếp
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const WatchHistory = sequelize.define('WatchHistory', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id',
      },
    },
    movieSlug: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'movie_slug',
    },
    movieName: {
      type: DataTypes.STRING(500),
      allowNull: false,
      field: 'movie_name',
    },
    movieThumb: {
      type: DataTypes.STRING(500),
      defaultValue: null,
      field: 'movie_thumb',
    },
    episode: {
      type: DataTypes.STRING(50),
      defaultValue: null,
    },
    serverName: {
      type: DataTypes.STRING(100),
      defaultValue: null,
      field: 'server_name',
    },
    duration: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Tổng thời lượng (giây)',
    },
    lastPositionSeconds: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'last_position_seconds',
      comment: 'Vị trí xem tiếp (giây)',
    },
    watchedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'watched_at',
    },
  }, {
    tableName: 'watch_history',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'movie_slug', 'episode'],
        name: 'unique_watch',
      },
      {
        fields: ['user_id', 'watched_at'],
        name: 'idx_user_recent',
      },
    ],
  });

  return WatchHistory;
};
