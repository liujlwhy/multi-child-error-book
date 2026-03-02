const { FamilyUser, ChildProfile, ErrorQuestion, ReviewReminder } = require('../../src/models');
const ReviewScheduleManager = require('../../src/services/ReviewScheduleManager');

async function testReviewReminderIntegration() {
  try {
    console.log('🚀 开始复习提醒集成测试...\n');

    // 清理之前的测试数据
    await FamilyUser.destroy({ where: {} });
    await ChildProfile.destroy({ where: {} });
    await ErrorQuestion.destroy({ where: {} });

    console.log('📋 创建测试用户和孩子...');
    
    // 创建唯一邮箱的测试用户
    const timestamp = Date.now();
    const user = await FamilyUser.create({
      email: `test${timestamp}@example.com`,
      password: 'hashed_password'
    });
    
    const child = await ChildProfile.create({
      familyUserId: user.id,
      nickname: '小明',
      grade: '三年级'
    });
    
    console.log(`✅ 用户创建成功: ${user.id}`);
    console.log(`✅ 孩子创建成功: ${child.id}`);

    console.log('\n📝 创建错题...');
    const errorQuestion = await ErrorQuestion.create({
      childId: child.id,
      subject: '数学',
      originalImageUrl: 'http://example.com/test.jpg',
      ocrText: '这是一道数学题',
      errorReason: '计算错误',
      knowledgePoint: '分数运算'
    });
    
    console.log(`✅ 错题创建成功: ${errorQuestion.id}`);

    console.log('\n⏰ 创建复习计划...');
    const reviewSchedule = await ReviewScheduleManager.createReviewSchedule(
      errorQuestion.id,
      child.id,
      user.id
    );
    
    console.log(`✅ 复习计划创建成功: ${reviewSchedule.id}`);
    console.log(`📅 复习日期数量: ${reviewSchedule.reviewDates.length}`);

    console.log('\n🔍 查询今日复习题目...');
    const todayReviews = await ReviewScheduleManager.getTodayReviewQuestions(user.id);
    console.log(`✅ 今日待复习题目: ${todayReviews.length} 题`);

    console.log('\n✅ 复习提醒集成测试完成!');
    
  } catch (error) {
    console.error('❌ 集成测试失败:', error);
    process.exit(1);
  }
}

// 运行测试
testReviewReminderIntegration();