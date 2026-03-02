const { Sequelize } = require('sequelize');
require('dotenv').config();

// 使用SQLite进行开发，避免依赖外部数据库服务
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite', // SQLite数据库文件
  logging: false, // 生产环境可以设置为true来查看SQL日志
  define: {
    timestamps: true,
    underscored: false,
    freezeTableName: true
  }
});

module.exports = sequelize;