const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const { ChildProfile, FamilyUser } = require('../models');
const auth = require('../middleware/auth');

// 创建孩子档案
router.post('/',
  auth,
  [
    body('name').notEmpty().withMessage('姓名不能为空').trim(),
    body('grade').notEmpty().withMessage('年级不能为空').trim(),
    body('subjects').isArray({ min: 1 }).withMessage('至少选择一个学科'),
    body('subjects.*').isIn(['数学', '语文', '英语', '物理', '化学', '生物', '历史', '地理', '政治', '科学'])
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, grade, subjects } = req.body;
      
      // 检查用户是否已达到孩子数量限制（这里假设最多5个孩子）
      const existingChildrenCount = await ChildProfile.count({ where: { familyUserId: req.user.id } });
      if (existingChildrenCount >= 5) {
        return res.status(400).json({ message: '每个账户最多可创建5个孩子档案' });
      }

      const child = await ChildProfile.create({
        familyUserId: req.user.id,
        nickname: name,
        grade: grade,
        subjects: subjects
      });

      res.status(201).json(child);
    } catch (error) {
      console.error('创建孩子档案错误:', error);
      res.status(500).json({ message: '服务器内部错误' });
    }
  }
);

// 获取所有孩子档案
router.get('/',
  auth,
  async (req, res) => {
    try {
      const children = await ChildProfile.findAll({ 
        where: { familyUserId: req.user.id },
        attributes: { exclude: ['password'] }
      });
      res.json(children);
    } catch (error) {
      console.error('获取孩子档案列表错误:', error);
      res.status(500).json({ message: '服务器内部错误' });
    }
  }
);

// 获取单个孩子档案
router.get('/:id',
  auth,
  [
    param('id').isUUID().withMessage('无效的孩子ID')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const child = await ChildProfile.findOne({ 
        where: { 
          id: req.params.id, 
          familyUserId: req.user.id 
        },
        attributes: { exclude: ['password'] }
      });

      if (!child) {
        return res.status(404).json({ message: '未找到对应的孩子档案' });
      }

      res.json(child);
    } catch (error) {
      console.error('获取孩子档案错误:', error);
      res.status(500).json({ message: '服务器内部错误' });
    }
  }
);

// 更新孩子档案
router.put('/:id',
  auth,
  [
    param('id').isUUID().withMessage('无效的孩子ID'),
    body('name').optional().trim(),
    body('grade').optional().trim(),
    body('subjects').optional().isArray({ min: 1 }),
    body('subjects.*').optional().isIn(['数学', '语文', '英语', '物理', '化学', '生物', '历史', '地理', '政治', '科学'])
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const child = await ChildProfile.findOne({ 
        where: { 
          id: req.params.id, 
          familyUserId: req.user.id 
        }
      });

      if (!child) {
        return res.status(404).json({ message: '未找到对应的孩子档案' });
      }

      const { name, grade, subjects } = req.body;
      if (name !== undefined) child.nickname = name;
      if (grade !== undefined) child.grade = grade;
      if (subjects !== undefined) child.subjects = subjects;

      await child.save();

      res.json(child);
    } catch (error) {
      console.error('更新孩子档案错误:', error);
      res.status(500).json({ message: '服务器内部错误' });
    }
  }
);

// 删除孩子档案
router.delete('/:id',
  auth,
  [
    param('id').isUUID().withMessage('无效的孩子ID')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const child = await ChildProfile.destroy({ 
        where: { 
          id: req.params.id, 
          familyUserId: req.user.id 
        }
      });

      if (!child) {
        return res.status(404).json({ message: '未找到对应的孩子档案' });
      }

      // TODO: 同时删除该孩子相关的所有错题数据
      res.json({ message: '孩子档案已成功删除' });
    } catch (error) {
      console.error('删除孩子档案错误:', error);
      res.status(500).json({ message: '服务器内部错误' });
    }
  }
);

module.exports = router;