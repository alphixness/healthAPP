import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../config/env', () => ({
  ENV: {
    JWT_SECRET: 'test-jwt-secret',
    JWT_REFRESH_SECRET: 'test-refresh-secret',
  },
}));

vi.mock('../utils/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

const mockDb = {
  prepare: vi.fn().mockReturnThis(),
  run: vi.fn(),
  get: vi.fn(),
  all: vi.fn(),
};

vi.mock('../config/database', () => ({
  getDb: () => mockDb,
}));

describe('auth service - registerWithEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should register a new user successfully', async () => {
    mockDb.get
      .mockReturnValueOnce(undefined) // no existing user
      .mockReturnValueOnce({
        id: 'new-id',
        email: 'test@test.com',
        phone: null,
        nickname: 'test',
        role: 'user',
      }); // created user

    const { registerWithEmail } = await import('./auth.service');
    const result = await registerWithEmail('test@test.com', 'password123');

    expect(result.user.email).toBe('test@test.com');
    expect(result.accessToken).toBeTruthy();
    expect(result.refreshToken).toBeTruthy();
  });

  it('should throw on duplicate email', async () => {
    mockDb.get.mockReturnValueOnce({ id: 'existing' }); // user exists

    const { registerWithEmail } = await import('./auth.service');
    await expect(registerWithEmail('dup@test.com', 'password123')).rejects.toThrow('该邮箱已被注册');
  });
});

describe('auth service - loginWithEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should reject unknown email', async () => {
    mockDb.get.mockReturnValueOnce(undefined);

    const { loginWithEmail } = await import('./auth.service');
    await expect(loginWithEmail('noone@test.com', 'pwd')).rejects.toThrow('邮箱或密码错误');
  });

  it('should reject wrong password', async () => {
    mockDb.get.mockReturnValueOnce({
      id: 'u1',
      email: 'test@test.com',
      password_hash: '$2b$10$invalid',
    });

    const { loginWithEmail } = await import('./auth.service');
    await expect(loginWithEmail('test@test.com', 'wrong')).rejects.toThrow('邮箱或密码错误');
  });
});
