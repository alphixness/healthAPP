import fs from 'fs';
import path from 'path';
import { getDb, closeDb } from '../config/database';
import { logger } from '../utils/logger';

export function runMigrations(): void {
  const db = getDb();
  const schemaPath = path.resolve(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');

  db.exec(schema);
  logger.info('Database migrations completed successfully');
}

if (require.main === module) {
  runMigrations();
  closeDb();
}
