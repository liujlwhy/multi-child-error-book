const ReviewScheduleManager = require('../src/services/ReviewScheduleManager');

async function testReviewReminder() {
  console.log('🧪 测试复习提醒功能...');
  
  try {
    // 创建一个模拟的错题ID和孩子ID
    const mockErrorQuestionId = '60f1b3c8e4b0a123456789ab';
    const mockChildId = '60f1b3c8e4b0a123456789cd';
    const mockUserId = '60f1b3c8e4b0a123456789ef';
    
    // 测试创建复习计划
    console.log('📋 创建复习计划...');
    const schedule = await ReviewScheduleManager.createReviewSchedule(
      mockErrorQuestionId, 
      mockChildId, 
      mockUserId
    );
    console.log('✅ 复习计划创建成功!');
    console.log('📅 复习日期:', schedule.reviewDates.map(r => r.date.toISOString()));
    
    // 测试获取今日复习题目
    console.log('🔍 获取今日复习题目...');
    const todayReviews = await ReviewScheduleManager.getTodayReviewQuestions(mockUserId);
    console.log('✅ 今日复习题目获取成功!');
    console.log('📊 题目数量:', todayReviews.length);
    
    console.log('🎉 复习提醒功能测试通过!');
    
  } catch (error) {
    console.error('❌ 复习提醒测试失败:', error);
    process.exit(1);
  }
}

// 如果直接运行此文件
if (require.main === module) {
  testReviewReminder().catch(console.error);
}

module.exports = { testReviewReminder };