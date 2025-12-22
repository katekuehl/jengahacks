#!/bin/bash
# Database backup script for JengaHacks Hub
# Backs up Supabase database to local storage

set -e

# Configuration
BACKUP_DIR="./backups/database"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30
LOG_FILE="./backups/backup.log"

# Create backup directory
mkdir -p "$BACKUP_DIR"
mkdir -p "$(dirname "$LOG_FILE")"

# Logging function
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Check if Supabase CLI is available
if ! command -v supabase &> /dev/null; then
    log "ERROR: Supabase CLI not found. Install with: npm install -g supabase"
    exit 1
fi

# Check if logged in
if ! supabase projects list &> /dev/null; then
    log "ERROR: Not logged in to Supabase. Run: supabase login"
    exit 1
fi

log "Starting database backup"

# Get project reference from environment or config
# Allow override via command line argument
if [ -n "$1" ]; then
    PROJECT_REF="$1"
    log "Using project reference from argument: $PROJECT_REF"
else
    PROJECT_REF="${SUPABASE_PROJECT_REF:-$(grep 'project_id' supabase/config.toml 2>/dev/null | cut -d'"' -f2 || echo '')}"
fi

if [ -z "$PROJECT_REF" ]; then
    log "ERROR: SUPABASE_PROJECT_REF not set. Set it in .env, supabase/config.toml, or pass as argument"
    log "Usage: $0 [project-ref]"
    exit 1
fi

# Full database dump
BACKUP_FILE="$BACKUP_DIR/db_backup_$DATE.sql"
log "Creating backup: $BACKUP_FILE"

if supabase db dump --project-ref "$PROJECT_REF" > "$BACKUP_FILE" 2>>"$LOG_FILE"; then
    log "Database dump completed"
else
    log "ERROR: Database dump failed"
    exit 1
fi

# Compress backup
log "Compressing backup..."
if gzip "$BACKUP_FILE"; then
    BACKUP_FILE="${BACKUP_FILE}.gz"
    log "Backup compressed: $BACKUP_FILE"
else
    log "ERROR: Compression failed"
    exit 1
fi

# Calculate backup size
BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
log "Backup size: $BACKUP_SIZE"

# Remove old backups (older than retention period)
log "Cleaning up backups older than $RETENTION_DAYS days..."
DELETED=$(find "$BACKUP_DIR" -name "db_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete -print | wc -l)
if [ "$DELETED" -gt 0 ]; then
    log "Removed $DELETED old backup(s)"
else
    log "No old backups to remove"
fi

# Verify backup integrity
log "Verifying backup integrity..."
if gzip -t "$BACKUP_FILE" 2>>"$LOG_FILE"; then
    log "Backup integrity check passed"
else
    log "ERROR: Backup integrity check failed"
    exit 1
fi

# Count tables in backup
TABLE_COUNT=$(gzip -dc "$BACKUP_FILE" | grep -c "CREATE TABLE" || echo "0")
log "Backup contains $TABLE_COUNT tables"

log "Backup completed successfully at $(date)"
log "---"

exit 0

