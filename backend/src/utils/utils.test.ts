import { describe, it, expect, vi, beforeAll } from 'vitest';

// Mock env config before importing tested modules
vi.mock('../config/env', () => ({
  ENV: {
    JWT_SECRET: 'test-jwt-secret',
    JWT_REFRESH_SECRET: 'test-refresh-secret',
    PAYMENT_WEBHOOK_SECRET: 'test-payment-secret',
  },
}));

// Mock logger to avoid file I/O in tests
vi.mock('../utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

// Mock database to avoid real SQLite
const mockDb = {
  prepare: vi.fn().mockReturnThis(),
  run: vi.fn(),
  get: vi.fn(),
  all: vi.fn(),
};

vi.mock('../config/database', () => ({
  getDb: () => mockDb,
}));

describe('hash utils', () => {
  it('should hash and compare passwords correctly', async () => {
    const { hashPassword, comparePassword } = await import('../utils/hash');
    const hash = await hashPassword('test123');
    expect(hash).not.toBe('test123');
    expect(hash.startsWith('$2')).toBe(true);

    const valid = await comparePassword('test123', hash);
    expect(valid).toBe(true);

    const invalid = await comparePassword('wrong', hash);
    expect(invalid).toBe(false);
  });
});

describe('jwt utils', () => {
  it('should sign and verify access tokens', async () => {
    const { signAccessToken, verifyAccessToken } = await import('../utils/jwt');

    const payload = { userId: 'user-1', role: 'user' };
    const token = signAccessToken(payload);
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);

    const decoded = verifyAccessToken(token);
    expect(decoded.userId).toBe('user-1');
    expect(decoded.role).toBe('user');
  });

  it('should sign and verify refresh tokens', async () => {
    const { signRefreshToken, verifyRefreshToken } = await import('../utils/jwt');

    const payload = { userId: 'user-1', role: 'user' };
    const token = signRefreshToken(payload);

    const decoded = verifyRefreshToken(token);
    expect(decoded.userId).toBe('user-1');
  });

  it('should reject expired or invalid tokens', async () => {
    const { verifyAccessToken } = await import('../utils/jwt');
    expect(() => verifyAccessToken('invalid-token')).toThrow();
  });
});

describe('uuid utils', () => {
  it('should generate unique IDs', async () => {
    const { generateId } = await import('../utils/uuid');
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
    expect(id1.length).toBeGreaterThan(10);
  });
});
