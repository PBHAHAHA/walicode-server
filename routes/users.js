const express = require('express');
const router = express.Router();
const { User } = require('../models/index');
const { authenticateToken } = require('../middleware/auth');

/**
 * 获取所有用户列表
 * GET /users
 */
router.get('/', async (req, res) => {
  try {
    // 查询所有用户，排除密码字段
    const users = await User.findAll({
      attributes: { exclude: ['password'] } // 排除密码字段
    });
    
    
    // 返回成功响应
    res.json({
      success: true,
      data: users,
      message: '获取用户列表成功'
    });
  } catch (error) {
    // 返回错误响应
    res.status(500).json({
      success: false,
      message: '获取用户列表失败',
      error: error.message
    });
  }
});

/**
 * 根据ID获取单个用户信息
 * GET /users/:id
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    // 根据主键查找用户，排除密码字段
    console.log(req.params.id)
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });
    
    // 检查用户是否存在
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }
    
    // 返回用户信息
    res.json({
      success: true,
      data: user,
      message: '获取用户信息成功'
    });
  } catch (error) {
    // 返回错误响应
    res.status(500).json({
      success: false,
      message: '获取用户信息失败',
      error: error.message
    });
  }
});

/**
 * 创建新用户
 * POST /users
 */
router.post('/register', async (req, res) => {
  try {
    // 从请求体中解构用户数据
    const { username, password, email, nickname } = req.body;
    
    // 验证必填字段
    if (!username || !password || !email) {
      return res.status(400).json({
        success: false,
        message: '用户名、密码和邮箱为必填字段'
      });
    }
    
    // 检查用户名是否已存在
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: '用户名已存在'
      });
    }
    
    // 检查邮箱是否已存在
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: '邮箱已存在'
      });
    }
    
    // 创建新用户（密码会在模型的钩子中自动加密）
    const user = await User.create({
      username,
      password,
      email,
      nickname
    });
    
    // 返回创建成功响应，使用安全的JSON格式（不包含密码）
    res.status(200).json({
      success: true,
      data: user.toSafeJSON(),
      message: '用户创建成功'
    });
  } catch (error) {
    // 返回错误响应
    res.status(500).json({
      success: false,
      message: '用户创建失败',
      error: error.message
    });
  }
});

/**
 * 更新用户信息
 * PUT /users/:id
 */
router.put('/:id', async (req, res) => {
  try {
    // 从请求体中解构用户数据
    const { username, password, email, nickname, avatar } = req.body;
    
    // 查找要更新的用户
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }
    
    // 检查用户名是否被其他用户使用
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: '用户名已存在'
        });
      }
    }
    
    // 检查邮箱是否被其他用户使用
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: '邮箱已存在'
        });
      }
    }
    
    // 更新用户信息（密码如有更改会在模型的钩子中自动加密）
    await user.update({
      username: username || user.username,
      password: password || user.password,
      email: email || user.email,
      nickname: nickname !== undefined ? nickname : user.nickname,
      avatar: avatar !== undefined ? avatar : user.avatar
    });
    
    // 返回更新成功响应
    res.json({
      success: true,
      data: user.toSafeJSON(),
      message: '用户更新成功'
    });
  } catch (error) {
    // 返回错误响应
    res.status(500).json({
      success: false,
      message: '用户更新失败',
      error: error.message
    });
  }
});

/**
 * 删除用户
 * DELETE /users/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    // 查找要删除的用户
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }
    
    // 删除用户
    await user.destroy();
    
    // 返回删除成功响应
    res.json({
      success: true,
      message: '用户删除成功'
    });
  } catch (error) {
    // 返回错误响应
    res.status(500).json({
      success: false,
      message: '用户删除失败',
      error: error.message
    });
  }
});

/**
 * 用户登录验证
 * POST /users/login
 */
router.post('/login', async (req, res) => {
  try {
    // 从请求体中获取登录凭据
    const { username, password } = req.body;
    
    // 验证必填字段
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: '用户名和密码为必填字段'
      });
    }
    
    // 根据用户名查找用户
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }
    
    // 验证密码是否正确
    const isValid = await user.validatePassword(password);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    const token = user.generateToken();
    
    // 登录成功，返回用户信息（不包含密码）
    res.json({
      success: true,
      data: {
        user: user.toSafeJSON(),
        token: token
      },
      message: '登录成功'
    });
  } catch (error) {
    // 返回错误响应
    res.status(500).json({
      success: false,
      message: '登录失败',
      error: error.message
    });
  }
});

// 导出路由模块
module.exports = router;