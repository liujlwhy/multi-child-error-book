const mongoose = require('mongoose');
const ErrorQuestion = require('../models/ErrorQuestion');

/**
 * 智能错题匹配服务
 * 基于知识点标签进行相似题目推荐
 */
class QuestionMatchingService {
  /**
   * 根据错题ID获取相似题目
   * @param {String} errorQuestionId - 错题ID
   * @param {Number} count - 推荐题目数量 (默认5)
   * @returns {Array} 相似题目列表
   */
  async getSimilarQuestions(errorQuestionId, count = 5) {
    try {
      // 获取原错题
      const originalQuestion = await ErrorQuestion.findById(errorQuestionId);
      if (!originalQuestion) {
        throw new Error('原错题不存在');
      }

      const { childId, subject, knowledgeTags, difficulty } = originalQuestion;

      // 构建查询条件
      const query = {
        childId: childId, // 同一个孩子
        subject: subject, // 同一学科
        _id: { $ne: errorQuestionId }, // 排除自身
        status: 'active' // 只查询活跃题目
      };

      // 如果有知识点标签，优先按标签匹配
      if (knowledgeTags && knowledgeTags.length > 0) {
        query.knowledgeTags = { $in: knowledgeTags };
      }

      // 计算难度范围（±1级）
      const minDifficulty = Math.max(1, difficulty - 1);
      const maxDifficulty = difficulty + 1;
      query.difficulty = { $gte: minDifficulty, $lte: maxDifficulty };

      // 查询相似题目
      const similarQuestions = await ErrorQuestion.find(query)
        .limit(count)
        .sort({ createdAt: -1 });

      return similarQuestions;
    } catch (error) {
      console.error('获取相似题目失败:', error);
      throw error;
    }
  }

  /**
   * 生成智能练习卷
   * @param {String} errorQuestionId - 原错题ID
   * @param {Array} selectedQuestions - 用户选择的额外题目ID
   * @returns {Object} 练习卷对象
   */
  async generatePracticePaper(errorQuestionId, selectedQuestions = []) {
    try {
      // 获取原错题
      const originalQuestion = await ErrorQuestion.findById(errorQuestionId);
      if (!originalQuestion) {
        throw new Error('原错题不存在');
      }

      // 获取相似题目
      const similarQuestions = await this.getSimilarQuestions(errorQuestionId, 4);
      
      // 合并题目（原错题 + 相似题目 + 用户选择的题目）
      let allQuestions = [originalQuestion, ...similarQuestions];
      
      if (selectedQuestions.length > 0) {
        const additionalQuestions = await ErrorQuestion.find({
          _id: { $in: selectedQuestions },
          childId: originalQuestion.childId
        });
        allQuestions = [...allQuestions, ...additionalQuestions];
      }

      // 去重
      const uniqueQuestions = Array.from(
        new Map(allQuestions.map(q => [q._id.toString(), q])).values()
      );

      const practicePaper = {
        title: `智能练习卷 - ${originalQuestion.subject}`,
        childId: originalQuestion.childId,
        subject: originalQuestion.subject,
        questions: uniqueQuestions,
        createdAt: new Date(),
        totalQuestions: uniqueQuestions.length,
        sourceErrorQuestionId: errorQuestionId
      };

      return practicePaper;
    } catch (error) {
      console.error('生成练习卷失败:', error);
      throw error;
    }
  }

  /**
   * 为冷门知识点提供补充建议
   * @param {Object} errorQuestion - 错题对象
   * @returns {Object} 补充建议
   */
  async getSupplementSuggestion(errorQuestion) {
    const similarCount = await ErrorQuestion.countDocuments({
      childId: errorQuestion.childId,
      subject: errorQuestion.subject,
      knowledgeTags: { $in: errorQuestion.knowledgeTags || [] },
      _id: { $ne: errorQuestion._id }
    });

    if (similarCount < 2) {
      return {
        needSupplement: true,
        message: '该知识点题目较少，建议手动补充类似题目',
        suggestion: '可以通过拍照上传类似题目来丰富题库'
      };
    }

    return {
      needSupplement: false,
      message: '已有足够多的相似题目'
    };
  }
}

module.exports = new QuestionMatchingService();