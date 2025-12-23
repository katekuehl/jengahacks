# Database Backup Implementation

This document describes the implemented database backup system for JengaHacks Hub.

## Overview

The backup system provides multiple layers of protection:
1. **GitHub Actions** - Automated daily backups (cloud-based)
2. **Local Scripts** - Manual and cron-based backups
3. **Supabase Pro** - Automated backups (if on Pro plan)

## Implementation Status

### ✅ Completed

- [x] Database backup script (`scripts/backup_database.sh`)
- [x] Storage backup script (`scripts/backup_storage.py`)
- [x] Comprehensive backup script (`scripts/backup_all.sh`)
- [x] Backup verification script (`scripts/verify_backup.sh`)
- [x] Backup health check script (`scripts/check-backup-health.sh`)
- [x] Cron setup script (`scripts/setup-backup-cron.sh`)
- [x] GitHub Actions automated backup workflow
- [x] Restore script (`scripts/restore_database.sh`)
- [x] Documentation (`BACKUP_STRATEGY.md`)

## Quick Start

### Option 1: GitHub Actions (Recommended)

**Setup:**
1. Set GitHub Secrets:
   - `SUPABASE_ACCESS_TOKEN` - Get from Supabase Dashboard → Account → Access Tokens
   - `SUPABASE_PROJECT_REF` - Your production project reference
   - `STAGING_SUPABASE_PROJECT_REF` - Your staging project reference (optional)
   - `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BACKUP_BUCKET` (optional, for cloud storage)

2. Workflow runs automatically:
   - **Daily at 2 AM UTC** - Production database backup
   - **Manual trigger** - Via Actions → Backup Database → Run workflow

3. View backups:
   - Go to Actions → Backup Database
   - Download artifacts (retained for 30 days)

### Option 2: Local Cron Jobs

**Setup:**
```bash
# Interactive setup
./scripts/setup-backup-cron.sh
```

This sets up:
- Daily database backup at 2 AM
- Weekly storage backup on Sundays at 3 AM
- Weekly full backup on Sundays at 4 AM

### Option 3: Manual Backups

**Database:**
```bash
./scripts/backup_database.sh
```

**Storage:**
```bash
python3 scripts/backup_storage.py
```

**Full Backup:**
```bash
./scripts/backup_all.sh
```

## Backup Locations

### GitHub Actions
- **Artifacts:** Available in GitHub Actions for 30 days
- **Cloud Storage:** Uploaded to S3/GCS if configured

### Local Backups
- **Database:** `backups/database/db_backup_YYYYMMDD_HHMMSS.sql.gz`
- **Storage:** `backups/storage/storage_backup_YYYYMMDD_HHMMSS.tar.gz`
- **Config:** `backups/config/config_backup_YYYYMMDD_HHMMSS.tar.gz`
- **Manifest:** `backups/backup_manifest_YYYYMMDD_HHMMSS.json`

## Backup Schedule

| Method | Frequency | Retention | Location |
|--------|-----------|-----------|----------|
| GitHub Actions | Daily (2 AM UTC) | 30 days | GitHub Artifacts + Cloud Storage |
| Local Cron | Daily (2 AM) | 30 days | Local `backups/` directory |
| Storage Backup | Weekly (Sundays) | 90 days | Local `backups/storage/` |
| Full Backup | Weekly (Sundays) | 90 days | Local `backups/` |

## Monitoring

### Health Check

Run health check manually:
```bash
./scripts/check-backup-health.sh
```

Or schedule with cron:
```bash
# Daily at 3 AM (after backup)
0 3 * * * cd /path/to/project && ./scripts/check-backup-health.sh
```

### GitHub Actions Monitoring

- Check workflow runs: Repository → Actions → Backup Database
- View backup summaries in workflow run summaries
- Set up notifications for workflow failures

## Restore Procedures

### From GitHub Actions Artifact

1. Go to Actions → Backup Database
2. Select a successful workflow run
3. Download the artifact
4. Extract the backup file
5. Restore using `scripts/restore_database.sh` or Supabase Dashboard

### From Local Backup

```bash
# Verify backup first
./scripts/verify_backup.sh backups/database/db_backup_20250101_020000.sql.gz

# Restore (dry run)
./scripts/restore_database.sh backups/database/db_backup_20250101_020000.sql.gz --dry-run

# Restore (actual)
./scripts/restore_database.sh backups/database/db_backup_20250101_020000.sql.gz
```

### From Supabase Dashboard

1. Go to Supabase Dashboard → Database → Backups
2. Select restore point
3. Click "Restore"
4. Confirm restore

## Cloud Storage Integration

### AWS S3 Setup

1. Create S3 bucket for backups
2. Enable versioning
3. Set lifecycle policies (optional)
4. Configure GitHub Secrets:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_REGION` (default: us-east-1)
   - `S3_BACKUP_BUCKET`

### Google Cloud Storage Setup

1. Create GCS bucket for backups
2. Create service account with Storage Admin role
3. Download service account key (JSON)
4. Configure GitHub Secrets:
   - `GCS_BACKUP_BUCKET`
   - `GCS_SERVICE_ACCOUNT_KEY` (base64 encoded JSON)

## Backup Verification

### Automated Verification

The backup scripts automatically verify:
- ✅ File integrity (gzip test)
- ✅ File size (not suspiciously small)
- ✅ Table count
- ✅ Critical tables presence

### Manual Verification

```bash
# Verify specific backup
./scripts/verify_backup.sh backups/database/db_backup_20250101_020000.sql.gz

# Health check (checks latest backup)
./scripts/check-backup-health.sh
```

## Troubleshooting

### Backup Fails in GitHub Actions

**Problem:** Workflow fails with authentication error

**Solution:**
1. Verify `SUPABASE_ACCESS_TOKEN` is set correctly
2. Token must have project access
3. Get new token: Supabase Dashboard → Account → Access Tokens

### Backup Fails Locally

**Problem:** Script fails with "Not logged in"

**Solution:**
```bash
supabase login
# Follow prompts to authenticate
```

### Backup Too Large

**Problem:** Backup file is very large

**Solution:**
- Backups are compressed (gzip)
- Consider excluding test data
- Use table-specific backups for large tables

### Storage Backup Fails

**Problem:** Python script fails

**Solution:**
1. Install dependencies: `pip install supabase`
2. Verify `SUPABASE_SERVICE_ROLE_KEY` is set (not anon key)
3. Check bucket name is correct (`resumes`)

## Best Practices

1. **Test Restores Regularly**
   - Monthly restore test on staging
   - Verify data integrity after restore

2. **Monitor Backup Health**
   - Set up alerts for backup failures
   - Check backup age daily
   - Verify backup size is reasonable

3. **Multiple Backup Locations**
   - Use GitHub Actions + local backups
   - Upload to cloud storage
   - Keep offsite backups

4. **Document Restore Procedures**
   - Keep restore steps documented
   - Test restore procedures
   - Train team on restore process

5. **Regular Review**
   - Review backup logs weekly
   - Check backup retention monthly
   - Update backup strategy quarterly

## Related Documentation

- [Backup Strategy](./BACKUP_STRATEGY.md) - Comprehensive backup documentation
- [Scripts README](./scripts/README.md) - Detailed script documentation
- [Deployment Guide](./DEPLOYMENT.md) - Deployment procedures
- [Troubleshooting Guide](./TROUBLESHOOTING.md) - Common issues

