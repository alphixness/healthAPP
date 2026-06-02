import { getDb } from '../config/database';
import { generateId } from '../utils/uuid';
import { logger } from '../utils/logger';

const VERIFICATION_EXPIRY_MINUTES = 60;

/** 创建邮箱验证令牌 */
export function createEmailVerification(email: string): { token: string; expiresAt: string } {
  const db = getDb();
  const token = generateId() + '-' + generateId();
  const expiresAt = new Date(Date.now() + VERIFICATION_EXPIRY_MINUTES * 60 * 1000).toISOString();

  db.prepare(`
    INSERT INTO email_verifications (id, email, token, expires_at)
    VALUES (?, ?, ?, ?)
  `).run(generateId(), email, token, expiresAt);

  return { token, expiresAt };
}

/** 验证邮箱令牌 */
export function verifyEmailToken(token: string): { email: string } | null {
  const db = getDb();

  const record = db.prepare(`
    SELECT * FROM email_verifications
    WHERE token = ? AND used = 0 AND expires_at > datetime('now')
    LIMIT 1
  `).get(token) as { id: string; email: string } | undefined;

  if (!record) return null;

  db.prepare('UPDATE email_verifications SET used = 1 WHERE id = ?').run(record.id);
  db.prepare('UPDATE users SET updated_at = datetime(\'now\') WHERE email = ?').run(record.email);

  return { email: record.email };
}

/** 发送验证邮件（开发环境仅打日志，生产环境通过 SMTP 发送） */
export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  const baseUrl = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 3001}`;
  const link = `${baseUrl}/api/v1/auth/verify-email?token=${token}`;

  if (process.env.SMTP_HOST) {
    // 生产环境：通过 SMTP 发送真实邮件
    try {
      const nodemailer = await import('nodemailer');
      const transporter = nodemailer.default.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      await transporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@healthapp.com',
        to: email,
        subject: '验证您的邮箱 - HealthApp',
        html: `<p>请点击以下链接验证您的邮箱：</p><p><a href="${link}">${link}</a></p><p>链接有效期为 ${VERIFICATION_EXPIRY_MINUTES} 分钟。</p>`,
      });
    } catch (err) {
      logger.error(err, 'Failed to send verification email via SMTP, falling back to log');
      logger.info(`[EMAIL VERIFICATION] Token for ${email}: ${token}`);
    }
  } else {
    // 开发环境：仅打印日志
    logger.info(`[EMAIL VERIFICATION] Token for ${email}: ${token}`);
    logger.info(`[EMAIL VERIFICATION] Link: ${link}`);
  }
}
