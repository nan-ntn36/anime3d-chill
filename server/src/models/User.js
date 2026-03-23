/**
 * User Model
 * Bảng users — quản lý tài khoản người dùng
 */

const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: {
        msg: 'Username đã tồn tại',
      },
      validate: {
        len: {
          args: [3, 50],
          msg: 'Username phải từ 3-50 ký tự',
        },
        is: {
          args: /^[a-zA-Z0-9_]+$/,
          msg: 'Username chỉ chứa chữ cái, số và dấu gạch dưới',
        },
      },
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: {
        msg: 'Email đã tồn tại',
      },
      validate: {
        isEmail: {
          msg: 'Email không hợp lệ',
        },
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('user', 'admin'),
      defaultValue: 'user',
    },
    avatar: {
      type: DataTypes.STRING(500),
      defaultValue: null,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active',
    },
    loginAttempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'login_attempts',
    },
    lockedUntil: {
      type: DataTypes.DATE,
      defaultValue: null,
      field: 'locked_until',
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      defaultValue: null,
      field: 'last_login_at',
    },
    deletedAt: {
      type: DataTypes.DATE,
      defaultValue: null,
      field: 'deleted_at',
    },
  }, {
    tableName: 'users',
    timestamps: true,
    underscored: true,
    paranoid: false,   // Dùng deletedAt thủ công thay vì paranoid mode
    defaultScope: {
      attributes: { exclude: ['password', 'deletedAt'] },
    },
    scopes: {
      withPassword: {
        attributes: { include: ['password'] },
      },
      withAll: {
        attributes: {},
      },
    },
    indexes: [
      { fields: ['email'] },
      { fields: ['username'] },
    ],
  });

  // ── Hooks ───────────────────────────────────────────────
  User.beforeCreate(async (user) => {
    if (user.password) {
      user.password = await bcrypt.hash(user.password, 12);
    }
  });

  User.beforeUpdate(async (user) => {
    if (user.changed('password')) {
      user.password = await bcrypt.hash(user.password, 12);
    }
  });

  // ── Instance Methods ────────────────────────────────────
  User.prototype.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  };

  User.prototype.isLocked = function () {
    return this.lockedUntil && new Date(this.lockedUntil) > new Date();
  };

  User.prototype.toSafeJSON = function () {
    const values = this.toJSON();
    delete values.password;
    delete values.deletedAt;
    delete values.loginAttempts;
    delete values.lockedUntil;
    return values;
  };

  return User;
};
