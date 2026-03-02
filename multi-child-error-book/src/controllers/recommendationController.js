const ErrorQuestion = require('../models/ErrorQuestion');
const QuestionBank = require('../models/QuestionBank');

/**
 * 举一反三智能推荐控制器
 */
class RecommendationController {
  /**
   * 基于错题推荐相似题目
   * @param {string} errorQuestionId - 错题ID
   * @param {number} count - 推荐题目数量，默认5道
   * @returns {Promise<Array>} - 推荐的题目列表
   */
  static async recommendSimilarQuestions(errorQuestionId, count = 5) {
    try {
      // 获取原始错题
      const errorQuestion = await ErrorQuestion.findById(errorQuestionId);
      if (!errorQuestion) {
        throw new Error('未找到指定的错题');
      }

      const { subject, grade, knowledgePoints } = errorQuestion;
      
      // 构建查询条件
      const query = {
        subject,
        grade,
        isActive: true,
        _id: { $ne: errorQuestionId } // 排除原错题本身
      };

      // 如果有知识点标签，优先按知识点匹配
      if (knowledgePoints && knowledgePoints.length > 0) {
        query.knowledgePoints = { $in: knowledgePoints };
      }

      // 计算相似度并排序
      const similarQuestions = await QuestionBank.find(query)
        .select('questionText questionImage answer explanation difficulty knowledgePoints questionType')
        .limit(count * 2) // 获取更多候选题目用于筛选
        .lean();

      // 简单的相似度评分（实际可使用更复杂的算法）
      const scoredQuestions = similarQuestions.map(question => {
        let similarityScore = 0;
        
        // 知识点匹配度评分
        if (knowledgePoints && knowledgePoints.length > 0) {
          const matchedPoints = knowledgePoints.filter(point => 
            question.knowledgePoints.includes(point)
          ).length;
          similarityScore += (matchedPoints / knowledgePoints.length) * 0.6;
        }
        
        // 难度相近性评分（假设错题难度为3）
        const difficultyDiff = Math.abs(question.difficulty - 3);
        similarityScore += (1 - difficultyDiff / 5) * 0.4;
        
        return {
          ...question,
          similarityScore: Math.min(similarityScore, 1)
        };
      });

      // 按相似度排序并返回前count个
      return scoredQuestions
        .sort((a, b) => b.similarityScore - a.similarityScore)
        .slice(0, count);
    } catch (error) {
      console.error('推荐相似题目错误:', error);
      throw error;
    }
  }

  /**
   * 生成智能练习卷
   * @param {Array} selectedQuestions - 选中的题目ID数组（包含原错题和推荐题）
   * @returns {Promise<Object>} - 练习卷数据
   */
  static async generatePracticePaper(selectedQuestions) {
    try {
      const questionIds = selectedQuestions.map(q => q.questionId || q._id);
      
      const questions = await QuestionBank.find({
        _id: { $in: questionIds },
        isActive: true
      }).lean();

      // 构建练习卷结构
      const practicePaper = {
        title: '智能练习卷',
        questions: questions.map((q, index) => ({
          number: index + 1,
          content: q.questionText,
          image: q.questionImage,
          answer: q.answer,
          explanation: q.explanation,
          type: q.questionType,
          knowledgePoints: q.knowledgePoints
        })),
        createdAt: new Date(),
        totalQuestions: questions.length
      };

      return practicePaper;
    } catch (error) {
      console.error('生成练习卷错误:', error);
      throw error;
    }
  }

  /**
   * 处理冷门知识点的补充机制
   * @param {Object} errorQuestion - 错题对象
   * @returns {Promise<Object>} - 补充建议
   */
  static async handleRareKnowledgePoints(errorQuestion) {
    const { knowledgePoints, subject, grade } = errorQuestion;
    
    // 检查是否有足够的题目匹配
    const count = await QuestionBank.countDocuments({
      subject,
      grade,
      knowledgePoints: { $in: knowledgePoints },
      isActive: true
    });

    if (count < 3) {
      return {
        needsManualSupplement: true,
        message: `知识点 "${knowledgePoints.join(', ')}" 的相关题目较少，请手动补充类似题目`,
        suggestedAction: '允许用户拍照上传类似题目到题库'
      };
    }

    return {
      needsManualSupplement: false,
      message: '知识点覆盖充足，可正常推荐题目'
    };
  }
}

module.exports = RecommendationController;