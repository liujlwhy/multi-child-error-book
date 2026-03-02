# 阿里云生产环境部署方案

## 架构设计
- **ECS实例**：应用服务器部署
- **OSS存储**：图片和PDF文件存储
- **MongoDB Atlas**：数据库服务（或自建MongoDB）
- **CDN**：静态资源加速（可选）

## ECS实例配置
- **实例规格**：ecs.g6.large (2核8GB内存)
- **操作系统**：Alibaba Cloud Linux 3
- **安全组**：开放80/443/3000端口
- **数据盘**：100GB SSD云盘

## 环境变量配置
```bash
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/errorbook

# Aliyun OSS Configuration  
ALIYUN_ACCESS_KEY_ID=your_production_access_key
ALIYUN_ACCESS_KEY_SECRET=your_production_secret
ALIYUN_OSS_REGION=cn-hangzhou
ALIYUN_OSS_BUCKET=errorbook-production-bucket

# OCR Service Configuration
OCR_API_KEY=production_ocr_api_key
OCR_ENDPOINT=https://api.ocr-service.com/v1/recognize

# Redis Configuration
REDIS_HOST=redis.production.cache
REDIS_PORT=6379

# JWT Authentication
JWT_SECRET=strong_production_jwt_secret_32_chars_min
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://errorbook.example.com
```

## PM2进程管理配置
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'errorbook-api',
    script: 'src/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss'
  }]
};
```

## Nginx反向代理配置
```nginx
server {
    listen 80;
    server_name errorbook.example.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    location /pdfs/ {
        alias /home/admin/multi-child-error-book/public/pdfs/;
        expires 1d;
    }
}
```

## SSL证书配置（Let's Encrypt）
```bash
# 安装Certbot
sudo yum install certbot python3-certbot-nginx

# 获取SSL证书
sudo certbot --nginx -d errorbook.example.com

# 自动续期
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

## 监控与日志
- **日志轮转**：logrotate配置
- **健康检查**：/health端点监控
- **性能监控**：阿里云云监控集成
- **错误追踪**：Sentry集成（可选）

## 备份策略
- **数据库备份**：每日自动备份到OSS
- **代码备份**：Git版本控制 + 定期快照
- **文件备份**：OSS跨区域复制

## 部署步骤
1. 创建ECS实例和OSS Bucket
2. 配置安全组和域名解析
3. 安装Node.js、MongoDB客户端、Nginx
4. 克隆代码仓库
5. 安装依赖并配置环境变量
6. 启动PM2进程管理
7. 配置Nginx反向代理
8. 申请SSL证书
9. 配置监控和备份
10. 进行最终测试