/**
 * 分页中间件使用示例
 * 本文件展示了如何在不同场景下使用分页中间件
 */

const express = require('express');
const router = express.Router();
const pagination = require('../middleware/pagination');
const { User, Post, Comment } = require('../models'); // 假设这些是你的模型

/**
 * 示例1: 基本用法
 * 使用默认配置的分页中间件
 */
router.get('/users', pagination(), async (req, res) => {
  try {
    // 获取分页选项
    const options = req.getPaginationOptions();
    
    // 使用分页选项进行查询
    const { count, rows } = await User.findAndCountAll(options);
    
    // 返回结果，包含分页信息
    res.json({
      success: true,
      data: {
        users: rows,
        ...req.getPaginationData(count)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 示例2: 自定义配置
 * 设置不同的默认值和最大限制
 */
router.get('/posts', pagination({
  defaultPage: 1,
  defaultLimit: 20,
  maxLimit: 50,
  defaultSort: 'updated_at',
  defaultOrder: 'desc'
}), async (req, res) => {
  try {
    const options = req.getPaginationOptions();
    const { count, rows } = await Post.findAndCountAll(options);
    
    res.json({
      success: true,
      data: {
        posts: rows,
        ...req.getPaginationData(count)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 示例3: 添加额外的查询条件
 * 结合分页和筛选条件
 */
router.get('/comments', pagination(), async (req, res) => {
  try {
    const { post_id, user_id, status } = req.query;
    
    // 构建查询条件
    const where = {};
    if (post_id) where.post_id = post_id;
    if (user_id) where.user_id = user_id;
    if (status) where.status = status;
    
    // 获取分页选项并添加查询条件
    const options = {
      ...req.getPaginationOptions(),
      where
    };
    
    const { count, rows } = await Comment.findAndCountAll(options);
    
    res.json({
      success: true,
      data: {
        comments: rows,
        ...req.getPaginationData(count)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 示例4: 自定义排序
 * 覆盖默认排序设置
 */
router.get('/trending-posts', pagination(), async (req, res) => {
  try {
    // 获取基本分页选项
    const options = req.getPaginationOptions();
    
    // 自定义排序 - 先按热度排序，再按创建时间排序
    options.order = [
      ['view_count', 'DESC'],
      ['likes', 'DESC'],
      ['created_at', 'DESC']
    ];
    
    const { count, rows } = await Post.findAndCountAll(options);
    
    res.json({
      success: true,
      data: {
        posts: rows,
        ...req.getPaginationData(count)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 示例5: 包含关联数据
 * 结合分页和关联查询
 */
router.get('/posts-with-comments', pagination(), async (req, res) => {
  try {
    const options = {
      ...req.getPaginationOptions(),
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'avatar']
        },
        {
          model: Comment,
          as: 'comments',
          attributes: ['id', 'content', 'created_at'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'avatar']
            }
          ]
        }
      ]
    };
    
    const { count, rows } = await Post.findAndCountAll({
      ...options,
      distinct: true // 使用distinct确保计数正确
    });
    
    res.json({
      success: true,
      data: {
        posts: rows,
        ...req.getPaginationData(count)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 示例6: 使用前端URL参数
 * 
 * 前端请求示例:
 * GET /api/search?q=关键词&page=2&limit=15&sort=relevance:desc
 */
router.get('/search', pagination(), async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ 
        success: false, 
        message: '请提供搜索关键词' 
      });
    }
    
    // 构建搜索条件
    const options = {
      ...req.getPaginationOptions(),
      where: {
        // 使用Sequelize的模糊查询
        [Op.or]: [
          { title: { [Op.like]: `%${q}%` } },
          { content: { [Op.like]: `%${q}%` } }
        ]
      }
    };
    
    const { count, rows } = await Post.findAndCountAll(options);
    
    res.json({
      success: true,
      data: {
        query: q,
        posts: rows,
        ...req.getPaginationData(count)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

/**
 * 使用示例 - 客户端请求
 * 
 * 基本分页:
 * GET /api/users?page=1&limit=10
 * 
 * 带排序的分页:
 * GET /api/users?page=2&limit=20&sort=username:asc
 * 
 * 带筛选的分页:
 * GET /api/comments?post_id=123&page=1&limit=50
 * 
 * 搜索带分页:
 * GET /api/search?q=关键词&page=1&limit=10&sort=relevance:desc
 */ 