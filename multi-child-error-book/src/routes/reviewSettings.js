const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const Child = require('../models/Child');
const ReviewScheduleManager = require('../services/ReviewScheduleManager');

// 获取孩子的复习设置
router.get('/:childId', authenticateToken, async (req, res) => {
  try {
    const { childId } = req.params;
    
    // 验证孩子属于当前用户
    const child = await Child.findOne({ 
      _id: childId, 
      userId: req.user.id 
    });
    
    if (!child) {
      return res.status(403).json({ success: false, message: 'Child not found or access denied' });
    }
    
    res.json({
      success: true,
      data: {
        dailyReminder: child.reviewSettings?.daily || false,
        weeklyReminder: child.reviewSettings?.weekly || false,
        reminderTime: child.reviewSettings?.reminderTime || '19:00',
        customSchedule: child.reviewSettings?.customSchedule || null
      }
    });
    
  } catch (error) {
    console.error('Error fetching review settings:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch review settings' });
  }
});

// 更新复习设置
router.put('/:childId', authenticateToken, async (req, res) => {
  try {
    const { childId } = req.params;
    const { dailyReminder, weeklyReminder, reminderTime, customSchedule } = req.body;
    
    // 验证孩子属于当前用户
    const child = await Child.findOne({ 
      _id: childId, 
      userId: req.user.id 
    });
    
    if (!child) {
      return res.status(403).json({ success: false, message: 'Child not found or access denied' });
    }
    
    // 更新复习设置
    child.reviewSettings = {
      daily: dailyReminder,
      weekly: weeklyReminder,
      reminderTime: reminderTime,
      customSchedule: customSchedule
    };
    
    await child.save();
    
    // 如果启用了自定义提醒，更新复习计划管理器
    if (customSchedule) {
      await ReviewScheduleManager.updateCustomSchedule(childId, customSchedule);
    }
    
    res.json({
      success: true,
      message: 'Review settings updated successfully',
      data: child.reviewSettings
    });
    
  } catch (error) {
    console.error('Error updating review settings:', error);
    res.status(500).json({ success: false, message: 'Failed to update review settings' });
  }
});

// 手动触发复习提醒
router.post('/trigger/:childId', authenticateToken, async (req, res) => {
  try {
    const { childId } = req.params;
    const { questionIds } = req.body;
    
    // 验证孩子属于当前用户
    const child = await Child.findOne({ 
      _id: childId, 
      userId: req.user.id 
    });
    
    if (!child) {
      return res.status(403).json({ success: false, message: 'Child not found or access denied' });
    }
    
    // 触发手动提醒
    const result = await ReviewScheduleManager.triggerManualReminder(childId, questionIds);
    
    res.json({
      success: result.success,
      message: result.message || 'Manual reminder triggered successfully'
    });
    
  } catch (error) {
    console.error('Error triggering manual reminder:', error);
    res.status(500).json({ success: false, message: 'Failed to trigger manual reminder' });
  }
});

module.exports = router;