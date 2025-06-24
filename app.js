var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// 检测环境变量
const isDevelopment = process.env.NODE_ENV !== 'production';

// CORS配置 - 根据环境自动调整
const corsOptions = {
  origin: function (origin, callback) {
    // 开发环境：允许所有localhost和127.0.0.1的请求
    if (isDevelopment) {
      if (!origin || 
          origin.startsWith('http://localhost:') || 
          origin.startsWith('http://127.0.0.1:') ||
          origin.startsWith('http://192.168.') ||
          origin.startsWith('http://10.0.') ||
          origin.startsWith('http://172.16.')) {
        return callback(null, true);
      }
    }
    
    // 允许的域名列表
    const allowedOrigins = [
      // 本地开发环境
      'http://localhost:3000',
      'http://localhost:3001', 
      'http://localhost:8080',
      'http://localhost:8081',
      'http://localhost:5173', // Vite默认端口
      'http://localhost:4200', // Angular默认端口
      'http://localhost:3001', // Next.js开发端口
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:8080',
      'http://127.0.0.1:8081',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:4200',
      // 本地IP访问（用于移动设备测试）
      'http://192.168.31.255:3000', // 根据你的实际IP调整
      'http://192.168.31.255:3001',
      'http://192.168.31.199:3001',
      // 线上域名（如果有的话）
      'https://your-frontend-domain.com',
      'https://your-production-domain.com'
    ];
    
    // 允许没有origin的请求（比如移动应用或Postman）
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // 在开发环境中，可以打印被拒绝的origin来调试
      console.log('被拒绝的跨域请求来源:', origin);
      callback(new Error('不允许的跨域请求'));
    }
  },
  credentials: true, // 允许发送cookies
  optionsSuccessStatus: 200, // 为了支持legacy浏览器
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'], // 允许的HTTP方法
  allowedHeaders: [
    'Origin',
    'X-Requested-With', 
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'X-Access-Token',
    'Access-Control-Allow-Origin',
    'Access-Control-Allow-Headers',
    'Access-Control-Allow-Methods'
  ] // 允许的请求头
};

// 应用CORS中间件
app.use(cors(corsOptions));

// 临时开发环境配置（如果上面的配置还有问题，可以临时启用这个）
// app.use(cors({
//   origin: true, // 允许所有域名
//   credentials: true // 允许发送cookies
// }));

console.log(`CORS配置已启用，当前环境: ${isDevelopment ? '开发环境' : '生产环境'}`);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// 设置运行端口为 4444
const PORT = process.env.PORT || 4444;
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});

module.exports = app;
