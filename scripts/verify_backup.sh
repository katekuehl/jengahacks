#!/bin/bash
# Backup verification script for JengaHacks Hub
# Verifies backup file integrity and contents

set -e

# Check arguments
if [ $# -lt 1 ]; then
    echo "Usage: $0 <backup_file>"
    echo "Example: $0 db_backup_20250101_020000.sql.gz"
    exit 1
fi

BACKUP_FILE="$1"
BACKUP_DIR="./backups/database"

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    # Try to find in backup directory
    if [ -f "$BACKUP_DIR/$BACKUP_FILE" ]; then
        BACKUP_FILE="$BACKUP_DIR/$BACKUP_FILE"
    else
        echo "ERROR: Backup file not found: $BACKUP_FILE"
        exit 1
    fi
fi

echo "Verifying backup: $BACKUP_FILE"
echo "---"

# Check file exists and get size
if [ -f "$BACKUP_FILE" ]; then
    FILE_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "✓ File exists"
    echo "  Size: $FILE_SIZE"
else
    echo "✗ File not found"
    exit 1
fi

# Verify integrity (if compressed)
if [[ "$BACKUP_FILE" == *.gz ]]; then
    echo "Checking gzip integrity..."
    if gzip -t "$BACKUP_FILE" 2>/dev/null; then
        echo "✓ Gzip integrity check passed"
    else
        echo "✗ Gzip integrity check failed - file may be corrupted"
        exit 1
    fi
fi

# Extract and check SQL content
echo "Analyzing SQL content..."

if [[ "$BACKUP_FILE" == *.gz ]]; then
    SQL_CONTENT=$(gunzip -c "$BACKUP_FILE" 2>/dev/null)
else
    SQL_CONTENT=$(cat "$BACKUP_FILE" 2>/dev/null)
fi

# Count tables
TABLE_COUNT=$(echo "$SQL_CONTENT" | grep -c "CREATE TABLE" || echo "0")
echo "  Tables found: $TABLE_COUNT"

# Check for critical tables
if echo "$SQL_CONTENT" | grep -q "CREATE TABLE.*registrations"; then
    echo "✓ registrations table found"
else
    echo "✗ registrations table NOT found"
fi

if echo "$SQL_CONTENT" | grep -q "CREATE TABLE.*incomplete_registrations"; then
    echo "✓ incomplete_registrations table found"
else
    echo "⚠ incomplete_registrations table not found (may not exist in older backups)"
fi

# Count INSERT statements (approximate record count)
INSERT_COUNT=$(echo "$SQL_CONTENT" | grep -c "INSERT INTO" || echo "0")
echo "  INSERT statements: $INSERT_COUNT"

# Check for data
if [ "$INSERT_COUNT" -gt 0 ]; then
    echo "✓ Backup contains data"
    
    # Count registrations specifically
    REG_COUNT=$(echo "$SQL_CONTENT" | grep -c "INSERT INTO.*registrations" || echo "0")
    echo "  Registration records: $REG_COUNT"
else
    echo "⚠ Backup appears to be schema-only (no data)"
fi

# Check backup age
FILE_AGE=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M:%S" "$BACKUP_FILE" 2>/dev/null || stat -c "%y" "$BACKUP_FILE" 2>/dev/null | cut -d' ' -f1-2)
echo "  Backup date: $FILE_AGE"

# Calculate age in days
if command -v date &> /dev/null; then
    FILE_TIMESTAMP=$(stat -f "%m" "$BACKUP_FILE" 2>/dev/null || stat -c "%Y" "$BACKUP_FILE" 2>/dev/null)
    CURRENT_TIMESTAMP=$(date +%s)
    AGE_SECONDS=$((CURRENT_TIMESTAMP - FILE_TIMESTAMP))
    AGE_DAYS=$((AGE_SECONDS / 86400))
    
    if [ "$AGE_DAYS" -lt 1 ]; then
        echo "  Age: Less than 1 day old"
    elif [ "$AGE_DAYS" -lt 7 ]; then
        echo "  Age: $AGE_DAYS day(s) old"
    elif [ "$AGE_DAYS" -lt 30 ]; then
        echo "  Age: $AGE_DAYS days old (~$((AGE_DAYS / 7)) weeks)"
    else
        echo "  Age: $AGE_DAYS days old (~$((AGE_DAYS / 30)) months)"
    fi
    
    if [ "$AGE_DAYS" -gt 7 ]; then
        echo "  ⚠ Warning: Backup is more than 7 days old"
    fi
fi

echo "---"
echo "Verification complete"

# Summary
if [ "$TABLE_COUNT" -gt 0 ] && [ "$INSERT_COUNT" -gt 0 ]; then
    echo "✓ Backup appears to be valid and contains data"
    exit 0
elif [ "$TABLE_COUNT" -gt 0 ]; then
    echo "⚠ Backup contains schema but no data (may be intentional)"
    exit 0
else
    echo "✗ Backup appears to be invalid or empty"
    exit 1
fi

