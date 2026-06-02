-- =============================================
-- 健康助手 Supabase 数据库初始化
-- 在 Supabase SQL Editor 中运行此脚本
-- =============================================

-- 1. 用户档案
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  name TEXT DEFAULT '',
  age INT DEFAULT 25,
  gender TEXT DEFAULT 'male',
  height REAL DEFAULT 170,
  weight REAL DEFAULT 70,
  goal TEXT DEFAULT 'maintain',
  activity_level TEXT DEFAULT 'moderate',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 饮食记录
CREATE TABLE IF NOT EXISTS food_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  food_name TEXT NOT NULL,
  quantity REAL DEFAULT 1,
  calories REAL NOT NULL,
  protein REAL DEFAULT 0,
  carbs REAL DEFAULT 0,
  fat REAL DEFAULT 0,
  record_date DATE NOT NULL,
  client_id TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 运动记录
CREATE TABLE IF NOT EXISTS exercise_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  exercise_name TEXT NOT NULL,
  exercise_icon TEXT DEFAULT '',
  duration INT NOT NULL,
  calories REAL NOT NULL,
  distance REAL DEFAULT 0,
  heart_rate INT DEFAULT 0,
  record_date DATE NOT NULL,
  client_id TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 健康设备数据
CREATE TABLE IF NOT EXISTS health_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  steps INT DEFAULT 0,
  heart_rate INT DEFAULT 0,
  calories REAL DEFAULT 0,
  distance REAL DEFAULT 0,
  record_date DATE NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, record_date)
);

-- =============================================
-- 行级安全策略 (RLS)
-- =============================================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_snapshots ENABLE ROW LEVEL SECURITY;

-- 用户档案策略
CREATE POLICY "用户只能看自己的档案"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "用户可以创建自己的档案"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可以更新自己的档案"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- 饮食记录策略
CREATE POLICY "用户只能看自己的饮食记录"
  ON food_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "用户可以添加自己的饮食记录"
  ON food_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可以删除自己的饮食记录"
  ON food_logs FOR DELETE
  USING (auth.uid() = user_id);

-- 运动记录策略
CREATE POLICY "用户只能看自己的运动记录"
  ON exercise_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "用户可以添加自己的运动记录"
  ON exercise_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可以删除自己的运动记录"
  ON exercise_logs FOR DELETE
  USING (auth.uid() = user_id);

-- 健康数据策略
CREATE POLICY "用户只能看自己的健康数据"
  ON health_snapshots FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "用户可以添加自己的健康数据"
  ON health_snapshots FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可以更新自己的健康数据"
  ON health_snapshots FOR UPDATE
  USING (auth.uid() = user_id);

-- =============================================
-- 索引
-- =============================================
CREATE INDEX IF NOT EXISTS idx_food_logs_user_date ON food_logs(user_id, record_date);
CREATE INDEX IF NOT EXISTS idx_exercise_logs_user_date ON exercise_logs(user_id, record_date);
CREATE INDEX IF NOT EXISTS idx_health_snapshots_user_date ON health_snapshots(user_id, record_date);
