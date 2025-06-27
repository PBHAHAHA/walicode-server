const express = require('express');
const router = express.Router();
const { Tag } = require('../models/index');

router.get('/', async (req, res) => {
  try {
    const tags = await Tag.findAll();
    res.json({
      success: true,
      data: tags,
      message: '获取标签列表成功'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取标签列表失败',
      error: error.message
    })
  }
})

// 创建标签
router.post('/create', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({
        success: false,
        message: '标签名称不能为空'
      })
    }
    const tag = await Tag.create({
      name
    })
    res.json({
      success: true,
      data: tag,
      message: '创建标签成功'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '创建标签失败',
      error: error.message
    })
  }
})  

// 修改标签
router.post('/update', async (req, res) => {
  try {
    const { id, name } = req.body;
    const tag = await Tag.findByPk(id);
    if (!tag) {
      return res.status(404).json({
        success: false,
        message: '标签不存在'
      })
    }
    if (!name) {
      return res.status(400).json({
        success: false,
        message: '标签名称不能为空'
      })
    }
    tag.name = name;
    await tag.save();
    res.json({
      success: true,
      data: tag,
      message: '修改标签成功'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '修改标签失败',
      error: error.message
    })
  }
})    

// 删除标签
router.post('/delete', async (req, res) => {
  try {
    const { id } = req.body;
    const tag = await Tag.findByPk(id);
    if (!tag) {
      return res.status(404).json({
        success: false,
        message: '标签不存在'
      })
    }
    await tag.destroy();
    res.json({
      success: true,
      message: '删除标签成功'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '删除标签失败',
      error: error.message
    })
  }
})

module.exports = router;