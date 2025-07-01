var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const dotenv = require('dotenv');
dotenv.config();

const cors = require('cors');
const corsOptions = {
  origin: function (origin, callback) {
    // 允许的域名列表
    const allowedOrigins = [
      process.env.CORS_ORIGIN,
      'https://iwali.cn', 
      'https://www.iwali.cn' 
    ].filter(Boolean); // 过滤掉空值
    
    // 如果没有origin（比如移动端应用）或者origin在允许列表中
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('不被CORS策略允许'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

const indexRouter = require('./routes/index.js');
const usersRouter = require('./routes/users.js');
const categoriesRouter = require('./routes/categories.js');
const articlesRouter = require('./routes/articles.js');
const tagsRouter = require('./routes/tags.js');
var app = express();

app.use(cors(corsOptions)); // 配置CORS限制访问域名
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


app.use('/api', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/tags', tagsRouter);   
app.use('/api/articles', articlesRouter);
// app.use(express.static(path.join(__dirname, 'public')));

// 注释掉这里的端口设置，使用bin/www来启动服务器
const PORT = process.env.PORT || 4444;
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});

module.exports = app;
