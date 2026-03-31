/**
 * Comment Model
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Comment = sequelize.define('Comment', {
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
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'parent_id',
    },
  }, {
    tableName: 'comments',
    timestamps: true,
    underscored: true,
    paranoid: true,
    indexes: [
      {
        fields: ['movie_slug'],
        name: 'idx_comment_movie',
      },
      {
        fields: ['parent_id'],
        name: 'idx_comment_parent',
      },
    ],
  });

  return Comment;
};
