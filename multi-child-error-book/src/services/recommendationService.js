const { ErrorQuestion } = require('../models');
const { Op } = require('sequelize');

/**
 * 智能错题推荐服务
 * 基于知识点标签、难度级别、学科等维度进行相似题目推荐
 */
class RecommendationService {
  /**
   * 获取相似错题推荐
   * @param {string} questionId - 原错题ID
   * @param {number} limit - 推荐数量，默认5
   * @returns {Promise<Array>} 推荐的错题列表
   */
  static async getSimilarQuestions(questionId, limit = 5) {
    try {
      // 获取原错题信息
      const originalQuestion = await ErrorQuestion.findByPk(questionId);
      if (!originalQuestion) {
        throw new Error('原错题不存在');
      }

      const { 
        childId, 
        subjectId, 
        knowledgePoint,
        difficulty 
      } = originalQuestion;

      // 构建查询条件
      let whereConditions = {
        childId: childId,
        subjectId: subjectId,
        id: { [Op.ne]: questionId }, // 排除自身
        isProcessed: true
      };

      // 如果有知识点，优先按知识点匹配
      if (knowledgePoint) {
        whereConditions.knowledgePoint = {
          [Op.like]: `%${knowledgePoint}%`
        };
      }

      // 查询相似题目
      const similarQuestions = await ErrorQuestion.findAll({
        where: whereConditions,
        order: [
          ['difficulty', 'ASC'],
          ['createdAt', 'DESC']
        ],
        limit: limit
      });

      return similarQuestions;
    } catch (error) {
      console.error('获取相似题目失败:', error);
      throw error;
    }
  }

  /**
   * 生成智能练习卷
   * @param {Array} selectedQuestions - 选中的错题ID数组
   * @param {string} childId - 孩子ID
   * @param {Object} options - 选项配置
   * @returns {Promise<Object>} 练习卷数据
   */
  static async generatePracticePaper(selectedQuestions, childId, options = {}) {
    try {
      const { 
        includeSimilar = true, 
        similarCount = 3,
        paperTitle = '智能练习卷'
      } = options;

      // 获取选中的错题
      const originalQuestions = await ErrorQuestion.findAll({
        where: {
          id: { [Op.in]: selectedQuestions },
          childId: childId
        }
      });

      if (originalQuestions.length === 0) {
        throw new Error('未找到选中的错题');
      }

      let allQuestions = [...originalQuestions];
      
      // 如果需要包含相似题目
      if (includeSimilar) {
        for (const question of originalQuestions) {
          const similar = await this.getSimilarQuestions(question.id, similarCount);
          allQuestions = [...allQuestions, ...similar];
        }
        // 去重
        const uniqueIds = new Set();
        allQuestions = allQuestions.filter(q => {
          if (uniqueIds.has(q.id)) {
            return false;
          }
          uniqueIds.add(q.id);
          return true;
        });
      }

      return {
        title: paperTitle,
        childId: childId,
        questions: allQuestions,
        createdAt: new Date(),
        totalQuestions: allQuestions.length,
        originalCount: originalQuestions.length,
        similarCount: allQuestions.length - originalQuestions.length
      };
    } catch (error) {
      console.error('生成练习卷失败:', error);
      throw error;
    }
  }

  /**
   * 获取冷门知识点提示
   * @param {string} knowledgePoint - 知识点
   * @param {string} subjectId - 学科ID
   * @returns {Promise<string>} 提示信息
   */
  static async getColdTopicSuggestion(knowledgePoint, subjectId) {
    // 检查题库中该知识点的题目数量
    const count = await ErrorQuestion.count({
      where: {
        knowledgePoint: { [Op.like]: `%${knowledgePoint}%` },
        subjectId: subjectId
      }
    });

    if (count < 5) {
      return `当前题库中关于"${knowledgePoint}"的题目较少（仅${count}道），建议手动补充类似题目。`;
    }
    
    return null;
  }
}

module.exports = RecommendationService;