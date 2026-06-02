# 健康饮食管理APP - HealthApp

一款基于AI技术的智能健康饮食管理移动应用，帮助用户轻松管理每日营养摄入，实现健康生活目标。

## 核心功能

### 🤳 AI拍照识别
- 拍照或从相册选择食物照片
- AI智能识别食物成分
- 自动分析热量和营养成分
- 一键添加到饮食记录

### 📊 饮食追踪
- 记录每日的饮食摄入
- 可视化营养摄入进度
- 按餐次分类管理
- 查看历史饮食数据

### 📖 个性化食谱
- 智能推荐每周食谱
- 分类筛选查找
- 详细的食材和步骤
- 一键添加到今日计划

### 🏃 运动建议
- 个性化运动计划
- 多种运动类型
- 记录运动消耗
- 追踪运动目标

### 🤖 AI健康助手
- 语音/文字智能问答
- 个性化健康建议
- 饮食和运动咨询
- 多轮对话上下文

### 👤 个人中心
- 完善身体信息
- 设置健康目标
- 查看数据统计
- 个性化设置

## 技术栈

- **框架**: React Native + Expo
- **语言**: TypeScript
- **状态管理**: Zustand
- **导航**: React Navigation
- **UI组件**: 自定义组件 + Ionicons

## 项目结构

```
HealthApp/
├── src/
│   ├── components/          # 通用组件
│   │   ├── NutritionProgress.tsx
│   │   ├── QuickActions.tsx
│   │   └── HealthTip.tsx
│   ├── screens/            # 页面
│   │   ├── HomeScreen.tsx
│   │   ├── CameraScreen.tsx
│   │   ├── MealsScreen.tsx
│   │   ├── RecipesScreen.tsx
│   │   ├── ExerciseScreen.tsx
│   │   ├── AssistantScreen.tsx
│   │   └── ProfileScreen.tsx
│   ├── navigation/         # 导航配置
│   │   └── AppNavigator.tsx
│   └── store/              # 状态管理
│       └── nutritionStore.ts
├── App.tsx                 # 应用入口
└── package.json
```

## 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn
- Expo CLI
- iOS/Android 模拟器或真机

### 安装依赖

```bash
cd HealthApp
npm install
```

### 运行应用

#### 开发模式 (推荐)

```bash
npx expo start
```

然后按提示选择运行方式：
- 按 `i` - 在 iOS 模拟器运行
- 按 `a` - 在 Android 模拟器运行
- 扫描二维码 - 在真机运行（需要 Expo Go App）

#### 使用模拟器

```bash
npx expo start --android
# 或
npx expo start --ios
```

### 构建生产版本

```bash
npx expo build:android    # Android
npx expo build:ios        # iOS
```

## 功能演示

### 首次使用

1. 打开应用进入首页
2. 点击右下角"我的"设置个人信息
3. 设置身高、体重、年龄、性别、健康目标
4. 系统自动计算每日营养需求

### 拍照识别

1. 点击首页中心的"拍照识别"按钮
2. 拍照或从相册选择食物照片
3. AI自动分析食物成分
4. 确认后自动添加到今日饮食记录

### 查看饮食记录

1. 点击底部"记录"Tab
2. 查看今日营养摄入统计
3. 按早餐/午餐/晚餐/零食分类查看
4. 追踪每日营养目标达成情况

### AI健康助手

1. 点击底部"首页"的AI助手悬浮按钮
2. 或在任意页面通过导航进入
3. 输入问题或使用快捷问题
4. 获取个性化的健康饮食建议

## 数据说明

- 所有数据默认存储在本地
- 支持数据持久化存储
- 后续版本将支持云端同步

## 开发说明

### 添加新依赖

```bash
npx expo install <package-name>
```

### 代码规范

- 使用 TypeScript 进行类型检查
- 组件采用函数式组件 + Hooks
- 样式使用 StyleSheet 对象
- 遵循 React Native 设计规范

## 后续规划

- [ ] 接入真实的AI食物识别API
- [ ] 实现云端数据同步
- [ ] 添加数据导出功能
- [ ] 接入可穿戴设备
- [ ] 增强AI对话能力
- [ ] 添加社交分享功能

## 许可证

MIT License

## 联系方式

如有问题或建议，请提交 Issue 或联系开发团队。

---

**让健康生活更简单** 🌿
