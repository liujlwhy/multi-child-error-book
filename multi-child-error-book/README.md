# 智能错题集APP - 多子女家庭版

## 项目概述
一款专为多子女家庭设计的智能错题管理应用，部署在阿里云上，帮助不同年级的孩子高效整理错题、精准攻克薄弱知识点。

## 核心功能
- ✅ 多孩子账号与一键切换
- ✅ 智能拍照录入与手写去除
- ✅ 多维度错题库管理
- ✅ 举一反三与智能出题
- ✅ PDF生成与导出打印
- ✅ 定时复习提醒

## 技术架构
- **后端**: Node.js + Express + MongoDB
- **前端**: React Native (跨平台移动应用)
- **AI服务**: 阿里云OCR + 自研图像处理算法
- **云服务**: 阿里云ECS + OSS + MongoDB Atlas
- **部署**: Docker + Nginx + PM2

## 目录结构
```
multi-child-error-book/
├── src/                    # 后端源码
│   ├── models/            # 数据模型
│   ├── routes/            # API路由
│   ├── services/          # 业务逻辑服务
│   └── config/            # 配置文件
├── mobile-app/            # React Native前端
├── test/                  # 测试文件
├── Dockerfile             # Docker配置
├── docker-compose.yml     # 容器编排
├── nginx.conf             # Nginx配置
├── deploy-to-aliyun.sh    # 部署脚本
└── ARCHITECTURE.md        # 架构设计文档
```

## 快速开始

### 1. 环境准备
```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入阿里云凭证和数据库连接信息
```

### 2. 启动开发服务器
```bash
# 启动后端
npm run dev

# 启动前端 (在 mobile-app 目录)
npm start
```

### 3. 生产部署
```bash
# 构建Docker镜像
docker build -t error-book-app .

# 使用docker-compose启动
docker-compose up -d

# 或使用部署脚本
chmod +x deploy-to-aliyun.sh
./deploy-to-aliyun.sh
```

## 阿里云部署指南

### 1. 创建ECS实例
- 选择Ubuntu 20.04 LTS
- 配置至少2核4GB内存
- 开放端口: 80, 443, 3000

### 2. 配置OSS存储桶
- 创建OSS Bucket用于存储图片和PDF
- 配置CORS规则允许前端访问

### 3. 数据库配置
- 使用MongoDB Atlas或阿里云MongoDB
- 创建数据库用户和权限

### 4. 域名和SSL
- 配置域名解析到ECS公网IP
- 使用Let's Encrypt获取免费SSL证书

## 功能验收测试

### 1. 多账号切换
- 创建两个孩子的档案
- 验证数据完全隔离
- 测试一键切换功能

### 2. 拍照处理
- 测试10张带手写的试卷
- 验证去手写效果和OCR准确率

### 3. 举一反三
- 针对5道数学错题测试推荐
- 验证知识点相关性

### 4. PDF导出
- 导出包含错题和解析的PDF
- 打印测试格式正确性

### 5. 提醒功能
- 设置复习提醒
- 验证推送通知准确性

## 性能优化
- 图像处理响应时间: < 5秒
- API响应时间: < 1秒
- 支持并发用户: 1000+

## 安全特性
- 数据传输加密 (HTTPS)
- 用户数据加密存储
- JWT身份验证
- 输入验证和XSS防护

## 许可证
MIT License