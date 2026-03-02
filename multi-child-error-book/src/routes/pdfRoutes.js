const express = require('express');
const router = express.Router();
const pdfService = require('../services/pdfService');
const auth = require('../middleware/auth');

// 生成错题练习卷PDF
router.post('/generate-practice-pdf', auth, async (req, res) => {
  try {
    const { childId, questionIds, layoutMode = 'answer-last' } = req.body;
    
    if (!childId || !questionIds || !Array.isArray(questionIds)) {
      return res.status(400).json({ 
        error: '缺少必要参数: childId 和 questionIds' 
      });
    }

    const pdfBuffer = await pdfService.generatePracticePDF({
      childId,
      questionIds,
      layoutMode,
      userId: req.user.id
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=practice-sheet.pdf');
    res.send(pdfBuffer);
  } catch (error) {
    console.error('生成PDF失败:', error);
    res.status(500).json({ error: '生成PDF失败，请稍后重试' });
  }
});

// 导出单个错题PDF
router.post('/export-question-pdf', auth, async (req, res) => {
  try {
    const { questionId, includeAnswer = true } = req.body;
    
    if (!questionId) {
      return res.status(400).json({ 
        error: '缺少必要参数: questionId' 
      });
    }

    const pdfBuffer = await pdfService.exportQuestionPDF({
      questionId,
      includeAnswer,
      userId: req.user.id
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=error-question.pdf');
    res.send(pdfBuffer);
  } catch (error) {
    console.error('导出错题PDF失败:', error);
    res.status(500).json({ error: '导出PDF失败，请稍后重试' });
  }
});

module.exports = router;