#!/bin/bash

# 最终本地部署脚本
set -e

echo "🚀 开始最终部署多子女智能错题集APP..."

# 1. 复制环境配置
echo "📋 复制环境配置..."
cp .env.local .env

# 2. 安装依赖
echo "📦 安装依赖..."
npm ci --omit=dev

# 3. 初始化数据库
echo "🔄 初始化数据库..."
node scripts/init-database.js

# 4. 创建必要目录
echo "📁 创建必要目录..."
mkdir -p uploads public/pdfs logs

# 5. 启动应用（使用nohup）
echo "🚀 启动应用..."
nohup npm start > logs/app.log 2>&1 &

# 等待应用启动
sleep 10

# 6. 验证部署
echo "✅ 验证部署状态..."
if curl -f http://localhost:3000/health; then
    echo ""
    echo "🎉 部署成功！"
    echo "应用查看地址: http://localhost:3000"
    echo "健康检查: http://localhost:3000/health"
    echo "日志文件: logs/app.log"
else
    echo "❌ 服务启动失败"
    echo "查看日志: cat logs/app.log"
    exit 1
fi