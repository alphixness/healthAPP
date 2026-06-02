import { app } from './app';
import { ENV } from './config/env';
import { runMigrations } from './db/migrate';
import { seedDatabase } from './db/seed';
import { logger } from './utils/logger';

async function main(): Promise<void> {
  logger.info('Starting HealthApp backend...');

  runMigrations();
  await seedDatabase();

  app.listen(ENV.PORT, () => {
    logger.info(`Server running on http://localhost:${ENV.PORT}`);
    logger.info(`Health check: http://localhost:${ENV.PORT}/api/health`);
    logger.info(`Admin dashboard: http://localhost:${ENV.PORT}/admin`);
  });
}

main().catch((err) => {
  logger.error(err, 'Failed to start server');
  process.exit(1);
});
