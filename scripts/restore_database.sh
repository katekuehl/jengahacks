#!/bin/bash
# Database restore script for JengaHacks Hub
# Restores Supabase database from backup file

set -e

# Configuration
BACKUP_DIR="./backups/database"
LOG_FILE="./backups/restore.log"

# Logging function
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Check arguments
if [ $# -lt 1 ]; then
    echo "Usage: $0 <backup_file> [--dry-run]"
    echo "Example: $0 db_backup_20250101_020000.sql.gz"
    exit 1
fi

BACKUP_FILE="$1"
DRY_RUN=false

if [ "$2" == "--dry-run" ]; then
    DRY_RUN=true
    log "DRY RUN MODE - No changes will be made"
fi

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    # Try to find in backup directory
    if [ -f "$BACKUP_DIR/$BACKUP_FILE" ]; then
        BACKUP_FILE="$BACKUP_DIR/$BACKUP_FILE"
    else
        log "ERROR: Backup file not found: $BACKUP_FILE"
        exit 1
    fi
fi

log "Starting database restore from: $BACKUP_FILE"

# Verify backup file integrity
log "Verifying backup file integrity..."
if [[ "$BACKUP_FILE" == *.gz ]]; then
    if ! gzip -t "$BACKUP_FILE" 2>>"$LOG_FILE"; then
        log "ERROR: Backup file is corrupted"
        exit 1
    fi
    log "Backup file integrity check passed"
else
    log "Warning: Backup file is not compressed"
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

# Get project reference
PROJECT_REF="${SUPABASE_PROJECT_REF:-$(grep 'project_id' supabase/config.toml 2>/dev/null | cut -d'"' -f2 || echo '')}"

if [ -z "$PROJECT_REF" ]; then
    log "ERROR: SUPABASE_PROJECT_REF not set. Set it in .env or supabase/config.toml"
    exit 1
fi

# Confirm restore
if [ "$DRY_RUN" = false ]; then
    echo "WARNING: This will overwrite the current database!"
    echo "Project: $PROJECT_REF"
    echo "Backup: $BACKUP_FILE"
    read -p "Are you sure you want to continue? (yes/no): " confirm
    
    if [ "$confirm" != "yes" ]; then
        log "Restore cancelled by user"
        exit 0
    fi
fi

# Decompress if needed
if [[ "$BACKUP_FILE" == *.gz ]]; then
    log "Decompressing backup..."
    TEMP_FILE="${BACKUP_FILE%.gz}"
    if [ "$DRY_RUN" = false ]; then
        gunzip -c "$BACKUP_FILE" > "$TEMP_FILE"
    else
        log "[DRY RUN] Would decompress: $BACKUP_FILE -> $TEMP_FILE"
        TEMP_FILE="$BACKUP_FILE"  # Use original for dry run
    fi
else
    TEMP_FILE="$BACKUP_FILE"
fi

# Restore database
log "Restoring database..."
if [ "$DRY_RUN" = false ]; then
    # Note: Supabase CLI doesn't have direct restore command
    # You'll need to use psql with connection string
    log "ERROR: Direct restore via Supabase CLI not supported"
    log "Please use psql with connection string:"
    log "  gunzip -c $BACKUP_FILE | psql 'postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres'"
    log ""
    log "Or restore via Supabase Dashboard → Database → Backups"
    
    # Cleanup temp file
    if [ "$TEMP_FILE" != "$BACKUP_FILE" ]; then
        rm "$TEMP_FILE"
    fi
    
    exit 1
else
    log "[DRY RUN] Would restore database from: $TEMP_FILE"
fi

log "Restore completed successfully"
log "---"

exit 0

