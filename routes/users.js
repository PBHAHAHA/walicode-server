var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/* 用户登录并设置cookie */
router.post('/login', function(req, res, next) {
  const { username, password } = req.body;
  
  // 这里应该验证用户凭据，这只是示例
  if (username && password) {
    // 设置用户会话cookie
    res.cookie('userSession', {
      userId: 12345,
      username: username,
      loginTime: new Date().toISOString()
    }, {
      maxAge: 2 * 60 * 60 * 1000, // 2小时后过期
      httpOnly: true,
      secure: false, // 生产环境中使用HTTPS时设为true
      sameSite: 'strict'
    });
    
    // 设置记住我cookie（如果用户选择）
    if (req.body.rememberMe) {
      res.cookie('rememberUser', username, {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30天
        httpOnly: true,
        secure: false
      });
    }
    
    res.json({
      success: true,
      message: '登录成功',
      user: { username: username }
    });
  } else {
    res.status(400).json({
      success: false,
      message: '用户名和密码不能为空'
    });
  }
});

/* 用户注销并清除cookie */
router.post('/logout', function(req, res, next) {
  // 清除所有用户相关的cookie
  res.clearCookie('userSession');
  res.clearCookie('rememberUser');
  
  res.json({
    success: true,
    message: '注销成功'
  });
});

/* 检查用户登录状态 */
router.get('/profile', function(req, res, next) {
  const userSession = req.cookies.userSession;
  
  if (userSession) {
    res.json({
      isLoggedIn: true,
      user: userSession,
      message: '用户已登录'
    });
  } else {
    res.status(401).json({
      isLoggedIn: false,
      message: '用户未登录'
    });
  }
});

module.exports = router;
