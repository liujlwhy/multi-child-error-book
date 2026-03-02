const express = require('express');
const router = express.Router();

// 用户相关路由
const userRoutes = require('./user');
// 孩子档案路由
const childRoutes = require('./children');
// 错题路由
const errorQuestionRoutes = require('./errorQuestions');
// 图像处理路由
const imageRoutes = require('./image');
// PDF生成路由
const pdfRoutes = require('./pdfRoutes');
// 复习设置路由
const reviewSettingsRoutes = require('./reviewSettings');
// 健康检查路由
const healthRoutes = require('./health');

// 挂载路由
router.use('/api/users', userRoutes);
router.use('/api/children', childRoutes);
router.use('/api/questions', errorQuestionRoutes);
router.use('/api/images', imageRoutes);
router.use('/api/pdf', pdfRoutes);
router.use('/api/review-settings', reviewSettingsRoutes);
router.use('/health', healthRoutes);

module.exports = router;