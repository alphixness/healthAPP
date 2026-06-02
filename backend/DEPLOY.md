# HealthApp 部署指南

## 方案一：Railway.app（推荐，免费测试）

### 1. 推送代码到 GitHub

```bash
# 在项目根目录初始化 Git
cd /d/projects/healthManagement
git init
git add -A

# 检查 .gitignore 确保 .env 和 node_modules 不被提交
cat backend/.gitignore

# 提交
git commit -m "feat: init healthapp backend"

# 在 GitHub 新建仓库后关联推送
git remote add origin https://github.com/你的用户名/healthapp-backend.git
git push -u origin main
```

### 2. 在 Railway 部署

1. 打开 https://railway.app 注册账号（GitHub 登录）
2. 点击 **New Project** → **Deploy from GitHub repo**
3. 选择刚才推送的仓库
4. 在项目中点击 **Raw/Command**，填入启动命令：
   ```
   npx tsx src/index.ts
   ```
5. 在 **Variables** 中配置环境变量（点击 **New Variable**）：

| 变量 | 值 | 说明 |
|------|-----|------|
| `NODE_ENV` | `production` | 生产模式 |
| `PORT` | `3001` | Railway 会自动映射 |
| `JWT_SECRET` | `openssl rand -hex 32` 生成的密钥 | 用于签发 JWT |
| `JWT_REFRESH_SECRET` | `openssl rand -hex 32` 生成的密钥 | 用于刷新令牌 |
| `PAYMENT_WEBHOOK_SECRET` | `openssl rand -hex 32` 生成的密钥 | 支付签名 |
| `CORS_ORIGINS` | `https://你的前端域名` | 跨域白名单 |
| `DATABASE_PATH` | `/data/healthapp.db` | 数据库路径 |
| `LOG_LEVEL` | `info` | 日志级别 |

### 3. 数据库持久化（可选，免费版可用）

Railway 每次部署会重置文件系统，要保留数据需要创建 Volume：

1. 在项目页面点击 **New** → **Volume**
2. 挂载路径填写 `/data`
3. Railway 会自动将 `/data` 目录持久化

### 4. 获取部署域名

部署成功后 Railway 会自动分配一个 `https://xxx.up.railway.app` 域名。

验证：
```bash
curl https://你的项目域名.up.railway.app/api/health
```

### 5. 绑定自定义域名（可选）

在项目 Settings → Domains 中添加你的域名。

---

## 方案二：腾讯云 / 阿里云 ECS

### 1. 购买云服务器

推荐配置：
- **CPU**: 2 核
- **内存**: 2GB
- **系统盘**: 40GB SSD
- **带宽**: 5Mbps
- **系统**: Ubuntu 22.04 LTS
- **价格**: 新用户免费试用 1 个月，之后约 ¥100-200/月

在云控制台安全组中开放端口：22、80、443

### 2. 连接服务器

```bash
ssh root@你的服务器IP
```

### 3. 安装基础环境

```bash
apt update && apt upgrade -y

# Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs nginx certbot python3-certbot-nginx git

# PM2
npm install -g pm2

node --version
```

### 4. 部署代码

```bash
mkdir -p /opt/healthapp
cd /opt/healthapp
git clone https://github.com/你的用户名/healthapp-backend.git backend
cd backend

cp .env.example .env
vi .env  # 编辑配置

npm install
npm run migrate
npm run seed
```

### 5. PM2 进程管理

```bash
pm2 start ecosystem.config.js
pm2 startup systemd
pm2 save
```

### 6. Nginx + HTTPS

```bash
cat > /etc/nginx/sites-available/healthapp << 'EOF'
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

ln -s /etc/nginx/sites-available/healthapp /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
certbot --nginx -d your-domain.com
```

### 7. 定时备份

```bash
crontab -e
0 3 * * * cd /opt/healthapp/backend && bash scripts/backup-db.sh >> /var/log/healthapp-backup.log 2>&1
```

### 8. 验证

```bash
curl https://your-domain.com/api/health
curl -X POST https://your-domain.com/api/v1/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com","password":"test123456"}'
```

---

## APK 连接后端

在 `HealthApp/.env` 中设置：
```
EXPO_PUBLIC_API_URL=https://你的后端域名
```

构建 APK：
```bash
cd HealthApp
eas build --platform android --profile production
```

## 常用运维命令

```bash
pm2 status                              # 进程状态
pm2 logs healthapp-backend --lines 50   # 查看日志
pm2 restart healthapp-backend            # 重启
git pull && npm install && pm2 restart   # 更新部署
du -sh backend/data/                     # 数据库大小
```
