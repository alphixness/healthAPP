export interface AuthUser {
  id: string;
  email: string | null;
  phone: string | null;
  nickname: string;
  role: 'user' | 'admin' | 'fitness_blogger' | 'food_blogger';
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthState {
  user: AuthUser | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
}

export interface RegisterInput {
  email: string;
  password: string;
  nickname?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface SmsSendInput {
  phone: string;
}

export interface SmsLoginInput {
  phone: string;
  code: string;
}

export interface WechatLoginInput {
  code: string;
}
