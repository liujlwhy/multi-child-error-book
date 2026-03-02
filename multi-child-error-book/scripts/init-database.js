const { sequelize } = require('../src/models');

async function initializeDatabase() {
  try {
    console.log('🔄 连接数据库...');
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功!');
    
    console.log('🔄 同步模型到数据库...');
    await sequelize.sync({ force: false }); // 不强制删除现有数据
    console.log('✅ 数据库同步完成!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  initializeDatabase();
}

module.exports = initializeDatabase;