const express = require('express');
const router = express.Router();
const { Article, Tag, Category } = require('../models/index');
const { Op } = require('sequelize');
const pagination = require('../middleware/pagination');

// 创建文章
router.post('/create', async (req, res) => {
  try {
    const { title, description, content, category_id, tag_ids, is_published, is_top, cover_image } = req.body;
    
    // 创建文章
    const article = await Article.create({
      title,
      description,
      content,
      category_id,
      is_published: is_published || false,
      is_top: is_top || false,
      cover_image
    });

    // 如果有标签ID，建立关联关系
    if (tag_ids && tag_ids.length > 0) {
      const tags = await Tag.findAll({
        where: {
          id: {
            [Op.in]: tag_ids
          }
        }
      });
      await article.setTags(tags);
    }

    // 返回创建的文章（包含关联数据）
    const createdArticle = await Article.findByPk(article.id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        },
        {
          model: Tag,
          as: 'tags',
          attributes: ['id', 'name'],
          through: { attributes: [] }
        }
      ]
    });

    res.json({
      success: true,
      message: '文章创建成功',
      data: createdArticle
    });
  } catch (error) {
    console.error('创建文章失败:', error);
    res.status(500).json({
      success: false,
      message: '创建文章失败',
      error: error.message
    });
  }
});

// 获取文章列表 - 使用分页中间件
router.get('/list', pagination(), async (req, res) => {
  try {
    const { 
      category_id, 
      tag_id, 
      is_published, 
      is_top, 
      is_hot,
      keyword 
    } = req.query;

    const where = {};

    // 筛选条件
    if (category_id) where.category_id = category_id;
    if (is_published !== undefined) where.is_published = is_published === 'true';
    if (is_top !== undefined) where.is_top = is_top === 'true';
    if (is_hot !== undefined) where.is_hot = is_hot === 'true';
    if (keyword) {
      where[Op.or] = [
        { title: { [Op.like]: `%${keyword}%` } },
        { description: { [Op.like]: `%${keyword}%` } }
      ];
    }

    const include = [
      {
        model: Category,
        as: 'category',
        attributes: ['id', 'name']
      },
      {
        model: Tag,
        as: 'tags',
        attributes: ['id', 'name'],
        through: { attributes: [] }
      }
    ];

    // 如果按标签筛选
    if (tag_id) {
      include[1].where = { id: tag_id };
    }

    // 获取分页查询选项
    const paginationOptions = req.getPaginationOptions();
    
    // 自定义排序 - 置顶文章优先
    paginationOptions.order = [
      ['is_top', 'DESC'],
      [req.pagination.sort, req.pagination.order]
    ];

    const { count, rows } = await Article.findAndCountAll({
      where,
      include,
      ...paginationOptions,
      distinct: true
    });

    res.json({
      success: true,
      data: {
        articles: rows,
        ...req.getPaginationData(count)
      }
    });
  } catch (error) {
    console.error('获取文章列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取文章列表失败',
      error: error.message
    });
  }
});

// 获取文章详情
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const article = await Article.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        },
        {
          model: Tag,
          as: 'tags',
          attributes: ['id', 'name'],
          through: { attributes: [] }
        }
      ]
    });

    if (!article) {
      return res.status(404).json({
        success: false,
        message: '文章不存在'
      });
    }

    // 增加浏览量
    await article.increment('view_count');

    res.json({
      success: true,
      data: article
    });
  } catch (error) {
    console.error('获取文章详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取文章详情失败',
      error: error.message
    });
  }
});

// 更新文章
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, content, category_id, tag_ids, is_published, is_top, cover_image, is_hot } = req.body;

    const article = await Article.findByPk(id);
    if (!article) {
      return res.status(404).json({
        success: false,
        message: '文章不存在'
      });
    }

    // 更新文章基本信息
    await article.update({
      title: title || article.title,
      description: description !== undefined ? description : article.description,
      content: content || article.content,
      category_id: category_id || article.category_id,
      is_published: is_published !== undefined ? is_published : article.is_published,
      is_top: is_top !== undefined ? is_top : article.is_top,
      cover_image: cover_image !== undefined ? cover_image : article.cover_image,
      is_hot: is_hot !== undefined ? is_hot : article.is_hot
    });

    // 更新标签关联
    if (tag_ids !== undefined) {
      if (tag_ids.length > 0) {
        const tags = await Tag.findAll({
          where: {
            id: {
              [Op.in]: tag_ids
            }
          }
        });
        await article.setTags(tags);
      } else {
        await article.setTags([]);
      }
    }

    // 返回更新后的文章
    const updatedArticle = await Article.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        },
        {
          model: Tag,
          as: 'tags',
          attributes: ['id', 'name'],
          through: { attributes: [] }
        }
      ]
    });

    res.json({
      success: true,
      message: '文章更新成功',
      data: updatedArticle
    });
  } catch (error) {
    console.error('更新文章失败:', error);
    res.status(500).json({
      success: false,
      message: '更新文章失败',
      error: error.message
    });
  }
});

// 删除文章
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const article = await Article.findByPk(id);
    if (!article) {
      return res.status(404).json({
        success: false,
        message: '文章不存在'
      });
    }

    // 删除文章（会自动删除关联表中的记录）
    await article.destroy();

    res.json({
      success: true,
      message: '文章删除成功'
    });
  } catch (error) {
    console.error('删除文章失败:', error);
    res.status(500).json({
      success: false,
      message: '删除文章失败',
      error: error.message
    });
  }
});

// 批量删除文章
router.delete('/batch/:ids', async (req, res) => {
  try {
    const { ids } = req.params;
    const articleIds = ids.split(',').map(id => parseInt(id));

    const deletedCount = await Article.destroy({
      where: {
        id: {
          [Op.in]: articleIds
        }
      }
    });

    res.json({
      success: true,
      message: `成功删除 ${deletedCount} 篇文章`
    });
  } catch (error) {
    console.error('批量删除文章失败:', error);
    res.status(500).json({
      success: false,
      message: '批量删除文章失败',
      error: error.message
    });
  }
});

// 切换文章发布状态
router.patch('/:id/toggle-publish', async (req, res) => {
  try {
    const { id } = req.params;

    const article = await Article.findByPk(id);
    if (!article) {
      return res.status(404).json({
        success: false,
        message: '文章不存在'
      });
    }

    await article.update({
      is_published: !article.is_published
    });

    res.json({
      success: true,
      message: `文章已${article.is_published ? '发布' : '取消发布'}`,
      data: { is_published: article.is_published }
    });
  } catch (error) {
    console.error('切换发布状态失败:', error);
    res.status(500).json({
      success: false,
      message: '切换发布状态失败',
      error: error.message
    });
  }
});

// 切换文章置顶状态
router.patch('/:id/toggle-top', async (req, res) => {
  try {
    const { id } = req.params;

    const article = await Article.findByPk(id);
    if (!article) {
      return res.status(404).json({
        success: false,
        message: '文章不存在'
      });
    }

    await article.update({
      is_top: !article.is_top
    });

    res.json({
      success: true,
      message: `文章已${article.is_top ? '置顶' : '取消置顶'}`,
      data: { is_top: article.is_top }
    });
  } catch (error) {
    console.error('切换置顶状态失败:', error);
    res.status(500).json({
      success: false,
      message: '切换置顶状态失败',
      error: error.message
    });
  }
});

// 切换文章热门状态
router.patch('/:id/toggle-hot', async (req, res) => {
  try {
    const { id } = req.params;

    const article = await Article.findByPk(id);
    if (!article) {
      return res.status(404).json({
        success: false,
        message: '文章不存在'
      });
    }

    await article.update({
      is_hot: !article.is_hot
    });

    res.json({
      success: true,
      message: `文章已${article.is_hot ? '设为热门' : '取消热门'}`,
      data: { is_hot: article.is_hot }
    });
  } catch (error) {
    console.error('切换热门状态失败:', error);
    res.status(500).json({
      success: false,
      message: '切换热门状态失败',
      error: error.message
    });
  }
});

module.exports = router;