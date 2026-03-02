#!/bin/bash

set -e

echo "🚀 开始 GitHub 在线构建流程..."

# 1. 安装依赖
echo "📦 安装项目依赖..."
npm install

# 2. 安装 EAS CLI
echo "🔧 安装 EAS CLI..."
npm install -g eas-cli

# 3. 配置 Expo 凭证（从环境变量获取）
echo "🔑 配置 Expo 凭证..."
if [ -z "$EXPO_TOKEN" ]; then
    echo "❌ 错误: 未设置 EXPO_TOKEN 环境变量"
    exit 1
fi

# 4. 登录 Expo
echo "🔐 登录 Expo..."
npx expo login --token $EXPO_TOKEN

# 5. 构建 Android 应用
echo "📱 开始构建 Android 应用..."
npx eas build --platform android --non-interactive

# 6. 构建 iOS 应用（如果需要）
# echo "🍎 开始构建 iOS 应用..."
# npx eas build --platform ios --non-interactive

echo "✅ 构建完成！APK 文件将通过 GitHub Actions 工件提供下载。"

# 7. 监控构建状态
echo "🔍 监控构建状态..."
BUILD_STATUS=$(npx eas build:list --limit 1 --json | jq -r '.[0].status')
while [[ "$BUILD_STATUS" == "IN_QUEUE" || "$BUILD_STATUS" == "IN_PROGRESS" ]]; do
    echo "⏳ 构建进行中... 当前状态: $BUILD_STATUS"
    sleep 30
    BUILD_STATUS=$(npx eas build:list --limit 1 --json | jq -r '.[0].status')
done

if [[ "$BUILD_STATUS" == "FINISHED" ]]; then
    echo "🎉 构建成功完成！"
    # 获取构建结果
    npx eas build:details --build-id $(npx eas build:list --limit 1 --json | jq -r '.[0].id')
else
    echo "❌ 构建失败！状态: $BUILD_STATUS"
    exit 1
fi