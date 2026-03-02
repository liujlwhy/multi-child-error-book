const cron = require('node-cron');
const { sendPushNotification } = require('./pushNotificationService');
const { FamilyUser, ChildProfile, ErrorQuestion, ReviewReminder } = require('../models');

class ReminderService {
  constructor() {
    this.initializeReminders();
  }

  // 初始化所有定时任务
  async initializeReminders() {
    // 每天检查需要复习的错题
    cron.schedule('0 19 * * *', async () => {
      await this.sendDailyReviewReminders();
    });

    // 每周检查长期复习计划
    cron.schedule('0 8 * * 1', async () => {
      await this.sendWeeklyReviewReminders();
    });
  }

  // 发送每日复习提醒
  async sendDailyReviewReminders() {
    try {
      const children = await ChildProfile.findAll({ where: { isActive: true } });
      
      for (const child of children) {
        const reviewQuestions = await this.getQuestionsForReview(child.id);
        
        if (reviewQuestions.length > 0) {
          const message = `【${child.nickname}】有${reviewQuestions.length}道错题需要复习！点击查看详情`;
          await sendPushNotification(child.familyUserId, message, {
            childId: child.id,
            questionIds: reviewQuestions.map(q => q.id)
          });
        }
      }
    } catch (error) {
      console.error('Error sending daily review reminders:', error);
    }
  }

  // 发送每周复习提醒
  async sendWeeklyReviewReminders() {
    try {
      const children = await ChildProfile.findAll({ where: { isActive: true } });
      
      for (const child of children) {
        const weeklyReviewQuestions = await this.getWeeklyReviewQuestions(child.id);
        
        if (weeklyReviewQuestions.length > 0) {
          const message = `【${child.nickname}】本周复习计划：${weeklyReviewQuestions.length}道重点错题！`;
          await sendPushNotification(child.familyUserId, message, {
            childId: child.id,
            questionIds: weeklyReviewQuestions.map(q => q.id),
            type: 'weekly'
          });
        }
      }
    } catch (error) {
      console.error('Error sending weekly review reminders:', error);
    }
  }

  // 根据艾宾浩斯遗忘曲线获取需要复习的题目
  async getQuestionsForReview(childId) {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    return await ErrorQuestion.findAll({
      where: {
        childId: childId,
        [Sequelize.Op.or]: [
          { lastReviewedAt: { [Sequelize.Op.lt]: oneDayAgo }, reviewCount: 1 },
          { lastReviewedAt: { [Sequelize.Op.lt]: threeDaysAgo }, reviewCount: 2 },
          { lastReviewedAt: { [Sequelize.Op.lt]: sevenDaysAgo }, reviewCount: 3 }
        ],
        isMastered: false
      },
      limit: 20
    });
  }

  // 获取每周复习题目
  async getWeeklyReviewQuestions(childId) {
    return await ErrorQuestion.findAll({
      where: {
        childId: childId,
        isMastered: false,
        createdAt: { [Sequelize.Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      },
      order: [['errorFrequency', 'DESC']],
      limit: 15
    });
  }

  // 为特定孩子设置自定义提醒
  async setCustomReminder(userId, childId, schedule, enabled = true) {
    try {
      const child = await ChildProfile.findByPk(childId);
      if (!child || child.familyUserId !== userId) {
        throw new Error('Child not found or unauthorized');
      }

      // 更新孩子的提醒设置
      await child.update({
        customReminderSchedule: schedule,
        customReminderEnabled: enabled
      });

      return child;
    } catch (error) {
      console.error('Error setting custom reminder:', error);
      throw error;
    }
  }
}

module.exports = new ReminderService();