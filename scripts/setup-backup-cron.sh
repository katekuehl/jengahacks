#!/bin/bash
# Setup cron jobs for automated backups
# This script helps configure automated backups on a Linux/macOS system

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "🔧 Setting up automated backup cron jobs"
echo "========================================"
echo ""

# Check if running on macOS or Linux
if [[ "$OSTYPE" == "darwin"* ]]; then
    CRON_CMD="crontab"
    echo "Detected: macOS"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    CRON_CMD="crontab"
    echo "Detected: Linux"
else
    echo "❌ Unsupported OS: $OSTYPE"
    exit 1
fi

echo ""
echo "This will set up the following cron jobs:"
echo "  1. Daily database backup at 2:00 AM"
echo "  2. Weekly storage backup on Sundays at 3:00 AM"
echo "  3. Weekly full backup on Sundays at 4:00 AM"
echo ""

read -p "Continue? (y/n): " CONFIRM

if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
    echo "Cancelled."
    exit 0
fi

# Backup existing crontab
echo ""
echo "Backing up existing crontab..."
$CRON_CMD -l > /tmp/crontab_backup_$(date +%Y%m%d_%H%M%S).txt 2>/dev/null || true

# Get current crontab
CURRENT_CRON=$($CRON_CMD -l 2>/dev/null || echo "")

# Check if backup jobs already exist
if echo "$CURRENT_CRON" | grep -q "backup_database.sh"; then
    echo "⚠️  Backup cron jobs already exist. Updating..."
    # Remove existing backup jobs
    echo "$CURRENT_CRON" | grep -v "backup_database.sh" | grep -v "backup_storage.py" | grep -v "backup_all.sh" > /tmp/crontab_new.txt || echo "" > /tmp/crontab_new.txt
    CURRENT_CRON=$(cat /tmp/crontab_new.txt)
fi

# Add backup jobs
echo ""
echo "Adding backup cron jobs..."

# Daily database backup at 2 AM
CRON_DB="0 2 * * * cd $PROJECT_DIR && $SCRIPT_DIR/backup_database.sh >> $PROJECT_DIR/backups/backup.log 2>&1"

# Weekly storage backup on Sundays at 3 AM
CRON_STORAGE="0 3 * * 0 cd $PROJECT_DIR && python3 $SCRIPT_DIR/backup_storage.py >> $PROJECT_DIR/backups/backup.log 2>&1"

# Weekly full backup on Sundays at 4 AM
CRON_FULL="0 4 * * 0 cd $PROJECT_DIR && $SCRIPT_DIR/backup_all.sh >> $PROJECT_DIR/backups/backup.log 2>&1"

# Combine all cron jobs
{
    echo "$CURRENT_CRON"
    echo ""
    echo "# JengaHacks Hub - Automated Backups"
    echo "# Daily database backup"
    echo "$CRON_DB"
    echo ""
    echo "# Weekly storage backup (Sundays)"
    echo "$CRON_STORAGE"
    echo ""
    echo "# Weekly full backup (Sundays)"
    echo "$CRON_FULL"
} | $CRON_CMD -

echo "✅ Cron jobs added successfully!"
echo ""
echo "Current crontab:"
echo "---"
$CRON_CMD -l | grep -A 10 "JengaHacks Hub"
echo "---"
echo ""
echo "To view all cron jobs: crontab -l"
echo "To edit cron jobs: crontab -e"
echo "To remove backup jobs: crontab -e (then delete the JengaHacks Hub section)"
echo ""
echo "⚠️  Make sure SUPABASE_PROJECT_REF is set in your environment or .env file"
echo "⚠️  Make sure you're logged in to Supabase: supabase login"

