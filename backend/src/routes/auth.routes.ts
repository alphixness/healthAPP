import { Router, Request, Response } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { validate } from '../middleware/validate';
import { authMiddleware } from '../middleware/auth';
import { success, error } from '../utils/response';
import * as authService from '../services/auth.service';
import * as emailService from '../services/email.service';

const router = Router();

// 登录/注册/短信接口单独限流
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: '操作过于频繁，请稍后再试' },
});

const smsLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: '短信发送过于频繁，请稍后再试' },
});

const registerSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少6位'),
  nickname: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(1, '请输入密码'),
});

const smsSendSchema = z.object({
  phone: z.string().regex(/^1\d{10}$/, '请输入有效的手机号'),
});

const smsLoginSchema = z.object({
  phone: z.string().regex(/^1\d{10}$/, '请输入有效的手机号'),
  code: z.string().length(6, '验证码为6位数字'),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, '刷新令牌不能为空'),
});

const sendVerificationSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
});

// POST /api/v1/auth/register
router.post('/register', authLimiter, validate(registerSchema), async (req: Request, res: Response) => {
  try {
    const result = await authService.registerWithEmail(req.body.email, req.body.password, req.body.nickname);
    // 注册成功后发送邮箱验证邮件（不阻塞响应）
    const { token } = emailService.createEmailVerification(req.body.email);
    emailService.sendVerificationEmail(req.body.email, token).catch(() => {});
    success(res, result, 201);
  } catch (err: any) {
    error(res, err.message, 409);
  }
});

// POST /api/v1/auth/login
router.post('/login', authLimiter, validate(loginSchema), async (req: Request, res: Response) => {
  try {
    const result = await authService.loginWithEmail(req.body.email, req.body.password);
    success(res, result);
  } catch (err: any) {
    error(res, err.message, 401);
  }
});

// POST /api/v1/auth/sms/send
router.post('/sms/send', smsLimiter, validate(smsSendSchema), async (req: Request, res: Response) => {
  try {
    const result = await authService.sendSmsCode(req.body.phone);
    success(res, result);
  } catch (err: any) {
    error(res, err.message);
  }
});

// POST /api/v1/auth/sms/login
router.post('/sms/login', validate(smsLoginSchema), async (req: Request, res: Response) => {
  try {
    const result = await authService.loginWithPhone(req.body.phone, req.body.code);
    success(res, result);
  } catch (err: any) {
    error(res, err.message, 401);
  }
});

// POST /api/v1/auth/refresh
router.post('/refresh', validate(refreshSchema), async (req: Request, res: Response) => {
  try {
    const result = await authService.refreshTokens(req.body.refreshToken);
    success(res, result);
  } catch (err: any) {
    error(res, err.message, 401);
  }
});

// POST /api/v1/auth/logout
router.post('/logout', authMiddleware, (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      authService.logoutUser(refreshToken);
    }
    success(res, { message: '已登出' });
  } catch (err: any) {
    error(res, err.message);
  }
});

// GET /api/v1/auth/me
router.get('/me', authMiddleware, (req: Request, res: Response) => {
  try {
    const user = authService.getUserById(req.user!.userId);
    if (!user) {
      error(res, '用户不存在', 404);
      return;
    }
    success(res, { user });
  } catch (err: any) {
    error(res, err.message);
  }
});

// POST /api/v1/auth/send-verification — 发送邮箱验证邮件
router.post('/send-verification', authLimiter, validate(sendVerificationSchema), async (req: Request, res: Response) => {
  try {
    const { token } = emailService.createEmailVerification(req.body.email);
    await emailService.sendVerificationEmail(req.body.email, token);
    success(res, { message: '验证邮件已发送' });
  } catch (err: any) {
    error(res, err.message);
  }
});

// GET /api/v1/auth/verify-email — 验证邮箱令牌
router.get('/verify-email', (req: Request, res: Response) => {
  try {
    const token = req.query.token as string;
    if (!token) {
      error(res, '缺少验证令牌', 400);
      return;
    }
    const result = emailService.verifyEmailToken(token);
    if (!result) {
      error(res, '验证链接无效或已过期', 400);
      return;
    }
    success(res, { message: '邮箱验证成功', email: result.email });
  } catch (err: any) {
    error(res, err.message);
  }
});

export { router as authRoutes };
