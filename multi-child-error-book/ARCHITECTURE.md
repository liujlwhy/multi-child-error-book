# 智能错题集APP - 系统架构设计

## 1. 整体架构
采用微服务架构，部署在阿里云环境：

- **前端**: React Native (跨平台移动应用)
- **后端API**: Node.js + Express (RESTful API)
- **AI处理服务**: Python + FastAPI (独立微服务)
- **数据库**: MongoDB (文档型数据库，适合错题数据结构)
- **文件存储**: 阿里云OSS (图片、PDF等大文件)
- **缓存**: Redis (会话管理、临时数据缓存)
- **消息队列**: RabbitMQ (异步任务处理)

## 2. 技术栈选择理由

### 前端 (React Native)
- 跨平台支持 (iOS/Android)
- 热重载开发体验
- 丰富的UI组件库
- 良好的相机和文件系统集成

### 后端 (Node.js + Express)
- 高并发处理能力
- 丰富的阿里云SDK支持
- 快速开发API接口
- 良好的JSON数据处理

### AI服务 (Python + FastAPI)
- 优秀的计算机视觉库支持 (OpenCV, PIL)
- 强大的OCR库 (Tesseract, PaddleOCR)
- 机器学习框架集成 (PyTorch/TensorFlow)
- 异步处理能力

### 数据库 (MongoDB)
- 灵活的文档结构，适合错题数据
- 支持嵌套对象和数组
- 良好的查询性能
- 阿里云MongoDB服务支持

## 3. 阿里云部署架构

```
用户设备 → CDN(可选) → SLB负载均衡
                    ↓
                ECS集群 (Node.js API + Redis)
                    ↓
           MongoDB (阿里云MongoDB实例)
                    ↓
           OSS (图片、PDF存储)
                    ↓
           ECS (Python AI处理服务)
```

## 4. 核心功能模块划分

### 4.1 用户管理模块
- 多子女账户管理
- 一键切换功能
- 数据隔离机制

### 4.2 图像处理模块
- 手写去除算法
- OCR文字识别
- 图像质量优化

### 4.3 错题管理模块
- 错题分类存储
- 多维度筛选
- 年级学科配置

### 4.4 智能推荐模块
- 知识点标签系统
- 相似题目匹配
- 举一反三出题

### 4.5 PDF生成模块
- 排版引擎
- 多种输出模式
- 打印优化

### 4.6 推送提醒模块
- 定时任务调度
- 推送通知服务
- 复习计划管理

## 5. 数据模型设计

### User (家长账户)
```json
{
  "_id": "ObjectId",
  "email": "string",
  "phone": "string",
  "children": ["ObjectId"] // 子女ID数组
}
```

### Child (子女档案)
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId", // 关联家长
  "nickname": "string",
  "avatar": "string", // OSS URL
  "grade": "string", // 如 "三年级上"
  "subjects": ["string"], // 如 ["数学", "语文", "英语"]
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### ErrorQuestion (错题)
```json
{
  "_id": "ObjectId",
  "childId": "ObjectId", // 关联子女
  "subject": "string", // 学科
  "topic": "string", // 知识点
  "errorReason": "string", // 错误原因
  "originalImage": "string", // 原始图片OSS URL
  "cleanedImage": "string", // 去手写后图片OSS URL
  "ocrText": "string", // OCR识别文本
  "knowledgeTags": ["string"], // 知识点标签
  "createdAt": "Date",
  "reviewSchedule": [Date] // 复习计划
}
```

### SimilarQuestion (相似题目)
```json
{
  "_id": "ObjectId",
  "errorQuestionId": "ObjectId", // 关联错题
  "questionText": "string", // 题目内容
  "answer": "string", // 答案
  "explanation": "string", // 解析
  "difficulty": "number", // 难度等级
  "source": "string" // 题目来源
}
```

## 6. 性能优化策略

### 6.1 图像处理优化
- 使用WebP格式压缩图片
- 异步处理队列
- 缓存处理结果

### 6.2 数据库优化
- 索引优化 (childId, subject, createdAt)
- 分片策略 (按用户分片)
- 查询优化

### 6.3 缓存策略
- Redis缓存热门错题
- 会话缓存
- 配置缓存

## 7. 安全性考虑

### 7.1 数据安全
- HTTPS加密传输
- 数据库字段加密
- OSS文件访问控制

### 7.2 用户隐私
- GDPR合规
- 数据最小化原则
- 用户数据删除功能

### 7.3 API安全
- JWT认证
- 请求频率限制
- 输入验证

## 8. 部署方案

### 8.1 ECS配置
- 实例类型: ecs.g6.large (2核8G)
- 操作系统: Alibaba Cloud Linux 3
- 磁盘: 100GB SSD

### 8.2 数据库配置
- 阿里云MongoDB: 2核4G, 20GB存储
- 自动备份: 每日备份
- 监控告警: CPU/内存/磁盘使用率

### 8.3 OSS配置
- 存储类型: 标准存储
- 生命周期: 30天转低频访问
- CDN加速: 可选

### 8.4 监控告警
- 云监控: 应用性能监控
- 日志服务: 访问日志、错误日志
- 告警规则: 异常访问、高CPU使用率