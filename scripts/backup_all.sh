#!/bin/bash
# Comprehensive backup script for JengaHacks Hub
# Backs up database, storage, and configuration

set -e

# Configuration
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
LOG_FILE="$BACKUP_DIR/backup.log"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Logging function
log() {
    echo -e "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Create backup directory
mkdir -p "$BACKUP_DIR"/{database,storage,config}
mkdir -p "$(dirname "$LOG_FILE")"

log "${GREEN}Starting comprehensive backup${NC}"
log "Backup timestamp: $DATE"
log "---"

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Check prerequisites
check_command() {
    if ! command -v $1 &> /dev/null; then
        log "${RED}ERROR: $1 not found${NC}"
        return 1
    fi
    return 0
}

log "Checking prerequisites..."
check_command "supabase" || exit 1
check_command "gzip" || exit 1

# Check if logged in
if ! supabase projects list &> /dev/null; then
    log "${RED}ERROR: Not logged in to Supabase. Run: supabase login${NC}"
    exit 1
fi

# Get project reference
PROJECT_REF="${SUPABASE_PROJECT_REF:-$(grep 'project_id' supabase/config.toml 2>/dev/null | cut -d'"' -f2 || echo '')}"

if [ -z "$PROJECT_REF" ]; then
    log "${RED}ERROR: SUPABASE_PROJECT_REF not set${NC}"
    exit 1
fi

log "Using project: $PROJECT_REF"

# 1. Database Backup
log ""
log "${YELLOW}1. Backing up database...${NC}"
DB_BACKUP_FILE="$BACKUP_DIR/database/db_backup_$DATE.sql"

if supabase db dump --project-ref "$PROJECT_REF" > "$DB_BACKUP_FILE" 2>>"$LOG_FILE"; then
    log "${GREEN}✓${NC} Database dump completed"
    
    # Compress
    if gzip "$DB_BACKUP_FILE"; then
        DB_BACKUP_FILE="${DB_BACKUP_FILE}.gz"
        DB_SIZE=$(du -h "$DB_BACKUP_FILE" | cut -f1)
        log "${GREEN}✓${NC} Database backup compressed: $DB_SIZE"
        
        # Verify integrity
        if gzip -t "$DB_BACKUP_FILE" 2>>"$LOG_FILE"; then
            log "${GREEN}✓${NC} Database backup integrity verified"
        else
            log "${RED}✗${NC} Database backup integrity check failed"
            exit 1
        fi
    else
        log "${RED}✗${NC} Database backup compression failed"
        exit 1
    fi
else
    log "${RED}✗${NC} Database backup failed"
    exit 1
fi

# 2. Storage Backup (if Python and supabase-py available)
log ""
log "${YELLOW}2. Backing up storage...${NC}"

if command -v python3 &> /dev/null && python3 -c "import supabase" 2>/dev/null; then
    if python3 scripts/backup_storage.py 2>>"$LOG_FILE"; then
        log "${GREEN}✓${NC} Storage backup completed"
    else
        log "${YELLOW}⚠${NC} Storage backup failed (non-critical)"
    fi
else
    log "${YELLOW}⚠${NC} Storage backup skipped (Python/supabase-py not available)"
fi

# 3. Configuration Backup
log ""
log "${YELLOW}3. Backing up configuration...${NC}"

CONFIG_BACKUP_FILE="$BACKUP_DIR/config/config_backup_$DATE.tar.gz"

# Backup important config files
tar -czf "$CONFIG_BACKUP_FILE" \
    .env.example \
    .env.staging.example \
    supabase/config.toml \
    supabase/migrations/*.sql \
    .github/workflows/*.yml \
    2>>"$LOG_FILE" || true

if [ -f "$CONFIG_BACKUP_FILE" ]; then
    CONFIG_SIZE=$(du -h "$CONFIG_BACKUP_FILE" | cut -f1)
    log "${GREEN}✓${NC} Configuration backup created: $CONFIG_SIZE"
else
    log "${YELLOW}⚠${NC} Configuration backup skipped"
fi

# 4. Create backup manifest
log ""
log "${YELLOW}4. Creating backup manifest...${NC}"

MANIFEST_FILE="$BACKUP_DIR/backup_manifest_$DATE.json"
cat > "$MANIFEST_FILE" <<EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "backup_id": "$DATE",
  "project_ref": "$PROJECT_REF",
  "backups": {
    "database": {
      "file": "$(basename $DB_BACKUP_FILE)",
      "size": "$DB_SIZE",
      "path": "$DB_BACKUP_FILE"
    },
    "storage": {
      "available": $(command -v python3 &> /dev/null && python3 -c "import supabase" 2>/dev/null && echo "true" || echo "false")
    },
    "configuration": {
      "file": "$(basename $CONFIG_BACKUP_FILE)",
      "size": "$CONFIG_SIZE",
      "path": "$CONFIG_BACKUP_FILE"
    }
  },
  "environment": {
    "node_version": "$(node --version 2>/dev/null || echo 'N/A')",
    "supabase_cli_version": "$(supabase --version 2>/dev/null | head -1 || echo 'N/A')"
  }
}
EOF

log "${GREEN}✓${NC} Manifest created: $MANIFEST_FILE"

# 5. Cleanup old backups
log ""
log "${YELLOW}5. Cleaning up old backups...${NC}"

# Database backups: 30 days
DELETED_DB=$(find "$BACKUP_DIR/database" -name "db_backup_*.sql.gz" -mtime +30 -delete -print 2>/dev/null | wc -l | tr -d ' ')
if [ "$DELETED_DB" -gt 0 ]; then
    log "  Removed $DELETED_DB old database backup(s)"
else
    log "  No old database backups to remove"
fi

# Storage backups: 90 days
DELETED_STORAGE=$(find "$BACKUP_DIR/storage" -name "storage_backup_*.tar.gz" -mtime +90 -delete -print 2>/dev/null | wc -l | tr -d ' ')
if [ "$DELETED_STORAGE" -gt 0 ]; then
    log "  Removed $DELETED_STORAGE old storage backup(s)"
else
    log "  No old storage backups to remove"
fi

# Config backups: 90 days
DELETED_CONFIG=$(find "$BACKUP_DIR/config" -name "config_backup_*.tar.gz" -mtime +90 -delete -print 2>/dev/null | wc -l | tr -d ' ')
if [ "$DELETED_CONFIG" -gt 0 ]; then
    log "  Removed $DELETED_CONFIG old config backup(s)"
else
    log "  No old config backups to remove"
fi

# 6. Summary
log ""
log "${GREEN}=== Backup Summary ===${NC}"
log "Backup ID: $DATE"
log "Database: $DB_BACKUP_FILE ($DB_SIZE)"
if [ -f "$CONFIG_BACKUP_FILE" ]; then
    log "Configuration: $CONFIG_BACKUP_FILE ($CONFIG_SIZE)"
fi
log "Manifest: $MANIFEST_FILE"
log ""
log "${GREEN}✓ Backup completed successfully${NC}"
log "---"

exit 0

