const express = require('express');
const router = express.Router();
const { Category } = require('../models/index');

// 查询所有分类
router.get('/', async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.json({
      success: true,
      data: categories,
      message: '获取分类列表成功'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取分类列表失败',
      error: error.message
    })
  }
})

// 修改分类
router.post('/update', async (req, res) => {
  try {
    const { id, name, description } = req.body;
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: '分类不存在'
      })
    }
    if(!name) {
      return res.status(400).json({
        success: false,
        message: '分类名称不能为空'
      })
    }
    category.name = name;
    category.description = description;
    await category.save();
    res.json({
      success: true,
      data: category,
      message: '修改分类成功'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '修改分类失败',
      error: error.message
    })
  }
})

// 创建新分类
router.post('/create', async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({
        success: false,
        message: '分类名称不能为空'
      })
    }
    const category = await Category.create({
      name,
      description
    })
    res.json({
      success: true,  
      data: category,
      message: '创建分类成功'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '创建分类失败',  
      error: error.message
    })
  }
})

// 删除分类
router.post('/delete', async (req, res) => {
  try {
    const { id } = req.body;
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: '分类不存在'
      })
    }
    await category.destroy();
    res.json({
      success: true,
      message: '删除分类成功'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '删除分类失败',
      error: error.message
    })
  }
})  

module.exports = router;