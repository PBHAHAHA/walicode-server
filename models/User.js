const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: '用户ID'
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '用户名',
      validate: {
        len: [3, 50],
        notEmpty: true
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: '密码',
      validate: {
        len: [6, 255],
        notEmpty: true
      }
    },
    avatar: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: '头像URL',
      defaultValue: null
    },
    nickname: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '昵称',
      validate: {
        len: [0, 100]
      }
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      comment: '邮箱',
      validate: {
        isEmail: true,
        notEmpty: true
      }
    }
  }, {
    tableName: 'users',
    timestamps: true, // 自动添加 createdAt 和 updatedAt
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    hooks: {
      // 创建用户前加密密码
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      // 更新用户前加密密码
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  });

  console.log(User)

  // 实例方法：验证密码
  User.prototype.validatePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
  };
  // 实例方法：生成 JWT Token
  User.prototype.generateToken = function() {
    console.log(this.username, "xxx")
    return jwt.sign(
      { 
        id: this.id, 
        username: this.username,
        email: this.email
      },
      process.env.JWT_SECRET,
      { 
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
      }
    );
  };
  // 实例方法：转换为安全的 JSON 格式（不包含密码）
  User.prototype.toSafeJSON = function() {
    const values = this.toJSON();
    delete values.password;
    return values;
  };

  return User;
}; 