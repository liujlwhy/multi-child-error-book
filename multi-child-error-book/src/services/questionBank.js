const mongoose = require('mongoose');
const ErrorQuestion = require('../models/ErrorQuestion');

class QuestionBankService {
  /**
   * 根据知识点标签搜索相似题目
   * @param {string} subject - 学科
   * @param {string} grade - 年级
   * @param {Array} knowledgeTags - 知识点标签数组
   * @param {number} limit - 返回题目数量限制
   * @returns {Promise<Array>} 相似题目列表
   */
  async findSimilarQuestions(subject, grade, knowledgeTags, limit = 5) {
    try {
      // 构建查询条件
      const query = {
        subject: subject,
        grade: grade,
        'knowledgeTags': { $in: knowledgeTags },
        status: 'active'
      };

      // 执行查询，按相关性排序
      const similarQuestions = await ErrorQuestion.find(query)
        .limit(limit)
        .sort({ createdAt: -1 });

      return similarQuestions;
    } catch (error) {
      console.error('Error finding similar questions:', error);
      throw new Error('Failed to find similar questions');
    }
  }

  /**
   * 创建智能练习卷
   * @param {string} originalQuestionId - 原始错题ID
   * @param {Array} similarQuestionIds - 相似题目ID数组
   * @returns {Promise<Object>} 练习卷对象
   */
  async createPracticeSheet(originalQuestionId, similarQuestionIds) {
    try {
      // 获取原始错题
      const originalQuestion = await ErrorQuestion.findById(originalQuestionId);
      if (!originalQuestion) {
        throw new Error('Original question not found');
      }

      // 获取相似题目
      const similarQuestions = await ErrorQuestion.find({
        _id: { $in: similarQuestionIds }
      });

      // 构建练习卷
      const practiceSheet = {
        title: `针对"${originalQuestion.title}"的专项练习`,
        subject: originalQuestion.subject,
        grade: originalQuestion.grade,
        childId: originalQuestion.childId,
        questions: [
          { ...originalQuestion.toObject(), isOriginal: true },
          ...similarQuestions.map(q => ({ ...q.toObject(), isOriginal: false }))
        ],
        createdAt: new Date(),
        status: 'active'
      };

      return practiceSheet;
    } catch (error) {
      console.error('Error creating practice sheet:', error);
      throw new Error('Failed to create practice sheet');
    }
  }

  /**
   * 处理冷门知识点（无匹配题目时）
   * @param {Object} question - 原始题目
   * @returns {Object} 冷门知识点处理建议
   */
  handleRareKnowledgePoint(question) {
    return {
      message: '未找到相关练习题',
      suggestion: '请手动拍照补充类似题目，或联系老师获取更多练习资源',
      allowManualUpload: true,
      knowledgePoint: question.knowledgeTags.join(', ')
    };
  }
}

module.exports = new QuestionBankService();