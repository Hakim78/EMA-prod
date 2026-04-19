#!/usr/bin/env bash
# DEMOEMA datalake — backup quotidien Postgres
# Rétention 30j local. Off-site IONOS Object Storage à activer quand bucket prêt.
set -euo pipefail
BACKUP_DIR=/root/backups/datalake
DATE=$(date -u +%F)
mkdir -p "$BACKUP_DIR"
docker exec demomea-datalake-db pg_dump -U postgres -Fc -Z 9 datalake > "$BACKUP_DIR/datalake-$DATE.dump"
# Rétention 30 jours
find "$BACKUP_DIR" -name 'datalake-*.dump' -mtime +30 -delete
SIZE=$(du -h "$BACKUP_DIR/datalake-$DATE.dump" | cut -f1)
echo "[$(date -u +%FT%TZ)] backup OK $DATE size=$SIZE"
