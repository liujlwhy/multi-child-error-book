const { ErrorQuestion, ReviewReminder, ChildProfile } = require('../models');

/**
 * 复习计划管理器 - 基于艾宾浩斯遗忘曲线 (Sequelize版本)
 */
class ReviewScheduleManager {
  // 艾宾浩斯遗忘曲线的复习间隔（天数）
  static REVIEW_INTERVALS = [1, 3, 7, 14, 30, 90];

  /**
   * 获取今日待复习的题目
   * @param {string} userId - 用户ID
   * @returns {Promise<Array>} 待复习题目列表
   */
  static async getTodayReviewQuestions(userId) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

      // 获取用户的所有孩子
      const children = await ChildProfile.findAll({
        where: { familyUserId: userId }
      });

      if (children.length === 0) {
        return [];
      }

      const childIds = children.map(child => child.id);

      // 获取需要复习的错题
      const reviewQuestions = await ErrorQuestion.findAll({
        where: {
          childId: childIds,
          createdAt: { [Op.lte]: new Date(today.getTime() - 24 * 60 * 60 * 1000) },
          // 这里简化逻辑：所有超过24小时未复习的错题都需要复习
        },
        include: [
          { model: ChildProfile, as: 'child' }
        ],
        limit: 50
      });

      // 格式化返回数据
      return reviewQuestions.map(question => ({
        questionId: question.id,
        reviewTime: tomorrow, // 简化：今天复习
        errorQuestion: question,
        child: question.child
      }));
    } catch (error) {
      console.error('Error getting today review questions:', error);
      throw error;
    }
  }

  /**
   * 更新错题的复习状态
   * @param {string} errorQuestionId - 错题ID
   * @param {string} newStatus - 新状态
   * @returns {Promise<void>}
   */
  static async updateErrorQuestionStatus(errorQuestionId, reviewedAt) {
    try {
      const errorQuestion = await ErrorQuestion.findByPk(errorQuestionId);
      if (!errorQuestion) {
        throw new Error('Error question not found');
      }

      await errorQuestion.update({
        lastReviewedAt: reviewedAt || new Date()
      });
    } catch (error) {
      console.error('Error updating error question status:', error);
      throw error;
    }
  }

  /**
   * 计算复习日期（基于当前时间）
   * @returns {Array<Date>} 复习日期数组
   */
  static calculateReviewDates() {
    const now = new Date();
    const reviewDates = [];

    this.REVIEW_INTERVALS.forEach(interval => {
      const reviewDate = new Date(now.getTime() + interval * 24 * 60 * 60 * 1000);
      reviewDates.push(reviewDate);
    });

    return reviewDates;
  }
}

module.exports = ReviewScheduleManager;