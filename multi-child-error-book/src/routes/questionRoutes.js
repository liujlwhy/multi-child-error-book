const express = require('express');
const router = express.Router();
const questionMatching = require('../services/questionMatching');
const questionBank = require('../services/questionBank');
const pdfService = require('../services/pdfService');

// 获取举一反三题目
router.post('/similar-questions', async (req, res) => {
  try {
    const { errorQuestionId, childId } = req.body;
    const similarQuestions = await questionMatching.findSimilarQuestions(errorQuestionId, childId);
    res.json({ success: true, data: similarQuestions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 生成智能练习卷
router.post('/generate-practice-sheet', async (req, res) => {
  try {
    const { questionIds, childId, mode = 'practice' } = req.body;
    const practiceSheet = await questionBank.generatePracticeSheet(questionIds, childId, mode);
    res.json({ success: true, data: practiceSheet });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 生成PDF
router.post('/generate-pdf', async (req, res) => {
  try {
    const { content, options, childId } = req.body;
    const pdfBuffer = await pdfService.generatePDF(content, options, childId);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=practice-sheet-${Date.now()}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;