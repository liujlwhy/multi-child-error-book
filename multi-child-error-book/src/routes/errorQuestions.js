const express = require('express');
const router = express.Router();
const { body, param, query, validationResult } = require('express-validator');
const { FamilyUser, ChildProfile, ErrorQuestion } = require('../models');
const auth = require('../middleware/auth');

// 创建错题（基本版本，不包含图片）
router.post('/',
  auth,
  [
    body('childId').isUUID().withMessage('无效的孩子ID'),
    body('subject').isIn(['数学', '语文', '英语', '物理', '化学', '生物', '历史', '地理', '政治', '科学']).withMessage('无效的学科'),
    body('errorReason').optional().isIn(['概念模糊', '计算错误', '审题不清', '知识点缺失', '粗心大意', '其他']),
    body('notes').optional().isString()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { childId, subject, errorReason, notes } = req.body;
      
      // 验证孩子属于当前用户
      const child = await ChildProfile.findOne({ 
        where: { id: childId, familyUserId: req.user.id }
      });
      
      if (!child) {
        return res.status(403).json({ message: 'Child not found or access denied' });
      }
      
      // 创建错题记录
      const errorQuestion = await ErrorQuestion.create({
        childId: childId,
        subject: subject,
        errorReason: errorReason || '其他',
        notes: notes || '',
        originalImageUrl: null,
        cleanedImageUrl: null,
        ocrText: null
      });
      
      res.status(201).json(errorQuestion);
      
    } catch (error) {
      console.error('Error creating error question:', error);
      res.status(500).json({ message: 'Failed to create error question' });
    }
  }
);

// 获取错题列表
router.get('/list/:childId',
  auth,
  [
    param('childId').isUUID().withMessage('无效的孩子ID'),
    query('subject').optional().isIn(['数学', '语文', '英语', '物理', '化学', '生物', '历史', '地理', '政治', '科学']),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    query('sortBy').optional().isIn(['createdAt', 'updatedAt', 'subject'])
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { childId } = req.params;
      const { subject, startDate, endDate, sortBy = 'createdAt' } = req.query;
      
      // 验证孩子属于当前用户
      const child = await ChildProfile.findOne({ 
        where: { id: childId, familyUserId: req.user.id }
      });
      
      if (!child) {
        return res.status(403).json({ message: 'Child not found or access denied' });
      }
      
      // 构建查询条件
      const where = { childId: childId };
      if (subject) where.subject = subject;
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt[Op.gte] = new Date(startDate);
        if (endDate) where.createdAt[Op.lte] = new Date(endDate);
      }
      
      const errorQuestions = await ErrorQuestion.findAll({
        where: where,
        order: [[sortBy, 'DESC']],
        limit: 100
      });
      
      res.json(errorQuestions);
      
    } catch (error) {
      console.error('Error fetching error questions:', error);
      res.status(500).json({ message: 'Failed to fetch error questions' });
    }
  }
);

// 获取单个错题详情
router.get('/:id',
  auth,
  [
    param('id').isUUID().withMessage('无效的错题ID')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      
      const errorQuestion = await ErrorQuestion.findByPk(id);
      if (!errorQuestion) {
        return res.status(404).json({ message: 'Error question not found' });
      }
      
      // 验证孩子属于当前用户
      const child = await ChildProfile.findOne({ 
        where: { id: errorQuestion.childId, familyUserId: req.user.id }
      });
      
      if (!child) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      res.json(errorQuestion);
      
    } catch (error) {
      console.error('Error fetching error question detail:', error);
      res.status(500).json({ message: 'Failed to fetch error question detail' });
    }
  }
);

// 更新错题信息
router.put('/:id',
  auth,
  [
    param('id').isUUID().withMessage('无效的错题ID'),
    body('subject').optional().isIn(['数学', '语文', '英语', '物理', '化学', '生物', '历史', '地理', '政治', '科学']),
    body('errorReason').optional().isIn(['概念模糊', '计算错误', '审题不清', '知识点缺失', '粗心大意', '其他']),
    body('notes').optional().isString()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { subject, errorReason, notes } = req.body;
      
      const errorQuestion = await ErrorQuestion.findByPk(id);
      if (!errorQuestion) {
        return res.status(404).json({ message: 'Error question not found' });
      }
      
      // 验证孩子属于当前用户
      const child = await ChildProfile.findOne({ 
        where: { id: errorQuestion.childId, familyUserId: req.user.id }
      });
      
      if (!child) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      // 更新字段
      if (subject !== undefined) errorQuestion.subject = subject;
      if (errorReason !== undefined) errorQuestion.errorReason = errorReason;
      if (notes !== undefined) errorQuestion.notes = notes;
      
      await errorQuestion.save();
      
      res.json(errorQuestion);
      
    } catch (error) {
      console.error('Error updating error question:', error);
      res.status(500).json({ message: 'Failed to update error question' });
    }
  }
);

// 删除错题
router.delete('/:id',
  auth,
  [
    param('id').isUUID().withMessage('无效的错题ID')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      
      const errorQuestion = await ErrorQuestion.findByPk(id);
      if (!errorQuestion) {
        return res.status(404).json({ message: 'Error question not found' });
      }
      
      // 验证孩子属于当前用户
      const child = await ChildProfile.findOne({ 
        where: { id: errorQuestion.childId, familyUserId: req.user.id }
      });
      
      if (!child) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      await errorQuestion.destroy();
      
      res.json({ message: 'Error question deleted successfully' });
      
    } catch (error) {
      console.error('Error deleting error question:', error);
      res.status(500).json({ message: 'Failed to delete error question' });
    }
  }
);

module.exports = router;