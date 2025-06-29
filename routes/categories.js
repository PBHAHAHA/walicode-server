const express = require('express');
const router = express.Router();
const { Category, Article } = require('../models/index');
const { Op } = require('sequelize');
const pagination = require('../middleware/pagination');

// 获取分类列表 - 使用分页中间件
router.get('/list', pagination(), async (req, res) => {
  try {
    const { keyword, include_articles } = req.query;
    
    // 构建查询条件
    const where = {};
    // 如果提供了关键词，则在分类名称和描述中进行模糊搜索
    if (keyword) {
      where[Op.or] = [
        { name: { [Op.like]: `%${keyword}%` } },        // 在分类名称中搜索
        { description: { [Op.like]: `%${keyword}%` } }  // 在分类描述中搜索
      ];
    }

    // 获取分页选项
    const paginationOptions = req.getPaginationOptions();

    // 构建查询选项
    const queryOptions = {
      where,
      ...paginationOptions
    };

    // 如果需要包含文章信息
    if (include_articles === 'true') {
      queryOptions.include = [
        {
          model: Article,
          as: 'articles',
          attributes: ['id', 'title', 'is_published', 'created_at'],
          required: false // LEFT JOIN，即使没有文章也显示分类
        }
      ];
    }

    const { count, rows } = await Category.findAndCountAll(queryOptions);

    res.json({
      success: true,
      data: {
        categories: rows,
        ...req.getPaginationData(count)
      },
      message: '获取分类列表成功'
    });
  } catch (error) {
    console.error('获取分类列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取分类列表失败',
      error: error.message
    });
  }
});

// 获取所有分类 - 不分页，用于下拉选择等场景
router.get('/all', async (req, res) => {
  try {
    const categories = await Category.findAll({
      attributes: ['id', 'name', 'description'],
      order: [['name', 'ASC']]
    });
    
    res.json({
      success: true,
      data: categories,
      message: '获取所有分类成功'
    });
  } catch (error) {
    console.error('获取所有分类失败:', error);
    res.status(500).json({
      success: false,
      message: '获取所有分类失败',
      error: error.message
    });
  }
});

// 获取分类详情
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { include_articles } = req.query;

    const queryOptions = {
      where: { id }
    };

    // 如果需要包含文章信息
    if (include_articles === 'true') {
      queryOptions.include = [
        {
          model: Article,
          as: 'articles',
          attributes: ['id', 'title', 'description', 'is_published', 'view_count', 'created_at'],
          order: [['created_at', 'DESC']]
        }
      ];
    }

    const category = await Category.findOne(queryOptions);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: '分类不存在'
      });
    }

    res.json({
      success: true,
      data: category,
      message: '获取分类详情成功'
    });
  } catch (error) {
    console.error('获取分类详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取分类详情失败',
      error: error.message
    });
  }
});

// 创建新分类
router.post('/create', async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: '分类名称不能为空'
      });
    }

    // 检查分类名称是否已存在
    const existingCategory = await Category.findOne({ where: { name } });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: '分类名称已存在'
      });
    }

    const category = await Category.create({
      name: name.trim(),
      description: description ? description.trim() : null
    });

    res.json({
      success: true,  
      data: category,
      message: '创建分类成功'
    });
  } catch (error) {
    console.error('创建分类失败:', error);
    res.status(500).json({
      success: false,
      message: '创建分类失败',  
      error: error.message
    });
  }
});

// 更新分类
router.post('/update', async (req, res) => {
  try {
    const { id, name, description } = req.body;
    
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: '分类不存在'
      });
    }

    if (!name) {
      return res.status(400).json({
        success: false,
        message: '分类名称不能为空'
      });
    }

    // 检查分类名称是否已被其他分类使用
    const existingCategory = await Category.findOne({ 
      where: { 
        name: name.trim(),
        id: { [Op.ne]: id } // 排除当前分类
      } 
    });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: '分类名称已存在'
      });
    }

    await category.update({
      name: name.trim(),
      description: description ? description.trim() : null
    });

    res.json({
      success: true,
      data: category,
      message: '修改分类成功'
    });
  } catch (error) {
    console.error('修改分类失败:', error);
    res.status(500).json({
      success: false,
      message: '修改分类失败',
      error: error.message
    });
  }
});

// 删除分类
router.post('/delete', async (req, res) => {
  try {
    const { id } = req.body;
    
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: '分类不存在'
      });
    }

    // 检查是否有文章使用此分类
    const articleCount = await Article.count({ where: { category_id: id } });
    if (articleCount > 0) {
      return res.status(400).json({
        success: false,
        message: `无法删除分类，还有 ${articleCount} 篇文章使用此分类`
      });
    }

    await category.destroy();
    
    res.json({
      success: true,
      message: '删除分类成功'
    });
  } catch (error) {
    console.error('删除分类失败:', error);
    res.status(500).json({
      success: false,
      message: '删除分类失败',
      error: error.message
    });
  }
});

// 批量删除分类
router.post('/batch-delete', async (req, res) => {
  try {
    const { ids } = req.body;
    const categoryIds = ids.map(id => parseInt(id));

    // 检查所有分类是否都存在
    const categories = await Category.findAll({
      where: { id: { [Op.in]: categoryIds } }
    });

    if (categories.length !== categoryIds.length) {
      return res.status(404).json({
        success: false,
        message: '部分分类不存在'
      });
    }

    // 检查是否有文章使用这些分类
    const articleCount = await Article.count({ 
      where: { category_id: { [Op.in]: categoryIds } } 
    });
    
    if (articleCount > 0) {
      return res.status(400).json({
        success: false,
        message: `无法删除分类，还有 ${articleCount} 篇文章使用这些分类`
      });
    }

    const deletedCount = await Category.destroy({
      where: { id: { [Op.in]: categoryIds } }
    });

    res.json({
      success: true,
      message: `成功删除 ${deletedCount} 个分类`
    });
  } catch (error) {
    console.error('批量删除分类失败:', error);
    res.status(500).json({
      success: false,
      message: '批量删除分类失败',
      error: error.message
    });
  }
});

// 获取分类统计信息
router.get('/stats/summary', async (req, res) => {
  try {
    const categories = await Category.findAll({
      include: [
        {
          model: Article,
          as: 'articles',
          attributes: [],
          required: false
        }
      ],
      attributes: [
        'id',
        'name',
        'description',
        'created_at',
        [
          // 计算每个分类下的文章数量
          Category.sequelize.fn('COUNT', Category.sequelize.col('articles.id')),
          'article_count'
        ]
      ],
      group: ['Category.id'],
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: categories,
      message: '获取分类统计成功'
    });
  } catch (error) {
    console.error('获取分类统计失败:', error);
    res.status(500).json({
      success: false,
      message: '获取分类统计失败',
      error: error.message
    });
  }
});

module.exports = router;