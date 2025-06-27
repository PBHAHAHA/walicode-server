const dotenv = require('dotenv');
dotenv.config();
console.log(process.env.DB_HOST)
module.exports = {
  "development": {
    "username": process.env.DB_USERNAME,
    "password": process.env.DB_PASSWORD,
    "database": process.env.DB_NAME,
    "host": process.env.DB_HOST || "localhost",
    "port": process.env.DB_PORT || 3306,
    "dialect": "mysql",
    dialectOptions: {
      dateStrings: true, // 将日期转换为字符串
      typeCast: true
    },
    "logging": console.log, // 开发环境显示 SQL 日志
  },
  "test": {
    "username": "root",
    "password": null,
    "database": "database_test",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "production": {
    "username": "root",
    "password": null,
    "database": "database_production",
    "host": "127.0.0.1",
    "dialect": "mysql"
  }
}
