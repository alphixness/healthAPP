import { getDb } from '../config/database';
import { generateId } from '../utils/uuid';
import { hashPassword, comparePassword } from '../utils/hash';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { logger } from '../utils/logger';

export interface AuthResult {
  user: {
    id: string;
    email: string | null;
    phone: string | null;
    nickname: string;
    role: string;
  };
  accessToken: string;
  refreshToken: string;
}

export interface UserRow {
  id: string;
  email: string | null;
  phone: string | null;
  password_hash: string | null;
  wechat_openid: string | null;
  nickname: string;
  role: string;
  created_at: string;
}

export async function registerWithEmail(email: string, password: string, nickname?: string): Promise<AuthResult> {
  const db = getDb();

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    throw new Error('该邮箱已被注册');
  }

  const id = generateId();
  const passwordHash = await hashPassword(password);

  db.prepare(`
    INSERT INTO users (id, email, password_hash, nickname)
    VALUES (?, ?, ?, ?)
  `).run(id, email, passwordHash, nickname || email.split('@')[0]);

  const user = db.prepare('SELECT id, email, phone, nickname, role FROM users WHERE id = ?').get(id) as UserRow;

  const accessToken = signAccessToken({ userId: user.id, role: user.role });
  const refreshToken = signRefreshToken({ userId: user.id, role: user.role });

  storeRefreshToken(user.id, refreshToken);

  return {
    user: { id: user.id, email: user.email, phone: user.phone, nickname: user.nickname, role: user.role },
    accessToken,
    refreshToken,
  };
}

export async function loginWithEmail(email: string, password: string): Promise<AuthResult> {
  const db = getDb();

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as UserRow | undefined;
  if (!user || !user.password_hash) {
    throw new Error('邮箱或密码错误');
  }

  const valid = await comparePassword(password, user.password_hash);
  if (!valid) {
    throw new Error('邮箱或密码错误');
  }

  const accessToken = signAccessToken({ userId: user.id, role: user.role });
  const refreshToken = signRefreshToken({ userId: user.id, role: user.role });

  storeRefreshToken(user.id, refreshToken);

  return {
    user: { id: user.id, email: user.email, phone: user.phone, nickname: user.nickname, role: user.role },
    accessToken,
    refreshToken,
  };
}

export async function sendSmsCode(phone: string): Promise<{ expiresIn: number }> {
  const db = getDb();
  const code = String(100000 + Math.floor(Math.random() * 900000));
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  db.prepare(`INSERT INTO sms_codes (id, phone, code, expires_at) VALUES (?, ?, ?, ?)`)
    .run(generateId(), phone, code, expiresAt);

  // In production, send via SMS provider.
  logger.debug(`[SMS MOCK] Verification code for ${phone}: ${code}`);

  return { expiresIn: 300 };
}

export async function loginWithPhone(phone: string, code: string): Promise<AuthResult> {
  const db = getDb();

  const smsRecord = db.prepare(`
    SELECT * FROM sms_codes
    WHERE phone = ? AND code = ? AND used = 0 AND expires_at > datetime('now')
    ORDER BY created_at DESC LIMIT 1
  `).get(phone, code) as { id: string } | undefined;

  if (!smsRecord) {
    throw new Error('验证码无效或已过期');
  }

  db.prepare('UPDATE sms_codes SET used = 1 WHERE id = ?').run(smsRecord.id);

  let user = db.prepare('SELECT * FROM users WHERE phone = ?').get(phone) as UserRow | undefined;

  if (!user) {
    const id = generateId();
    db.prepare('INSERT INTO users (id, phone, nickname) VALUES (?, ?, ?)')
      .run(id, phone, `用户${phone.slice(-4)}`);
    user = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as UserRow;
  }

  const accessToken = signAccessToken({ userId: user.id, role: user.role });
  const refreshToken = signRefreshToken({ userId: user.id, role: user.role });
  storeRefreshToken(user.id, refreshToken);

  return {
    user: { id: user.id, email: user.email, phone: user.phone, nickname: user.nickname, role: user.role },
    accessToken,
    refreshToken,
  };
}

export async function loginWithWechat(_wechatCode: string): Promise<AuthResult> {
  throw new Error('微信登录暂未开放，请使用邮箱或手机号登录');
}

export async function refreshTokens(refreshToken: string): Promise<AuthResult> {
  const db = getDb();

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new Error('刷新令牌无效或已过期');
  }

  const storedToken = db.prepare('SELECT * FROM refresh_tokens WHERE token = ? AND expires_at > datetime(\'now\')')
    .get(refreshToken);

  if (!storedToken) {
    throw new Error('刷新令牌无效或已过期');
  }

  db.prepare('DELETE FROM refresh_tokens WHERE token = ?').run(refreshToken);

  const user = db.prepare('SELECT id, email, phone, nickname, role FROM users WHERE id = ?')
    .get(payload.userId) as UserRow | undefined;

  if (!user) {
    throw new Error('用户不存在');
  }

  const newAccessToken = signAccessToken({ userId: user.id, role: user.role });
  const newRefreshToken = signRefreshToken({ userId: user.id, role: user.role });
  storeRefreshToken(user.id, newRefreshToken);

  return {
    user: { id: user.id, email: user.email, phone: user.phone, nickname: user.nickname, role: user.role },
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
}

export function logoutUser(refreshToken: string): void {
  const db = getDb();
  db.prepare('DELETE FROM refresh_tokens WHERE token = ?').run(refreshToken);
}

export function getUserById(userId: string): UserRow | undefined {
  const db = getDb();
  return db.prepare('SELECT id, email, phone, nickname, role, created_at FROM users WHERE id = ?')
    .get(userId) as UserRow | undefined;
}

function storeRefreshToken(userId: string, token: string): void {
  const db = getDb();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  db.prepare('INSERT INTO refresh_tokens (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)')
    .run(generateId(), userId, token, expiresAt);
}
