#!/bin/bash
# Backup health check script
# Checks if backups are recent and valid, sends alerts if needed

set -e

# Configuration
BACKUP_DIR="./backups/database"
MAX_AGE_HOURS=25  # Alert if backup is older than 25 hours
MIN_SIZE_KB=10    # Alert if backup is smaller than 10KB (likely corrupted)
LOG_FILE="./backups/backup-health.log"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Logging
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Create log directory
mkdir -p "$(dirname "$LOG_FILE")"

log "Starting backup health check..."

# Find most recent backup
LATEST_BACKUP=$(find "$BACKUP_DIR" -name "db_backup_*.sql.gz" -type f -printf '%T@ %p\n' 2>/dev/null | sort -n | tail -1 | cut -d' ' -f2-)

if [ -z "$LATEST_BACKUP" ]; then
    log "${RED}❌ ERROR: No backups found in $BACKUP_DIR${NC}"
    exit 1
fi

log "Latest backup: $LATEST_BACKUP"

# Check backup age
BACKUP_AGE_HOURS=$(( ($(date +%s) - $(stat -f %m "$LATEST_BACKUP" 2>/dev/null || stat -c %Y "$LATEST_BACKUP" 2>/dev/null)) / 3600 ))

if [ "$BACKUP_AGE_HOURS" -gt "$MAX_AGE_HOURS" ]; then
    log "${RED}❌ ERROR: Backup is $BACKUP_AGE_HOURS hours old (max: $MAX_AGE_HOURS hours)${NC}"
    exit 1
else
    log "${GREEN}✓${NC} Backup age: $BACKUP_AGE_HOURS hours (OK)"
fi

# Check backup size
BACKUP_SIZE_KB=$(du -k "$LATEST_BACKUP" | cut -f1)

if [ "$BACKUP_SIZE_KB" -lt "$MIN_SIZE_KB" ]; then
    log "${RED}❌ ERROR: Backup size is only ${BACKUP_SIZE_KB}KB (suspiciously small)${NC}"
    exit 1
else
    BACKUP_SIZE_MB=$((BACKUP_SIZE_KB / 1024))
    log "${GREEN}✓${NC} Backup size: ${BACKUP_SIZE_MB}MB (OK)"
fi

# Verify backup integrity
log "Verifying backup integrity..."
if gzip -t "$LATEST_BACKUP" 2>/dev/null; then
    log "${GREEN}✓${NC} Backup integrity check passed"
else
    log "${RED}❌ ERROR: Backup integrity check failed - file may be corrupted${NC}"
    exit 1
fi

# Count tables in backup
TABLE_COUNT=$(gzip -dc "$LATEST_BACKUP" 2>/dev/null | grep -c "CREATE TABLE" || echo "0")

if [ "$TABLE_COUNT" -eq "0" ]; then
    log "${YELLOW}⚠ WARNING: No tables found in backup${NC}"
else
    log "${GREEN}✓${NC} Backup contains $TABLE_COUNT tables"
fi

# Check for critical tables
CRITICAL_TABLES=("registrations" "incomplete_registrations")
MISSING_TABLES=()

for table in "${CRITICAL_TABLES[@]}"; do
    if ! gzip -dc "$LATEST_BACKUP" 2>/dev/null | grep -q "CREATE TABLE.*$table"; then
        MISSING_TABLES+=("$table")
    fi
done

if [ ${#MISSING_TABLES[@]} -gt 0 ]; then
    log "${RED}❌ ERROR: Missing critical tables: ${MISSING_TABLES[*]}${NC}"
    exit 1
else
    log "${GREEN}✓${NC} All critical tables present"
fi

log ""
log "${GREEN}=== Backup Health Check Summary ===${NC}"
log "Status: ${GREEN}HEALTHY${NC}"
log "Latest backup: $(basename "$LATEST_BACKUP")"
log "Age: $BACKUP_AGE_HOURS hours"
log "Size: ${BACKUP_SIZE_MB}MB"
log "Tables: $TABLE_COUNT"
log "Integrity: ${GREEN}PASSED${NC}"
log ""
log "${GREEN}✓ All checks passed${NC}"

exit 0

