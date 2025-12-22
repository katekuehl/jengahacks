# Backup Strategy

Comprehensive backup and disaster recovery strategy for the JengaHacks Hub application.

## Overview

This document outlines backup strategies for all critical data and configurations to ensure business continuity and data protection.

## What Needs to Be Backed Up

### 1. Database (Supabase PostgreSQL)
- **Tables:**
  - `registrations` - All participant registrations
  - `incomplete_registrations` - Incomplete registration attempts
- **Frequency:** Daily automated backups (Supabase Pro) + Manual exports
- **Retention:** 30 days automated, 1 year manual exports

### 2. Storage Buckets
- **Bucket:** `resumes` - Participant resume files
- **Frequency:** Weekly full backup, daily incremental
- **Retention:** 90 days

### 3. Edge Functions
- **Functions:**
  - `register-with-ip` - Registration with IP capture
  - `verify-recaptcha` - CAPTCHA verification
  - `get-resume-url` - Secure resume access
- **Frequency:** On every deployment (Git version control)
- **Retention:** Permanent (Git history)

### 4. Database Migrations
- **Location:** `supabase/migrations/`
- **Frequency:** On every commit (Git version control)
- **Retention:** Permanent (Git history)

### 5. Environment Variables & Configuration
- **Files:** `.env.example`, `ENVIRONMENT_VARIABLES.md`
- **Secrets:** Supabase secrets, API keys
- **Frequency:** On every change
- **Retention:** Encrypted secure storage

### 6. Application Code
- **Location:** Git repository
- **Frequency:** Continuous (Git commits)
- **Retention:** Permanent (Git history)

## Backup Methods

### Method 1: Supabase Automated Backups (Recommended)

**Supabase Pro Plan** includes automated daily backups with point-in-time recovery.

**Setup:**
1. Upgrade to Supabase Pro plan
2. Automated backups are enabled by default
3. Access backups via Supabase Dashboard → Database → Backups

**Restore:**
- Point-in-time recovery available for last 7 days
- Full database restore via Supabase Dashboard

**Advantages:**
- Automated, no manual intervention
- Point-in-time recovery
- Managed by Supabase

**Limitations:**
- Requires Pro plan ($25/month)
- 7-day retention on Pro plan
- Longer retention requires Enterprise plan

### Method 2: Manual Database Exports

**For Free Tier or Additional Backup:**

```bash
# Export database schema
supabase db dump --schema public > backup_schema_$(date +%Y%m%d).sql

# Export data only
supabase db dump --data-only --schema public > backup_data_$(date +%Y%m%d).sql

# Export everything
supabase db dump > backup_full_$(date +%Y%m%d).sql
```

**Schedule with cron:**
```bash
# Add to crontab (runs daily at 2 AM)
0 2 * * * cd /path/to/project && supabase db dump > backups/db_$(date +\%Y\%m\%d).sql
```

### Method 3: pg_dump (Direct PostgreSQL)

**Using Supabase Connection String:**

```bash
# Get connection string from Supabase Dashboard → Settings → Database
# Format: postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres

# Full backup
pg_dump "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" \
  --schema=public \
  --file=backup_$(date +%Y%m%d_%H%M%S).sql \
  --verbose

# Backup specific tables only
pg_dump "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" \
  --table=registrations \
  --table=incomplete_registrations \
  --file=backup_tables_$(date +%Y%m%d_%H%M%S).sql \
  --verbose
```

### Method 4: Storage Bucket Backup

**Using Supabase CLI:**

```bash
# List all files in resumes bucket
supabase storage ls resumes

# Download all files (requires service role key)
# Note: This requires custom script as Supabase CLI doesn't have bulk download
```

**Using Supabase API (Python Script):**

See `scripts/backup_storage.py` for automated storage backup.

**Manual Download:**
1. Supabase Dashboard → Storage → resumes
2. Download files individually or use API

### Method 5: Edge Functions Backup

**Already in Git:**
- Edge Functions are version controlled in `supabase/functions/`
- No additional backup needed

**Manual Export:**
```bash
# Export all Edge Functions
supabase functions list
supabase functions download <function-name>
```

## Automated Backup Scripts

### Database Backup Script

Create `scripts/backup_database.sh`:

```bash
#!/bin/bash
# Database backup script for JengaHacks Hub

set -e

# Configuration
BACKUP_DIR="./backups/database"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

# Check if Supabase CLI is available
if ! command -v supabase &> /dev/null; then
  echo "Error: Supabase CLI not found. Install with: npm install -g supabase"
  exit 1
fi

# Login check
if ! supabase projects list &> /dev/null; then
  echo "Error: Not logged in to Supabase. Run: supabase login"
  exit 1
fi

echo "Starting database backup at $(date)"

# Full database dump
BACKUP_FILE="$BACKUP_DIR/db_backup_$DATE.sql"
supabase db dump --project-ref "$SUPABASE_PROJECT_REF" > "$BACKUP_FILE"

# Compress backup
gzip "$BACKUP_FILE"
echo "Backup created: ${BACKUP_FILE}.gz"

# Remove old backups (older than retention period)
find "$BACKUP_DIR" -name "db_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete
echo "Removed backups older than $RETENTION_DAYS days"

# Calculate backup size
BACKUP_SIZE=$(du -h "${BACKUP_FILE}.gz" | cut -f1)
echo "Backup size: $BACKUP_SIZE"
echo "Backup completed at $(date)"
```

### Storage Backup Script

Create `scripts/backup_storage.py`:

```python
#!/usr/bin/env python3
"""
Storage backup script for JengaHacks Hub
Backs up resume files from Supabase storage bucket
"""

import os
import sys
import json
import requests
from datetime import datetime
from pathlib import Path
import gzip
import shutil

# Configuration
BUCKET_NAME = "resumes"
BACKUP_DIR = Path("./backups/storage")
RETENTION_DAYS = 90

def get_supabase_client():
    """Initialize Supabase client"""
    from supabase import create_client, Client
    
    url = os.getenv("SUPABASE_URL")
    service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    if not url or not service_key:
        print("Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")
        sys.exit(1)
    
    return create_client(url, service_key)

def backup_storage():
    """Backup all files from storage bucket"""
    supabase = get_supabase_client()
    
    # Create backup directory
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_path = BACKUP_DIR / f"storage_backup_{timestamp}"
    backup_path.mkdir()
    
    # List all files in bucket
    files = supabase.storage.from_(BUCKET_NAME).list()
    
    if not files:
        print("No files found in bucket")
        return
    
    print(f"Found {len(files)} files to backup")
    
    # Download each file
    downloaded = 0
    failed = 0
    
    for file_info in files:
        file_name = file_info['name']
        try:
            # Download file
            file_data = supabase.storage.from_(BUCKET_NAME).download(file_name)
            
            # Save to backup directory
            file_path = backup_path / file_name
            with open(file_path, 'wb') as f:
                f.write(file_data)
            
            downloaded += 1
            print(f"Downloaded: {file_name}")
            
        except Exception as e:
            print(f"Error downloading {file_name}: {e}")
            failed += 1
    
    # Create manifest
    manifest = {
        "timestamp": timestamp,
        "bucket": BUCKET_NAME,
        "total_files": len(files),
        "downloaded": downloaded,
        "failed": failed,
        "files": [f['name'] for f in files]
    }
    
    manifest_path = backup_path / "manifest.json"
    with open(manifest_path, 'w') as f:
        json.dump(manifest, f, indent=2)
    
    # Compress backup
    archive_path = BACKUP_DIR / f"storage_backup_{timestamp}.tar.gz"
    shutil.make_archive(
        str(archive_path).replace('.tar.gz', ''),
        'gztar',
        backup_path
    )
    
    # Remove uncompressed directory
    shutil.rmtree(backup_path)
    
    print(f"\nBackup completed:")
    print(f"  Files downloaded: {downloaded}")
    print(f"  Files failed: {failed}")
    print(f"  Archive: {archive_path}")
    
    # Cleanup old backups
    cleanup_old_backups()

def cleanup_old_backups():
    """Remove backups older than retention period"""
    import time
    cutoff_time = time.time() - (RETENTION_DAYS * 24 * 60 * 60)
    
    for backup_file in BACKUP_DIR.glob("storage_backup_*.tar.gz"):
        if backup_file.stat().st_mtime < cutoff_time:
            backup_file.unlink()
            print(f"Removed old backup: {backup_file}")

if __name__ == "__main__":
    backup_storage()
```

## Backup Schedule

### Recommended Schedule

| Backup Type | Frequency | Method | Retention |
|------------|-----------|--------|-----------|
| Database (Automated) | Daily | Supabase Pro | 7 days |
| Database (Manual) | Weekly | pg_dump/Supabase CLI | 1 year |
| Storage Buckets | Weekly | Custom Script | 90 days |
| Edge Functions | On Deploy | Git | Permanent |
| Migrations | On Commit | Git | Permanent |
| Environment Config | On Change | Encrypted Storage | Permanent |

### Cron Schedule Example

```bash
# Daily database backup at 2 AM
0 2 * * * /path/to/scripts/backup_database.sh >> /var/log/backup.log 2>&1

# Weekly storage backup on Sundays at 3 AM
0 3 * * 0 /path/to/scripts/backup_storage.py >> /var/log/backup.log 2>&1

# Monthly full backup on 1st of month at 1 AM
0 1 1 * * /path/to/scripts/backup_full.sh >> /var/log/backup.log 2>&1
```

## Backup Storage Locations

### Local Storage
- **Path:** `./backups/`
- **Structure:**
  ```
  backups/
  ├── database/
  │   ├── db_backup_20250101_020000.sql.gz
  │   └── db_backup_20250102_020000.sql.gz
  ├── storage/
  │   ├── storage_backup_20250101_030000.tar.gz
  │   └── storage_backup_20250108_030000.tar.gz
  └── full/
      └── full_backup_20250201_010000.tar.gz
  ```

### Cloud Storage (Recommended)
- **AWS S3** - Encrypted, versioned
- **Google Cloud Storage** - Encrypted, versioned
- **Azure Blob Storage** - Encrypted, versioned
- **Backblaze B2** - Cost-effective

**Setup S3 Backup:**
```bash
# Install AWS CLI
pip install awscli

# Configure credentials
aws configure

# Upload backup to S3
aws s3 cp backups/db_backup_20250101.sql.gz \
  s3://jengahacks-backups/database/
```

## Restore Procedures

### Database Restore

**From Supabase Dashboard (Point-in-Time Recovery):**
1. Go to Supabase Dashboard → Database → Backups
2. Select restore point
3. Click "Restore"
4. Confirm restore

**From SQL Dump:**
```bash
# Restore full database
supabase db reset
psql "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" < backup.sql

# Restore specific tables
psql "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" \
  -c "TRUNCATE TABLE registrations, incomplete_registrations CASCADE;"
psql "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" \
  -t registrations < backup_registrations.sql
```

**From Supabase CLI:**
```bash
# Restore from dump file
supabase db reset
supabase db push --file backup.sql
```

### Storage Restore

**From Backup Archive:**
```python
# Extract archive
tar -xzf storage_backup_20250101.tar.gz

# Upload files back to Supabase
# Use restore_storage.py script (see scripts/)
```

**Manual Restore:**
1. Extract backup archive
2. Upload files via Supabase Dashboard → Storage
3. Or use Supabase API to upload programmatically

### Edge Functions Restore

**From Git:**
```bash
# Checkout specific version
git checkout <commit-hash>

# Deploy functions
supabase functions deploy register-with-ip
supabase functions deploy verify-recaptcha
supabase functions deploy get-resume-url
```

## Backup Verification

### Verify Database Backup

```bash
# Check backup file integrity
gzip -t backup.sql.gz

# Verify backup contains expected tables
grep -i "CREATE TABLE" backup.sql | grep -E "(registrations|incomplete_registrations)"

# Count records in backup
grep -c "INSERT INTO.*registrations" backup.sql
```

### Verify Storage Backup

```bash
# Check archive integrity
tar -tzf storage_backup.tar.gz > /dev/null && echo "Archive OK"

# List files in backup
tar -tzf storage_backup.tar.gz | wc -l

# Verify manifest
tar -xzf storage_backup.tar.gz manifest.json
cat manifest.json
```

## Disaster Recovery Plan

### Recovery Time Objectives (RTO)
- **Database:** 1 hour
- **Storage:** 4 hours
- **Full System:** 8 hours

### Recovery Point Objectives (RPO)
- **Database:** 24 hours (daily backups)
- **Storage:** 7 days (weekly backups)
- **Configuration:** Real-time (Git)

### Recovery Procedures

1. **Assess Damage**
   - Identify what data is lost
   - Determine backup availability
   - Estimate recovery time

2. **Restore Database**
   - Use most recent backup
   - Verify data integrity
   - Test critical functions

3. **Restore Storage**
   - Upload resume files
   - Verify file integrity
   - Update file paths if needed

4. **Verify System**
   - Test registration flow
   - Verify file access
   - Check monitoring/alerts

5. **Post-Recovery**
   - Document incident
   - Review backup procedures
   - Update backup strategy if needed

## Security Considerations

### Backup Encryption

**Encrypt backups before storage:**
```bash
# Encrypt database backup
gpg --encrypt --recipient backup@jengahacks.com backup.sql.gz

# Decrypt when needed
gpg --decrypt backup.sql.gz.gpg > backup.sql.gz
```

### Access Control

- **Backup Storage:** Use encrypted cloud storage with access controls
- **Backup Scripts:** Restrict file permissions (chmod 700)
- **Credentials:** Store in secure vault (AWS Secrets Manager, HashiCorp Vault)

### Backup Retention Policy

- **Daily Backups:** 30 days
- **Weekly Backups:** 90 days
- **Monthly Backups:** 1 year
- **Annual Backups:** 7 years (compliance)

## Monitoring & Alerts

### Backup Monitoring

**Set up alerts for:**
- Backup failures
- Backup size anomalies
- Backup age (if backup is too old)
- Storage quota warnings

**Example Alert Script:**
```bash
#!/bin/bash
# Check if backup exists and is recent (within 25 hours)
BACKUP_FILE="./backups/database/db_backup_$(date +%Y%m%d)*.sql.gz"

if [ ! -f $BACKUP_FILE ]; then
  echo "ALERT: Daily backup missing!"
  # Send alert via email/webhook
fi
```

## Testing Backups

### Regular Testing Schedule

- **Weekly:** Verify backup file exists and is recent
- **Monthly:** Test restore procedure on staging environment
- **Quarterly:** Full disaster recovery drill

### Test Restore Procedure

1. Create test database/storage
2. Restore from backup
3. Verify data integrity
4. Test application functionality
5. Document results

## Backup Checklist

### Daily
- [ ] Verify automated backup completed
- [ ] Check backup file size
- [ ] Verify backup age (< 25 hours)

### Weekly
- [ ] Run storage backup
- [ ] Verify storage backup integrity
- [ ] Upload backups to cloud storage
- [ ] Review backup logs

### Monthly
- [ ] Test restore procedure
- [ ] Review backup retention
- [ ] Clean up old backups
- [ ] Update backup documentation

### Quarterly
- [ ] Full disaster recovery drill
- [ ] Review and update backup strategy
- [ ] Audit backup access logs
- [ ] Update recovery procedures

## Related Documentation

- [Deployment Guide](./DEPLOYMENT.md)
- [Environment Variables](./ENVIRONMENT_VARIABLES.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)
- [Supabase Documentation](https://supabase.com/docs/guides/platform/backups)

