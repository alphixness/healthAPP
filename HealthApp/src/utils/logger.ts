const IS_PROD = __DEV__ === false;

type LogLevel = 'info' | 'warn' | 'error';

function log(level: LogLevel, message: string, ...args: unknown[]) {
  if (IS_PROD) return;

  const prefix = `[HealthApp]`;
  switch (level) {
    case 'info':
      console.log(prefix, message, ...args);
      break;
    case 'warn':
      console.warn(prefix, message, ...args);
      break;
    case 'error':
      console.error(prefix, message, ...args);
      break;
  }
}

export const logger = {
  info: (message: string, ...args: unknown[]) => log('info', message, ...args),
  warn: (message: string, ...args: unknown[]) => log('warn', message, ...args),
  error: (message: string, ...args: unknown[]) => log('error', message, ...args),
};
