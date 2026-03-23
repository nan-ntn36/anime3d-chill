/**
 * RefreshToken Model
 * Bảng refresh_tokens — lưu trữ token đã hash + thông tin thiết bị
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const RefreshToken = sequelize.define('RefreshToken', {
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
    tokenHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'token_hash',
    },
    userAgent: {
      type: DataTypes.STRING(500),
      defaultValue: null,
      field: 'user_agent',
    },
    ipAddress: {
      type: DataTypes.STRING(45),
      defaultValue: null,
      field: 'ip_address',
    },
    deviceInfo: {
      type: DataTypes.STRING(255),
      defaultValue: null,
      field: 'device_info',
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'expires_at',
    },
    revokedAt: {
      type: DataTypes.DATE,
      defaultValue: null,
      field: 'revoked_at',
    },
  }, {
    tableName: 'refresh_tokens',
    timestamps: true,
    underscored: true,
    updatedAt: false,          // Chỉ có created_at, không cần updated_at
    indexes: [
      { fields: ['token_hash'], length: { token_hash: 64 } },
      { fields: ['user_id', 'revoked_at'] },
    ],
  });

  // ── Instance Methods ────────────────────────────────────
  RefreshToken.prototype.isExpired = function () {
    return new Date(this.expiresAt) < new Date();
  };

  RefreshToken.prototype.isRevoked = function () {
    return this.revokedAt !== null;
  };

  return RefreshToken;
};
