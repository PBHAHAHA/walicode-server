var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const dotenv = require('dotenv');
dotenv.config();

const cors = require('cors');

const indexRouter = require('./routes/index.js');
const usersRouter = require('./routes/users.js');
const categoriesRouter = require('./routes/categories.js');
const tagsRouter = require('./routes/tags.js');
var app = express();

app.use(cors()); // 允许所有域名访问
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


app.use('/api', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/tags', tagsRouter);
// app.use(express.static(path.join(__dirname, 'public')));

// 注释掉这里的端口设置，使用bin/www来启动服务器
const PORT = process.env.PORT || 4444;
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});

module.exports = app;
