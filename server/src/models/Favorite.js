/**
 * Favorite Model
 * Bảng favorites — phim yêu thích của user
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Favorite = sequelize.define('Favorite', {
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
  }, {
    tableName: 'favorites',
    timestamps: true,
    underscored: true,
    updatedAt: false,          // Chỉ cần created_at
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'movie_slug'],
        name: 'unique_favorite',
      },
    ],
  });

  return Favorite;
};
