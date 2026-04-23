const { DataTypes, Model } = require('sequelize');

class User extends Model {}

function defineUserModel(sequelize) {
  User.init(
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      mobile: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      role: {
        type: DataTypes.STRING,
        allowNull: false
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: ''
      },
      focus: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: ''
      },
      bio: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: ''
      },
      passwordHash: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'password_hash'
      }
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      underscored: true,
      timestamps: true
    }
  );

  return User;
}

function toPlainUser(user) {
  if (!user) {
    return null;
  }
  return typeof user.get === 'function' ? user.get({ plain: true }) : { ...user };
}

function sanitizeUser(user) {
  const plainUser = toPlainUser(user);
  if (!plainUser) {
    return null;
  }
  const { passwordHash, ...safeUser } = plainUser;
  return safeUser;
}

function mergeUser(current, patch = {}) {
  const base = toPlainUser(current) || {};
  return {
    ...base,
    ...patch,
    name: patch.name || base.name,
    mobile: patch.mobile || base.mobile,
    email: patch.email || base.email,
    role: patch.role || base.role,
    phone: patch.phone || base.phone || '',
    focus: patch.focus || base.focus || '',
    bio: patch.bio || base.bio || '',
    passwordHash: patch.passwordHash || base.passwordHash
  };
}

module.exports = {
  User,
  defineUserModel,
  toPlainUser,
  sanitizeUser,
  mergeUser
};


