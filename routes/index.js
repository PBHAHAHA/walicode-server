var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* 设置cookie的路由 */
router.get('/set-cookie', function(req, res, next) {
  // 设置基本cookie
  res.cookie('username', 'walicode', {
    maxAge: 24 * 60 * 60 * 1000, // 24小时后过期
    httpOnly: true, // 只能通过HTTP访问，不能通过JavaScript访问
    secure: false, // 在开发环境中设为false，生产环境中如果使用HTTPS应设为true
    sameSite: 'lax' // CSRF保护
  });
  
  // 设置带有更多选项的cookie
  res.cookie('userPrefs', JSON.stringify({
    theme: 'dark',
    language: 'zh-CN'
  }), {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7天后过期
    httpOnly: false, // 允许JavaScript访问
    path: '/' // cookie的路径
  });
  
  res.json({
    message: 'Cookie已设置成功',
    cookies: {
      username: 'walicode',
      userPrefs: { theme: 'dark', language: 'zh-CN' }
    }
  });
});

/* 读取cookie的路由 */
router.get('/get-cookie', function(req, res, next) {
  const cookies = req.cookies;
  const signedCookies = req.signedCookies;
  
  res.json({
    message: '当前的cookies',
    cookies: cookies,
    signedCookies: signedCookies
  });
});

/* 删除cookie的路由 */
router.get('/clear-cookie', function(req, res, next) {
  // 清除特定的cookie
  res.clearCookie('username');
  res.clearCookie('userPrefs');
  
  res.json({
    message: 'Cookie已清除'
  });
});

module.exports = router;
