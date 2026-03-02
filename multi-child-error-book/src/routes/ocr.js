const express = require('express');
const router = express.Router();
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const OCRController = require('../controllers/ocrController');
const auth = require('../middleware/auth');

// 配置文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB限制
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件'), false);
    }
  }
});

// 处理错题图片上传和处理
router.post('/process',
  auth,
  upload.single('image'),
  [
    body('childId').isMongoId().withMessage('无效的孩子ID'),
    body('subject').isIn(['数学', '语文', '英语', '物理', '化学', '生物', '历史', '地理', '政治', '科学']).withMessage('无效的学科'),
    body('grade').notEmpty().withMessage('年级不能为空')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      await OCRController.processErrorQuestionImage(req, res);
    } catch (error) {
      console.error('OCR路由错误:', error);
      res.status(500).json({ message: '服务器内部错误' });
    }
  }
);

module.exports = router;