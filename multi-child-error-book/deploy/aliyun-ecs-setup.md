# 阿里云ECS部署指南

## 1. ECS实例配置
- 实例规格：ecs.t5-lc1m2.small（1核2GB）
- 操作系统：Ubuntu 20.04 LTS
- 安全组规则：
  - 入方向：80(HTTP), 443(HTTPS), 22(SSH)
  - 出方向：全部允许

## 2. 环境依赖安装
```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装Node.js 16.x
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# 启动MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# 安装Nginx
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx

# 安装PM2
sudo npm install -g pm2
```

## 3. 应用部署
```bash
# 克隆项目
git clone your-repo-url /home/admin/errorbook-app
cd /home/admin/errorbook-app

# 安装依赖
npm install --production

# 配置环境变量
cp .env.example .env
# 编辑.env文件，填入实际配置

# 启动应用
pm2 start deploy/pm2.config.js --env production
pm2 save
```

## 4. Nginx配置
```bash
# 复制Nginx配置
sudo cp deploy/nginx.conf /etc/nginx/sites-available/errorbook
sudo ln -s /etc/nginx/sites-available/errorbook /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 5. SSL证书配置（可选）
使用Let's Encrypt免费SSL证书：
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

## 6. 监控和日志
- PM2日志：`pm2 logs errorbook-api`
- Nginx日志：`/var/log/nginx/error.log`
- 应用日志：`/home/admin/errorbook-app/logs/`