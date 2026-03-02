const ReviewScheduleManager = require('../src/services/ReviewScheduleManager');

// 测试复习日期计算逻辑
function testReviewDateCalculation() {
  console.log('🧪 测试复习日期计算逻辑...');
  
  const reviewDates = ReviewScheduleManager.calculateReviewDates();
  console.log(`✅ 计算出 ${reviewDates.length} 个复习日期`);
  
  if (reviewDates.length === 6) {
    console.log('✅ 复习间隔数量正确');
  } else {
    console.log('❌ 复习间隔数量错误');
    return false;
  }
  
  // 检查日期是否按顺序递增
  for (let i = 1; i < reviewDates.length; i++) {
    if (reviewDates[i] <= reviewDates[i-1]) {
      console.log('❌ 复习日期顺序错误');
      return false;
    }
  }
  
  console.log('✅ 复习日期顺序正确');
  return true;
}

// 运行测试
console.log('🚀 开始复习逻辑测试...\n');

try {
  const dateTestPassed = testReviewDateCalculation();
  
  if (dateTestPassed) {
    console.log('\n✅ 所有复习逻辑测试通过!');
  } else {
    console.log('\n❌ 部分测试失败');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ 测试执行失败:', error);
  process.exit(1);
}