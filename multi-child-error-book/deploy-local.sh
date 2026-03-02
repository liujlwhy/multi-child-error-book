#!/bin/bash

# 本地服务器部署脚本
set -e

echo "🚀 开始在本地服务器部署多子女智能错题集APP..."

# 1. 复制本地环境配置
echo "📋 复制本地环境配置..."
cp .env.local .env

# 2. 安装依赖
echo "📦 安装依赖..."
npm ci --only=production

# 3. 初始化数据库
echo "🔄 初始化数据库..."
node scripts/init-database.js

# 4. 创建必要目录
echo "📁 创建必要目录..."
mkdir -p public/pdfs logs

# 5. 启动应用（使用nohup，避免权限问题）
echo "🚀 启动应用..."
if pgrep -f "node src/server.js" > /dev/null; then
    echo "⚠️  应用已在运行，停止现有进程..."
    pkill -f "node src/server.js"
    sleep 2
fi

nohup npm start > logs/app.log 2>&1 &
echo $! > logs/app.pid

# 6. 验证部署
echo "✅ 验证部署状态..."
sleep 10

if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo "🎉 部署成功！"
    echo "应用查看地址: http://localhost:3000"
    echo "日志文件: logs/app.log"
    echo "进程ID: $(cat logs/app.pid)"
else
    echo "❌ 服务启动失败"
    tail -20 logs/app.log
    exit 1
fi

# 7. 设置定时任务（用于复习提醒）
echo "⏰ 设置定时任务..."
(crontab -l 2>/dev/null; echo "0 19 * * * cd /home/admin/.openclaw/workspace/multi-child-error-book && node src/services/reminderService.js") | crontab -

echo "📱 移动端APP访问地址:"
echo "http://$(hostname -I | awk '{print $1}'):3000"