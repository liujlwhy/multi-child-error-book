const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const PDFController = require('../controllers/pdfController');
const auth = require('../middleware/auth');
const path = require('path');
const fs = require('fs');

// 生成练习卷PDF
router.post('/practice-paper',
  auth,
  [
    body('practicePaper').isObject().withMessage('练习卷数据不能为空'),
    body('mode').optional().isIn(['practice', 'review']).withMessage('无效的排版模式')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { practicePaper, mode = 'practice' } = req.body;
      
      const pdfPath = await PDFController.generatePracticePaperPDF(practicePaper, mode);
      
      res.json({
        success: true,
        data: {
          pdfUrl: pdfPath,
          downloadUrl: `${req.protocol}://${req.get('host')}${pdfPath}`
        }
      });
    } catch (error) {
      console.error('生成练习卷PDF错误:', error);
      res.status(500).json({ message: 'PDF生成失败', error: error.message });
    }
  }
);

// 导出错题集PDF
router.post('/error-questions',
  auth,
  [
    body('errorQuestions').isArray({ min: 1 }).withMessage('错题列表不能为空'),
    body('childName').notEmpty().withMessage('孩子姓名不能为空'),
    body('subject').isIn(['数学', '语文', '英语', '物理', '化学', '生物', '历史', '地理', '政治', '科学']).withMessage('无效的学科')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { errorQuestions, childName, subject } = req.body;
      
      const pdfPath = await PDFController.exportErrorQuestionsPDF(errorQuestions, childName, subject);
      
      res.json({
        success: true,
        data: {
          pdfUrl: pdfPath,
          downloadUrl: `${req.protocol}://${req.get('host')}${pdfPath}`
        }
      });
    } catch (error) {
      console.error('导出错题集PDF错误:', error);
      res.status(500).json({ message: 'PDF导出失败', error: error.message });
    }
  }
);

// 获取PDF文件
router.get('/:filename', auth, async (req, res) => {
  try {
    const filePath = path.join(__dirname, '../../public/pdfs', req.params.filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'PDF文件不存在' });
    }
    
    res.sendFile(filePath);
  } catch (error) {
    console.error('获取PDF文件错误:', error);
    res.status(500).json({ message: '获取PDF文件失败' });
  }
});

module.exports = router;