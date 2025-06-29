const express = require('express');
const pagination = require('../middleware/pagination');

const app = express();

// 测试路由 - 使用分页中间件
app.get('/test-pagination', pagination(), (req, res) => {
  console.log('分页信息:', req.pagination);
  console.log('分页选项:', req.getPaginationOptions());
  console.log('分页数据 (总数100):', req.getPaginationData(100));
  
  res.json({
    success: true,
    message: '分页中间件测试成功',
    pagination: req.pagination,
    paginationOptions: req.getPaginationOptions(),
    paginationData: req.getPaginationData(100)
  });
});

// 启动测试服务器
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`测试服务器运行在端口 ${PORT}`);
  console.log('测试URL:');
  console.log(`http://localhost:${PORT}/test-pagination`);
  console.log(`http://localhost:${PORT}/test-pagination?page=2&limit=20&sort=title:asc`);
});

module.exports = app; 