# 健康助手 — 上线部署指南

按顺序完成以下步骤。

---

## 1. 注册服务

### 1.1 DeepSeek (AI 对话)
- 打开 https://platform.deepseek.com/
- 注册 → 创建 API Key
- 充值（最低 ¥10）
- 将 Key 填入 `.env` 的 `EXPO_PUBLIC_DEEPSEEK_API_KEY`

### 1.2 百度 AI (语音识别 / 食物识别)
- 打开 https://console.bce.baidu.com/ → 人工智能 → 语音识别
- 创建应用，获取 API Key 和 Secret Key
- 填入 `.env`

### 1.3 Cloudflare Worker (API 代理，可选但推荐)
- 打开 https://dash.cloudflare.com/ → Workers 和 Pages
- 创建 Worker，名称 `health-app-api-proxy`
- 将 `workers/api-proxy/src/index.js` 的内容复制到编辑器中
- 保存并部署
- 在 Worker 设置中设置 Secret `DEEPSEEK_API_KEY`（值就是你的 DeepSeek Key）
- 部署后记下 Worker URL：`https://health-app-api-proxy.xxxx.workers.dev`
- 填入 `.env` 的 `EXPO_PUBLIC_API_WORKER_URL`

### 1.4 Supabase (云端数据同步，可选)
- 打开 https://supabase.com/ → Start a project
- 填写项目名称，设置安全的数据库密码
- 创建完成后，进入 SQL Editor
- 打开 `supabase/migrations/0001_init.sql`，复制全部内容到 SQL Editor
- 运行 SQL 脚本
- 进入 Project Settings → API：
  - `Project URL` → 填入 `.env` 的 `EXPO_PUBLIC_SUPABASE_URL`
  - `anon public` key → 填入 `.env` 的 `EXPO_PUBLIC_SUPABASE_ANON_KEY`

### 1.5 Sentry (错误监控，可选)
- 打开 https://sentry.io/ → 注册
- 创建项目 → 选择 React Native
- 获取 DSN（`https://xxxx@sentry.io/123`）
- 填入 `.env` 的 `EXPO_PUBLIC_SENTRY_DSN`
- 安装依赖：`npx expo install @sentry/react-native`

### 1.6 GitHub
- 打开 https://github.com/new
- 创建仓库（不勾选 README/.gitignore）
- 回到项目目录运行：

```bash
git init
git add .
git commit -m "feat: initial commit"
git branch -M main
git remote add origin https://github.com/你的用户名/healthapp.git
git push -u origin main
```

---

## 2. 本地运行

```bash
# 安装依赖
npm install

# 确保 .env 已配置好所有密钥
# 启动开发服务器
npx expo start
```

---

## 3. 构建 APK (Android)

需要先配置 EAS:

```bash
# 安装 EAS CLI
npm install -g eas-cli

# 登录 Expo 账号
eas login

# 构建开发版本
eas build --profile development --platform android

# 构建正式版本
eas build --profile production --platform android
```

---

## 4. CI/CD

项目已包含 `.github/workflows/ci.yml`，推送后自动运行 TypeScript 类型检查。

如果配置了 Sentry，在 GitHub 仓库 Settings → Secrets 中添加：

| Secret | 值 |
|--------|-----|
| `EXPO_PUBLIC_DEEPSEEK_API_KEY` | (实际 Key) |
| `EXPO_PUBLIC_SUPABASE_URL` | (实际 URL) |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | (实际 Key) |
| `EXPO_PUBLIC_SENTRY_DSN` | (实际 DSN) |

---

## 5. 更新 Config (如果需要修改)

- 添加新 API Key → `src/config/env.ts`
- 修改应用名/图标 → `app.json`
- 修改数据库结构 → `supabase/migrations/`

---

## 6. 环境变量清单

| 变量 | 必需 | 来源 |
|------|------|------|
| `EXPO_PUBLIC_DEEPSEEK_API_KEY` | 是 | DeepSeek Platform |
| `EXPO_PUBLIC_API_WORKER_URL` | 否 | Cloudflare Worker |
| `EXPO_PUBLIC_SUPABASE_URL` | 否 | Supabase Project Settings |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | 否 | Supabase Project Settings |
| `EXPO_PUBLIC_SENTRY_DSN` | 否 | Sentry Project Settings |
| `EXPO_PUBLIC_BAIDU_API_KEY` | 否 | 百度 AI 控制台 |
| `EXPO_PUBLIC_BAIDU_SECRET_KEY` | 否 | 百度 AI 控制台 |

---

## 目录结构

```
HealthApp/
├── .github/workflows/ci.yml     # CI 配置
├── workers/api-proxy/            # Cloudflare Worker
├── supabase/migrations/          # 数据库迁移
├── src/
│   ├── config/env.ts             # 环境变量配置
│   ├── services/
│   │   ├── aiAssistantService.ts # AI 对话 (DeepSeek)
│   │   ├── supabaseService.ts    # 云端同步
│   │   ├── sentryService.ts      # 错误监控
│   │   ├── healthConnectService.ts # 健康设备
│   │   └── foodRecognitionService.ts # 食物识别
│   ├── store/                    # Zustand 状态管理
│   ├── components/               # 全局组件
│   │   ├── ErrorBoundary.tsx     # 错误边界
│   │   └── CloudSync.tsx         # 云同步触发
│   └── utils/logger.ts           # 生产日志
├── app.json                      # Expo 配置
├── eas.json                      # EAS Build 配置
└── .env                          # 本地环境变量
```
