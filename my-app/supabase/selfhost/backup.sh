#!/bin/sh
# Nightly backup of the self-hosted Supabase stack (database + stored files).
#
# Installed on the server as ~/supabase/backup.sh and run from ubuntu's crontab:
#   15 3 * * * /home/ubuntu/supabase/backup.sh >> /home/ubuntu/backups/backup.log 2>&1
#
# Writes to ~/backups and keeps KEEP_DAYS of history. These copies sit on the
# same disk as the data, so they protect against bad writes and mistakes, not
# against losing the instance — copy them off-server (S3 / EBS snapshots) too.
#
# Restore the database into a fresh stack:
#   gunzip -c db-<stamp>.sql.gz | docker exec -i supabase-db psql -U supabase_admin -d postgres
# Restore files:
#   tar xzf storage-<stamp>.tar.gz -C ~/supabase/docker/volumes
set -eu

BACKUP_DIR="$HOME/backups"
STACK_DIR="$HOME/supabase/docker"
KEEP_DAYS=14
STAMP=$(date +%Y%m%d-%H%M%S)

mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"
umask 077

# supabase_admin owns the auth/storage schemas, so the dump covers app tables,
# auth users (with password hashes) and storage metadata in one file.
docker exec supabase-db pg_dump -U supabase_admin -d postgres --clean --if-exists \
  | gzip > "$BACKUP_DIR/db-$STAMP.sql.gz.part"
mv "$BACKUP_DIR/db-$STAMP.sql.gz.part" "$BACKUP_DIR/db-$STAMP.sql.gz"

tar czf "$BACKUP_DIR/storage-$STAMP.tar.gz" -C "$STACK_DIR/volumes" storage

find "$BACKUP_DIR" -name 'db-*.sql.gz' -mtime +"$KEEP_DAYS" -delete
find "$BACKUP_DIR" -name 'storage-*.tar.gz' -mtime +"$KEEP_DAYS" -delete

echo "$(date -Is) backup ok: db-$STAMP.sql.gz storage-$STAMP.tar.gz"
