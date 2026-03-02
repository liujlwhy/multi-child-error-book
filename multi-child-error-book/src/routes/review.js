const express = require('express');
const router = express.Router();
const { body, param, query, validationResult } = require('express-validator');
const { FamilyUser, ChildProfile, ErrorQuestion, ReviewReminder } = require('../models');
const auth = require('../middleware/auth');

// 创建复习计划
router.post('/schedule',
  auth,
  [
    body('childId').isUUID().withMessage('无效的孩子ID'),
    body('errorQuestionId').isUUID().withMessage('无效的错题ID'),
    body('reminderTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('提醒时间格式应为 HH:mm'),
    body('reminderDays').optional().isArray(),
    body('reminderDays.*').optional().isIn(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { childId, errorQuestionId, reminderTime, reminderDays } = req.body;

      // 验证孩子属于当前用户
      const child = await ChildProfile.findOne({
        where: { id: childId, familyUserId: req.user.id }
      });

      if (!child) {
        return res.status(403).json({ message: '孩子档案不存在或无访问权限' });
      }

      // 验证错题属于该孩子
      const errorQuestion = await ErrorQuestion.findOne({
        where: { id: errorQuestionId, childId: childId }
      });

      if (!errorQuestion) {
        return res.status(404).json({ message: '错题不存在' });
      }

      const reviewSchedule = await ReviewReminder.create({
        childId: childId,
        subjectId: errorQuestion.subjectId,
        reminderTime: reminderTime || '19:00',
        frequency: 'daily',
        isActive: true
      });

      res.status(201).json({
        success: true,
        data: reviewSchedule
      });
    } catch (error) {
      console.error('创建复习计划错误:', error);
      res.status(500).json({ message: '创建复习计划失败', error: error.message });
    }
  }
);

// 获取今日待复习题目
router.get('/today',
  auth,
  async (req, res) => {
    try {
      // 这里需要实现基于当前日期的复习题目查询逻辑
      // 简化版本：返回该用户所有孩子的错题
      const children = await ChildProfile.findAll({
        where: { familyUserId: req.user.id },
        include: [{
          model: ErrorQuestion,
          where: { reviewStatus: 'pending' },
          required: false
        }]
      });

      const reviewQuestions = [];
      children.forEach(child => {
        child.ErrorQuestions.forEach(question => {
          reviewQuestions.push({
            childId: child.id,
            childName: child.nickname,
            questionId: question.id,
            questionText: question.ocrText,
            subject: question.subjectId,
            createdAt: question.createdAt
          });
        });
      });

      res.json({
        success: true,
        data: reviewQuestions
      });
    } catch (error) {
      console.error('获取今日复习题目错误:', error);
      res.status(500).json({ message: '获取复习题目失败', error: error.message });
    }
  }
);

// 标记复习完成
router.post('/complete',
  auth,
  [
    body('questionId').isUUID().withMessage('无效的错题ID')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { questionId } = req.body;

      const errorQuestion = await ErrorQuestion.findOne({
        where: { id: questionId }
      });

      if (!errorQuestion) {
        return res.status(404).json({ message: '错题不存在' });
      }

      // 验证用户权限
      const child = await ChildProfile.findOne({
        where: { id: errorQuestion.childId, familyUserId: req.user.id }
      });

      if (!child) {
        return res.status(403).json({ message: '无权限操作此错题' });
      }

      // 更新错题状态为已复习
      await ErrorQuestion.update(
        { 
          reviewStatus: 'reviewed',
          lastReviewedAt: new Date(),
          reviewCount: (errorQuestion.reviewCount || 0) + 1
        },
        { where: { id: questionId } }
      );

      res.json({
        success: true,
        message: '复习完成状态已更新'
      });
    } catch (error) {
      console.error('标记复习完成错误:', error);
      res.status(500).json({ message: '更新复习状态失败', error: error.message });
    }
  }
);

// 获取用户提醒设置
router.get('/settings',
  auth,
  async (req, res) => {
    try {
      const children = await ChildProfile.findAll({
        where: { familyUserId: req.user.id },
        include: [{
          model: ReviewReminder,
          required: false
        }]
      });

      const settings = children.map(child => ({
        childId: child.id,
        childName: child.nickname,
        reminders: child.ReviewReminders || []
      }));

      res.json({
        success: true,
        data: settings
      });
    } catch (error) {
      console.error('获取提醒设置错误:', error);
      res.status(500).json({ message: '获取提醒设置失败', error: error.message });
    }
  }
);

module.exports = router;