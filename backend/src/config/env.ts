import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const isDev = process.env.NODE_ENV !== 'production';
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!isDev && (!JWT_SECRET || JWT_SECRET.startsWith('dev-'))) {
  throw new Error('生产环境必须设置生产级别的 JWT_SECRET，不能使用 dev- 前缀的密钥');
}
if (!isDev && (!JWT_REFRESH_SECRET || JWT_REFRESH_SECRET.startsWith('dev-'))) {
  throw new Error('生产环境必须设置生产级别的 JWT_REFRESH_SECRET');
}

export const ENV = {
  PORT: parseInt(process.env.PORT || '3001', 10),
  JWT_SECRET: JWT_SECRET || 'dev-jwt-secret',
  JWT_REFRESH_SECRET: JWT_REFRESH_SECRET || 'dev-refresh-secret',
  DATABASE_PATH: process.env.DATABASE_PATH || './data/healthapp.db',
  PAYMENT_WEBHOOK_SECRET: process.env.PAYMENT_WEBHOOK_SECRET || 'dev-payment-secret',
};
