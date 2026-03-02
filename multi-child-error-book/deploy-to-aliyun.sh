#!/bin/bash

# 阿里云部署脚本
set -e

echo "🚀 开始部署多子女智能错题集APP到阿里云..."

# 1. 检查环境变量
if [ -z "$ALIYUN_ACCESS_KEY_ID" ] || [ -z "$ALIYUN_ACCESS_KEY_SECRET" ]; then
    echo "❌ 请先配置阿里云访问密钥"
    echo "export ALIYUN_ACCESS_KEY_ID=your_access_key_id"
    echo "export ALIYUN_ACCESS_KEY_SECRET=your_access_key_secret"
    exit 1
fi

# 2. 复制生产环境配置
echo "📋 复制生产环境配置..."
cp .env.production .env

# 3. 构建Docker镜像
echo "📦 构建Docker镜像..."
docker build -t multi-child-error-book:latest .

# 4. 启动服务
echo "🐳 启动服务..."
docker-compose up -d

# 5. 验证部署
echo "✅ 验证部署状态..."
sleep 15
curl -f http://localhost:3000/health || {
    echo "❌ 服务启动失败"
    docker-compose logs errorbook-api
    exit 1
}

echo "🎉 部署成功！"
echo "后端API地址: http://$(hostname -I | awk '{print $1}'):3000"
echo "移动端APP需要单独构建和安装"

# 6. 设置定时任务（用于复习提醒）
echo "⏰ 设置定时任务..."
(crontab -l 2>/dev/null; echo "0 19 * * * /usr/bin/docker exec $(docker-compose ps -q errorbook-api) node src/services/reminderService.js") | crontab -

# 7. 清理临时文件
echo "🧹 清理临时文件..."
rm -f .env

echo "📱 移动端APP构建命令:"
echo "cd mobile-app && npm install && npx react-native run-android"