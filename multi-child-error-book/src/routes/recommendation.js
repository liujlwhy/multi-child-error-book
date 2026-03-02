const express = require('express');
const router = express.Router();
const { param, body, validationResult } = require('express-validator');
const { RecommendationService } = require('../models');
const auth = require('../middleware/auth');

// 获取相似题目推荐
router.get('/similar/:errorQuestionId',
  auth,
  [
    param('errorQuestionId').isUUID().withMessage('无效的错题ID')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { count = 5 } = req.query;
      const similarQuestions = await RecommendationService.getSimilarQuestions(
        req.params.errorQuestionId,
        parseInt(count)
      );

      res.json({
        success: true,
        data: similarQuestions
      });
    } catch (error) {
      console.error('获取相似题目推荐错误:', error);
      res.status(500).json({ message: '服务器内部错误', error: error.message });
    }
  }
);

// 生成智能练习卷
router.post('/practice-paper',
  auth,
  [
    body('selectedQuestions').isArray({ min: 1 }).withMessage('至少选择一道题目'),
    body('childId').isUUID().withMessage('无效的孩子ID')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { selectedQuestions, childId } = req.body;
      const questionIds = selectedQuestions.map(q => q.questionId || q.id);
      
      const practicePaper = await RecommendationService.generatePracticePaper(
        questionIds,
        childId
      );

      res.json({
        success: true,
        data: practicePaper
      });
    } catch (error) {
      console.error('生成练习卷错误:', error);
      res.status(500).json({ message: '服务器内部错误', error: error.message });
    }
  }
);

module.exports = router;