const cron = require('node-cron');
const mongoose = require('mongoose');
const ErrorQuestion = require('../models/ErrorQuestion');
const Child = require('../models/Child');

class NotificationService {
  constructor() {
    this.setupCronJobs();
  }

  // 设置定时复习提醒
  setupCronJobs() {
    // 每天晚上7点检查需要复习的错题
    cron.schedule('0 19 * * *', async () => {
      await this.sendDailyReviewNotifications();
    });

    // 每周日检查周复习提醒
    cron.schedule('0 20 * * 0', async () => {
      await this.sendWeeklyReviewNotifications();
    });
  }

  // 发送每日复习提醒
  async sendDailyReviewNotifications() {
    try {
      const children = await Child.find({ 'reviewSettings.daily': true });
      
      for (const child of children) {
        const dueQuestions = await this.getDueQuestionsForChild(child._id);
        if (dueQuestions.length > 0) {
          await this.sendNotification(child, 'daily', dueQuestions);
        }
      }
    } catch (error) {
      console.error('Error sending daily notifications:', error);
    }
  }

  // 发送周复习提醒
  async sendWeeklyReviewNotifications() {
    try {
      const children = await Child.find({ 'reviewSettings.weekly': true });
      
      for (const child of children) {
        const dueQuestions = await this.getDueQuestionsForChild(child._id, 'week');
        if (dueQuestions.length > 0) {
          await this.sendNotification(child, 'weekly', dueQuestions);
        }
      }
    } catch (error) {
      console.error('Error sending weekly notifications:', error);
    }
  }

  // 获取需要复习的错题
  async getDueQuestionsForChild(childId, period = 'day') {
    const now = new Date();
    let reviewDate;
    
    if (period === 'day') {
      reviewDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    } else if (period === 'week') {
      reviewDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    return await ErrorQuestion.find({
      child: childId,
      lastReviewed: { $lt: reviewDate },
      status: 'active'
    }).limit(20);
  }

  // 发送通知（模拟，实际需要集成推送服务）
  async sendNotification(child, type, questions) {
    const message = this.buildNotificationMessage(child, type, questions.length);
    console.log(`[NOTIFICATION] ${message}`);
    
    // TODO: 集成实际的推送服务（Firebase Cloud Messaging, APNs等）
    // 这里可以调用阿里云推送服务或其他第三方推送服务
  }

  buildNotificationMessage(child, type, count) {
    const typeName = type === 'daily' ? '今日' : '本周';
    return `${child.nickname}，${typeName}有${count}道错题需要复习！点击查看详情。`;
  }

  // 手动触发复习提醒
  async triggerReviewNotification(childId, questionIds) {
    try {
      const child = await Child.findById(childId);
      const questions = await ErrorQuestion.find({ _id: { $in: questionIds } });
      
      if (child && questions.length > 0) {
        await this.sendNotification(child, 'manual', questions);
        return { success: true, message: '复习提醒已发送' };
      }
    } catch (error) {
      console.error('Error triggering manual notification:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = NotificationService;