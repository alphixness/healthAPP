/**
 * Sentry 错误监控初始化
 * 需要先注册 Sentry: https://sentry.io
 * 然后在 .env 中设置 EXPO_PUBLIC_SENTRY_DSN
 *
 * 安装: npx expo install @sentry/react-native
 */

import { ENV } from '../config/env';

let Sentry: typeof import('@sentry/react-native') | null = null;

try {
  Sentry = require('@sentry/react-native');
} catch {}

export function initSentry() {
  if (!Sentry || !ENV.HAS_SENTRY) return;

  Sentry.init({
    dsn: ENV.SENTRY_DSN,
    enabled: !__DEV__,
    tracesSampleRate: 0.2,
  });
}

export function captureError(error: Error, context?: Record<string, unknown>) {
  if (!Sentry || !ENV.HAS_SENTRY) return;

  Sentry.withScope((scope) => {
    if (context) {
      scope.setExtras(context);
    }
    Sentry!.captureException(error);
  });
}
