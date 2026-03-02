const express = require('express');
const router = express.Router();

// 健康检查端点
router.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'multi-child-error-book-api'
  });
});

module.exports = router;