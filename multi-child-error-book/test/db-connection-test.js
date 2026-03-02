const { sequelize } = require('../src/models');

async function testDatabaseConnection() {
  try {
    console.log('🧪 测试数据库连接...');
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功!');
    
    // 测试模型同步
    console.log('🔄 测试模型同步...');
    await sequelize.sync({ force: false });
    console.log('✅ 模型同步成功!');
    
    return true;
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    return false;
  }
}

// 如果直接运行此文件
if (require.main === module) {
  testDatabaseConnection().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { testDatabaseConnection };