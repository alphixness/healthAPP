import { getLocales } from 'expo-localization';

export const ENV = {
  OPENAI_API_KEY: process.env.EXPO_PUBLIC_OPENAI_API_KEY || '',
  QWEN_API_KEY: process.env.EXPO_PUBLIC_QWEN_API_KEY || '',
  DEEPSEEK_API_KEY: process.env.EXPO_PUBLIC_DEEPSEEK_API_KEY || '',
  BAIDU_API_KEY: process.env.EXPO_PUBLIC_BAIDU_API_KEY || '',
  BAIDU_SECRET_KEY: process.env.EXPO_PUBLIC_BAIDU_SECRET_KEY || '',
  API_WORKER_URL: process.env.EXPO_PUBLIC_API_WORKER_URL || '',
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
  SENTRY_DSN: process.env.EXPO_PUBLIC_SENTRY_DSN || '',
  API_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001',

  get HAS_QWEN(): boolean {
    return !!this.QWEN_API_KEY;
  },
  get HAS_DEEPSEEK(): boolean {
    return !!this.DEEPSEEK_API_KEY;
  },
  get HAS_API_WORKER(): boolean {
    return !!this.API_WORKER_URL;
  },
  get HAS_OPENAI(): boolean {
    return !!this.OPENAI_API_KEY;
  },
  get HAS_BAIDU(): boolean {
    return !!this.BAIDU_API_KEY && !!this.BAIDU_SECRET_KEY;
  },
  get HAS_SUPABASE(): boolean {
    return !!this.SUPABASE_URL && !!this.SUPABASE_ANON_KEY;
  },
  get HAS_SENTRY(): boolean {
    return !!this.SENTRY_DSN;
  },
  get IS_MOCK_MODE(): boolean {
    return !this.HAS_QWEN && !this.HAS_DEEPSEEK && !this.HAS_API_WORKER && !this.HAS_OPENAI && !this.HAS_BAIDU;
  },
};

/** 检测用户区域：系统语言为 zh 开头则返回 china，否则 global */
export function detectRegion(): 'china' | 'global' {
  try {
    const locales = getLocales();
    const primary = locales[0];
    if (primary?.languageCode === 'zh' || primary?.regionCode === 'CN') {
      return 'china';
    }
    return 'global';
  } catch {
    return 'china';
  }
}
