import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/errorHandler';
import { authRoutes } from './routes/auth.routes';
import { profileRoutes } from './routes/profile.routes';
import { mealsRoutes } from './routes/meals.routes';
import { exerciseRoutes } from './routes/exercise.routes';
import { recipesRoutes } from './routes/recipes.routes';
import { syncRoutes } from './routes/sync.routes';
import { adminRoutes } from './routes/admin.routes';
import { bloggerRoutes } from './routes/blogger.routes';
import { membershipRoutes } from './routes/membership.routes';
import { coursesRoutes } from './routes/courses.routes';
import { recommendationsRoutes } from './routes/recommendations.routes';
import { updateRoutes } from './routes/update.routes';
import { llmRoutes } from './routes/llm.routes';
import { usageRoutes } from './routes/usage.routes';
import { paymentRoutes } from './routes/payment.routes';
import path from 'path';

const app = express();

// 安全头
app.use(helmet());

// 严格的 CORS 配置
const ALLOWED_ORIGINS = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',')
  : ['http://localhost:8081', 'http://localhost:3000', 'exp://192.168.*'];
app.use(cors({
  origin: (origin, callback) => {
    // 允许无 origin 的请求（Postman/App）
    if (!origin) return callback(null, true);
    const allowed = ALLOWED_ORIGINS.some(pattern => {
      if (pattern.includes('*')) {
        const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
        return regex.test(origin);
      }
      return pattern === origin;
    });
    if (allowed) return callback(null, true);
    callback(new Error('CORS 不允许的来源'));
  },
  credentials: true,
  maxAge: 86400,
}));
app.use(express.json({ limit: '10mb' }));

// 全局速率限制
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: '请求过于频繁，请稍后再试' },
});
app.use('/api/', globalLimiter);

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/meals', mealsRoutes);
app.use('/api/v1/exercise', exerciseRoutes);
app.use('/api/v1/recipes', recipesRoutes);
app.use('/api/v1/sync', syncRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/bloggers', bloggerRoutes);
app.use('/api/v1/membership', membershipRoutes);
app.use('/api/v1/courses', coursesRoutes);
app.use('/api/v1/recommendations', recommendationsRoutes);
app.use('/api/v1/updates', updateRoutes);
app.use('/api/v1/llm', llmRoutes);
app.use('/api/v1/usage', usageRoutes);
app.use('/api/v1/payments', paymentRoutes);

// Web admin dashboard
app.get('/admin', (_req, res) => {
  res.sendFile(path.resolve(__dirname, 'admin-dashboard', 'index.html'));
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

// Static files for APK downloads
app.use('/downloads', express.static(path.resolve(__dirname, '../public/downloads')));

app.use(errorHandler);

export { app };
