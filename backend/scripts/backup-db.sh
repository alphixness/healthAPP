#!/usr/bin/env bash
# HealthApp Database Backup Script
# Usage: ./scripts/backup-db.sh [backup-dir]
# Default backup dir: ./backups/
# Keeps last 7 daily backups

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
DB_PATH="${PROJECT_DIR}/data/healthapp.db"
BACKUP_DIR="${1:-${PROJECT_DIR}/backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=7

mkdir -p "${BACKUP_DIR}"

if [ ! -f "${DB_PATH}" ]; then
  echo "[ERROR] Database not found at ${DB_PATH}"
  exit 1
fi

# Use sqlite3 backup if available, otherwise file copy
if command -v sqlite3 &>/dev/null; then
  BACKUP_FILE="${BACKUP_DIR}/healthapp_${TIMESTAMP}.db"
  sqlite3 "${DB_PATH}" ".backup '${BACKUP_FILE}'"
  echo "[OK] SQLite backup created: ${BACKUP_FILE}"
else
  # Simple file copy (less safe for live DB)
  BACKUP_FILE="${BACKUP_DIR}/healthapp_${TIMESTAMP}.db"
  cp "${DB_PATH}" "${BACKUP_FILE}"
  echo "[WARN] Using file copy (sqlite3 not found): ${BACKUP_FILE}"
fi

# Vacuum to reclaim space
sqlite3 "${DB_PATH}" "VACUUM;" 2>/dev/null && echo "[OK] Database vacuumed" || true

# Clean old backups
find "${BACKUP_DIR}" -name "healthapp_*.db" -mtime +${RETENTION_DAYS} -delete
echo "[OK] Removed backups older than ${RETENTION_DAYS} days"

# Print backup info
BACKUP_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
echo "[OK] Backup size: ${BACKUP_SIZE}"
echo "[OK] Backup complete"
