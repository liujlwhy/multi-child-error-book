const ReviewSchedule = require('../models/ReviewSchedule');
const ErrorQuestion = require('../models/ErrorQuestion');

/**
 * 定时复习提醒控制器
 */
class ReviewController {
  /**
   * 基于艾宾浩斯遗忘曲线生成复习计划
   * @param {Date} initialDate - 初始学习日期
   * @returns {Array} - 复习日期数组
   */
  static generateEbbinghausSchedule(initialDate = new Date()) {
    // 艾宾浩斯遗忘曲线的经典复习间隔（天数）
    const intervals = [1, 2, 4, 7, 15, 30];
    
    return intervals.map(days => {
      const reviewDate = new Date(initialDate);
      reviewDate.setDate(reviewDate.getDate() + days);
      // 设置为当天的晚上7点（19:00）
      reviewDate.setHours(19, 0, 0, 0);
      return reviewDate;
    });
  }

  /**
   * 创建复习计划
   * @param {Object} scheduleData - 复习计划数据
   * @returns {Promise<Object>} - 创建的复习计划
   */
  static async createReviewSchedule(scheduleData) {
    try {
      const { userId, childId, errorQuestionId, customIntervals, reminderTime, reminderDays } = scheduleData;
      
      // 获取错题信息
      const errorQuestion = await ErrorQuestion.findById(errorQuestionId);
      if (!errorQuestion) {
        throw new Error('未找到指定的错题');
      }
      
      // 生成复习日期
      let reviewDates;
      if (customIntervals && customIntervals.length > 0) {
        // 自定义复习间隔
        reviewDates = customIntervals.map(days => {
          const date = new Date();
          date.setDate(date.getDate() + days);
          date.setHours(parseInt(reminderTime.split(':')[0]), parseInt(reminderTime.split(':')[1]), 0, 0);
          return { date };
        });
      } else {
        // 使用艾宾浩斯遗忘曲线
        const ebbinghausDates = this.generateEbbinghausSchedule();
        reviewDates = ebbinghausDates.map(date => ({ date }));
      }
      
      const reviewSchedule = new ReviewSchedule({
        userId,
        childId,
        errorQuestionId,
        reviewDates,
        reminderTime: reminderTime || '19:00',
        reminderDays: reminderDays || ['monday', 'wednesday', 'friday']
      });
      
      await reviewSchedule.save();
      return reviewSchedule;
    } catch (error) {
      console.error('创建复习计划错误:', error);
      throw error;
    }
  }

  /**
   * 获取今日待复习的错题
   * @param {string} userId - 用户ID
   * @param {Date} today - 今日日期
   * @returns {Promise<Array>} - 待复习的错题列表
   */
  static async getTodayReviewQuestions(userId, today = new Date()) {
    try {
      const startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);
      
      const schedules = await ReviewSchedule.find({
        userId,
        isActive: true,
        'reviewDates.date': { $gte: startOfDay, $lte: endOfDay },
        'reviewDates.status': 'pending'
      }).populate('errorQuestionId').populate('childId');
      
      return schedules.map(schedule => ({
        scheduleId: schedule._id,
        child: schedule.childId,
        errorQuestion: schedule.errorQuestionId,
        reviewTime: schedule.reviewDates.find(rd => 
          rd.date >= startOfDay && rd.date <= endOfDay
        )?.date
      }));
    } catch (error) {
      console.error('获取今日复习题目错误:', error);
      throw error;
    }
  }

  /**
   * 标记复习完成
   * @param {string} scheduleId - 复习计划ID
   * @param {Date} reviewDate - 复习日期
   * @returns {Promise<void>}
   */
  static async markReviewCompleted(scheduleId, reviewDate) {
    try {
      const schedule = await ReviewSchedule.findById(scheduleId);
      if (!schedule) {
        throw new Error('未找到复习计划');
      }
      
      const reviewEntry = schedule.reviewDates.find(rd => 
        Math.abs(rd.date.getTime() - new Date(reviewDate).getTime()) < 3600000 // 1小时内
      );
      
      if (reviewEntry) {
        reviewEntry.status = 'completed';
        reviewEntry.completedAt = new Date();
        await schedule.save();
      }
    } catch (error) {
      console.error('标记复习完成错误:', error);
      throw error;
    }
  }

  /**
   * 获取用户的复习提醒设置
   * @param {string} userId - 用户ID
   * @returns {Promise<Object>} - 提醒设置
   */
  static async getUserReminderSettings(userId) {
    try {
      const schedules = await ReviewSchedule.find({ userId }).limit(1);
      if (schedules.length > 0) {
        return {
          defaultReminderTime: schedules[0].reminderTime,
          defaultReminderDays: schedules[0].reminderDays
        };
      }
      
      // 默认设置
      return {
        defaultReminderTime: '19:00',
        defaultReminderDays: ['monday', 'wednesday', 'friday']
      };
    } catch (error) {
      console.error('获取提醒设置错误:', error);
      throw error;
    }
  }
}

module.exports = ReviewController;