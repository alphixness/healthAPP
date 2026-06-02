import { getDb } from '../config/database';
import { generateId } from '../utils/uuid';

export interface AppRelease {
  id: string;
  version_code: number;
  version_name: string;
  apk_url: string;
  file_size: number;
  release_notes: string;
  force_update: number;
  created_at: string;
}

/** 获取最新版本（用于客户端检查更新） */
export function getLatestRelease(): AppRelease | null {
  const db = getDb();
  const release = db.prepare(`
    SELECT * FROM app_releases ORDER BY version_code DESC LIMIT 1
  `).get() as AppRelease | undefined;
  return release || null;
}

/** 管理员创建新版本 */
export function createRelease(data: {
  versionCode: number;
  versionName: string;
  apkUrl: string;
  fileSize?: number;
  releaseNotes?: string;
  forceUpdate?: boolean;
}): AppRelease {
  const db = getDb();
  const id = generateId();

  db.prepare(`
    INSERT INTO app_releases (id, version_code, version_name, apk_url, file_size, release_notes, force_update)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, data.versionCode, data.versionName, data.apkUrl,
    data.fileSize || 0, data.releaseNotes || '', data.forceUpdate ? 1 : 0);

  return db.prepare('SELECT * FROM app_releases WHERE id = ?').get(id) as AppRelease;
}

/** 管理员获取所有版本 */
export function getAllReleases(page = 1, limit = 20): { releases: AppRelease[]; total: number } {
  const db = getDb();
  const total = (db.prepare('SELECT COUNT(*) as count FROM app_releases').get() as any).count;
  const offset = (page - 1) * limit;
  const releases = db.prepare(
    'SELECT * FROM app_releases ORDER BY version_code DESC LIMIT ? OFFSET ?',
  ).all(limit, offset) as AppRelease[];
  return { releases, total };
}

/** 管理员删除版本 */
export function deleteRelease(id: string): boolean {
  const db = getDb();
  const result = db.prepare('DELETE FROM app_releases WHERE id = ?').run(id);
  return result.changes > 0;
}
