-- ============================================================
-- HealthApp Backend Database Schema
-- ============================================================

-- USERS & AUTH

CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  email         TEXT UNIQUE,
  phone         TEXT UNIQUE,
  password_hash TEXT,
  wechat_openid TEXT UNIQUE,
  nickname      TEXT DEFAULT '',
  avatar_url    TEXT DEFAULT '',
  role          TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin', 'fitness_blogger', 'food_blogger')),
  created_at    TEXT DEFAULT (datetime('now')),
  updated_at    TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS user_profiles (
  user_id           TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  height            REAL NOT NULL,
  weight            REAL NOT NULL,
  age               INTEGER NOT NULL,
  gender            TEXT NOT NULL CHECK(gender IN ('male', 'female')),
  goal              TEXT NOT NULL CHECK(goal IN ('lose', 'maintain', 'gain')),
  activity_level    TEXT NOT NULL CHECK(activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  daily_calorie_target INTEGER DEFAULT 0,
  created_at        TEXT DEFAULT (datetime('now')),
  updated_at        TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token      TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sms_codes (
  id         TEXT PRIMARY KEY,
  phone      TEXT NOT NULL,
  code       TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  used       INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

-- EMAIL VERIFICATION

CREATE TABLE IF NOT EXISTS email_verifications (
  id         TEXT PRIMARY KEY,
  email      TEXT NOT NULL,
  token      TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  used       INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_email_verifications_email ON email_verifications(email, used);

-- HEALTH DATA

CREATE TABLE IF NOT EXISTS meal_records (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  record_date TEXT NOT NULL,
  meal_type   TEXT NOT NULL CHECK(meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  created_at  TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS food_logs (
  id             TEXT PRIMARY KEY,
  meal_record_id TEXT NOT NULL REFERENCES meal_records(id) ON DELETE CASCADE,
  food_name      TEXT NOT NULL,
  quantity       REAL NOT NULL DEFAULT 1,
  unit           TEXT DEFAULT 'g',
  calories       REAL NOT NULL DEFAULT 0,
  protein        REAL DEFAULT 0,
  carbs          REAL DEFAULT 0,
  fat            REAL DEFAULT 0,
  image_url      TEXT,
  created_at     TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS exercise_logs (
  id              TEXT PRIMARY KEY,
  user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exercise_name   TEXT NOT NULL,
  exercise_icon   TEXT DEFAULT '',
  exercise_type   TEXT DEFAULT '',
  duration        INTEGER NOT NULL,
  calories_burned REAL NOT NULL DEFAULT 0,
  heart_rate      INTEGER,
  distance        REAL,
  record_date     TEXT NOT NULL,
  created_at      TEXT DEFAULT (datetime('now'))
);

-- CONTENT

CREATE TABLE IF NOT EXISTS recipes (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  category     TEXT NOT NULL DEFAULT 'all',
  cover_emoji  TEXT DEFAULT '🍽️',
  cover_image  TEXT DEFAULT '',
  description  TEXT DEFAULT '',
  tags         TEXT DEFAULT '[]',
  difficulty   TEXT DEFAULT 'easy',
  cook_time    INTEGER DEFAULT 0,
  servings     INTEGER DEFAULT 1,
  calories     REAL DEFAULT 0,
  protein      REAL DEFAULT 0,
  carbs        REAL DEFAULT 0,
  fat          REAL DEFAULT 0,
  ingredients  TEXT NOT NULL DEFAULT '[]',
  steps        TEXT NOT NULL DEFAULT '[]',
  is_premium   INTEGER DEFAULT 0,
  is_member_only INTEGER DEFAULT 0,
  created_at   TEXT DEFAULT (datetime('now')),
  updated_at   TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS courses (
  id              TEXT PRIMARY KEY,
  creator_id      TEXT REFERENCES users(id),
  title           TEXT NOT NULL,
  cover_emoji     TEXT DEFAULT '💪',
  cover_image     TEXT DEFAULT '',
  video_url       TEXT,
  description     TEXT DEFAULT '',
  category        TEXT NOT NULL DEFAULT '减脂',
  difficulty      TEXT DEFAULT 'beginner',
  duration        INTEGER DEFAULT 0,
  calories        REAL DEFAULT 0,
  is_free         INTEGER DEFAULT 1,
  is_member_only  INTEGER DEFAULT 0,
  rating          REAL DEFAULT 0,
  tags            TEXT DEFAULT '[]',
  stats           TEXT DEFAULT '{}',
  created_at      TEXT DEFAULT (datetime('now')),
  updated_at      TEXT DEFAULT (datetime('now'))
);

-- COURSES & CONTENT (continued)

-- Blogger applications (user applies to become a blogger)
CREATE TABLE IF NOT EXISTS blogger_applications (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blogger_type  TEXT NOT NULL CHECK(blogger_type IN ('fitness', 'food')),
  display_name  TEXT NOT NULL DEFAULT '',
  bio           TEXT DEFAULT '',
  avatar_url    TEXT DEFAULT '',
  cover_url     TEXT DEFAULT '',
  status        TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
  created_at    TEXT DEFAULT (datetime('now')),
  updated_at    TEXT DEFAULT (datetime('now'))
);

-- Course contents (lessons/steps for each course)
CREATE TABLE IF NOT EXISTS course_contents (
  id          TEXT PRIMARY KEY,
  course_id   TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  content     TEXT DEFAULT '',
  video_url   TEXT,
  duration    INTEGER DEFAULT 0,
  sort_order  INTEGER DEFAULT 0,
  is_preview  INTEGER DEFAULT 0,
  created_at  TEXT DEFAULT (datetime('now')),
  updated_at  TEXT DEFAULT (datetime('now'))
);

-- User subscriptions (paid courses)
CREATE TABLE IF NOT EXISTS subscriptions (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id     TEXT REFERENCES courses(id) ON DELETE CASCADE,
  creator_id    TEXT REFERENCES users(id) ON DELETE CASCADE,
  type          TEXT NOT NULL CHECK(type IN ('course', 'creator')),
  amount        REAL NOT NULL DEFAULT 0,
  status        TEXT DEFAULT 'active' CHECK(status IN ('active', 'cancelled', 'expired')),
  start_date    TEXT NOT NULL DEFAULT (datetime('now')),
  end_date      TEXT,
  created_at    TEXT DEFAULT (datetime('now'))
);

-- MEMBERSHIPS (platform premium membership)

CREATE TABLE IF NOT EXISTS memberships (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tier          TEXT NOT NULL DEFAULT 'premium' CHECK(tier IN ('premium')),
  status        TEXT DEFAULT 'active' CHECK(status IN ('active', 'cancelled', 'expired')),
  start_date    TEXT NOT NULL DEFAULT (datetime('now')),
  end_date      TEXT,
  auto_renew    INTEGER DEFAULT 1,
  created_at    TEXT DEFAULT (datetime('now')),
  updated_at    TEXT DEFAULT (datetime('now'))
);

-- PERSONALIZED RECOMMENDATIONS

CREATE TABLE IF NOT EXISTS daily_recommendations (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date          TEXT NOT NULL,
  type          TEXT NOT NULL CHECK(type IN ('meal', 'exercise')),
  content       TEXT NOT NULL DEFAULT '{}',
  is_completed  INTEGER DEFAULT 0,
  created_at    TEXT DEFAULT (datetime('now'))
);

-- BLOGGER STATS (denormalized for performance)
CREATE TABLE IF NOT EXISTS blogger_stats (
  user_id       TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  recipes_count INTEGER DEFAULT 0,
  courses_count INTEGER DEFAULT 0,
  followers_count INTEGER DEFAULT 0,
  total_views   INTEGER DEFAULT 0,
  total_likes   INTEGER DEFAULT 0,
  updated_at    TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sync_log (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entity     TEXT NOT NULL,
  direction  TEXT NOT NULL CHECK(direction IN ('upload', 'download')),
  count      INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

-- INDEXES

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_wechat ON users(wechat_openid);
CREATE INDEX IF NOT EXISTS idx_meal_records_user_date ON meal_records(user_id, record_date);
CREATE INDEX IF NOT EXISTS idx_exercise_logs_user_date ON exercise_logs(user_id, record_date);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_sms_codes_phone ON sms_codes(phone, used);
CREATE INDEX IF NOT EXISTS idx_sync_log_user ON sync_log(user_id, entity);

-- ============================================================
-- APP AUTO-UPDATE
-- ============================================================

CREATE TABLE IF NOT EXISTS app_releases (
  id            TEXT PRIMARY KEY,
  version_code  INTEGER NOT NULL,
  version_name  TEXT NOT NULL,
  apk_url       TEXT NOT NULL,
  file_size     INTEGER DEFAULT 0,
  release_notes TEXT DEFAULT '',
  force_update  INTEGER DEFAULT 0,
  created_at    TEXT DEFAULT (datetime('now'))
);

-- ============================================================
-- LLM PROVIDER CONFIGURATION (admin-managed)
-- ============================================================

CREATE TABLE IF NOT EXISTS llm_providers (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  provider_key  TEXT NOT NULL UNIQUE,
  api_url       TEXT NOT NULL,
  model_name    TEXT NOT NULL,
  api_key       TEXT NOT NULL DEFAULT '',
  region        TEXT NOT NULL CHECK(region IN ('china', 'global')),
  is_active     INTEGER DEFAULT 1,
  sort_order    INTEGER DEFAULT 0,
  created_at    TEXT DEFAULT (datetime('now')),
  updated_at    TEXT DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO llm_providers (id, name, provider_key, api_url, model_name, api_key, region, sort_order)
VALUES
  ('lp_ds_chat', 'DeepSeek Chat', 'deepseek-chat', 'https://api.deepseek.com', 'deepseek-chat', '', 'china', 1),
  ('lp_qw_vl', 'Qwen Vision', 'qwen-vl', 'https://dashscope.aliyuncs.com', 'qwen3-vl-plus', '', 'china', 2),
  ('lp_baidu', '百度菜品识别', 'baidu-vision', 'https://aip.baidubce.com', 'dish', '', 'china', 3),
  ('lp_gpt4o_mini', 'GPT-4o-mini', 'gpt-4o-mini', 'https://api.openai.com', 'gpt-4o-mini', '', 'global', 1),
  ('lp_gpt4o', 'GPT-4o', 'gpt-4o', 'https://api.openai.com', 'gpt-4o', '', 'global', 2),
  ('lp_claude', 'Claude Sonnet', 'claude-sonnet', 'https://api.anthropic.com', 'claude-sonnet-4-20250514', '', 'global', 3);

-- ============================================================
-- REGIONAL PRICING
-- ============================================================

CREATE TABLE IF NOT EXISTS pricing_tiers (
  id            TEXT PRIMARY KEY,
  region        TEXT NOT NULL CHECK(region IN ('china', 'global')),
  tier          TEXT NOT NULL CHECK(tier IN ('premium')),
  amount        REAL NOT NULL,
  currency      TEXT NOT NULL,
  duration_days INTEGER DEFAULT 30,
  is_active     INTEGER DEFAULT 1,
  created_at    TEXT DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO pricing_tiers (id, region, tier, amount, currency, duration_days)
VALUES
  ('pr_china_premium', 'china', 'premium', 19.00, 'CNY', 30),
  ('pr_global_premium', 'global', 'premium', 9.99, 'USD', 30);

-- ============================================================
-- FEATURE LIMITS (per tier)
-- ============================================================

CREATE TABLE IF NOT EXISTS feature_limits (
  id            TEXT PRIMARY KEY,
  tier          TEXT NOT NULL CHECK(tier IN ('free', 'premium')),
  feature_key   TEXT NOT NULL,
  hard_limit    INTEGER NOT NULL DEFAULT 0,
  region        TEXT CHECK(region IN ('china', 'global')),
  created_at    TEXT DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO feature_limits (id, tier, feature_key, hard_limit, region) VALUES
  ('fl_free_food_china', 'free', 'food_scans_per_day', 5, 'china'),
  ('fl_free_food_global', 'free', 'food_scans_per_day', 10, 'global'),
  ('fl_free_ai_china', 'free', 'ai_chat_per_day', 10, 'china'),
  ('fl_free_ai_global', 'free', 'ai_chat_per_day', 20, 'global'),
  ('fl_prem_food', 'premium', 'food_scans_per_day', 0, NULL),
  ('fl_prem_ai', 'premium', 'ai_chat_per_day', 0, NULL);

-- ============================================================
-- USAGE TRACKING (daily counters)
-- ============================================================

CREATE TABLE IF NOT EXISTS usage_counts (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  feature_key   TEXT NOT NULL,
  count         INTEGER DEFAULT 0,
  record_date   TEXT NOT NULL,
  created_at    TEXT DEFAULT (datetime('now')),
  UNIQUE(user_id, feature_key, record_date)
);

CREATE INDEX IF NOT EXISTS idx_usage_counts_user_date ON usage_counts(user_id, record_date);

-- ============================================================
-- PAYMENT ORDERS
-- ============================================================

CREATE TABLE IF NOT EXISTS orders (
  id              TEXT PRIMARY KEY,
  user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_no        TEXT NOT NULL UNIQUE,
  amount          REAL NOT NULL,
  currency        TEXT NOT NULL DEFAULT 'CNY',
  provider        TEXT NOT NULL CHECK(provider IN ('alipay', 'wechat', 'stripe', 'paypal', 'apple_iap')),
  provider_order_id TEXT DEFAULT '',
  status          TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'paid', 'failed', 'expired')),
  membership_id   TEXT REFERENCES memberships(id),
  created_at      TEXT DEFAULT (datetime('now')),
  paid_at         TEXT
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id, status);

-- ============================================================
-- INDEXES (new)
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_llm_providers_region ON llm_providers(region, is_active);
CREATE INDEX IF NOT EXISTS idx_app_releases_version ON app_releases(version_code);
