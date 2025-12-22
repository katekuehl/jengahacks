# Backup Scripts

Automated backup scripts for JengaHacks Hub database and storage.

## Scripts

### `backup_database.sh`

Automated database backup script using Supabase CLI.

**Usage:**
```bash
./scripts/backup_database.sh
```

**Requirements:**
- Supabase CLI installed (`npm install -g supabase`)
- Logged in to Supabase (`supabase login`)
- `SUPABASE_PROJECT_REF` set in `.env` or `supabase/config.toml`

**Features:**
- Creates compressed SQL dump
- Automatic cleanup of old backups (30 days retention)
- Integrity verification
- Logging to `backups/backup.log`

**Schedule with cron:**
```bash
# Daily at 2 AM
0 2 * * * cd /path/to/project && ./scripts/backup_database.sh
```

### `backup_storage.py`

Automated storage bucket backup script.

**Usage:**
```bash
python3 scripts/backup_storage.py
```

**Requirements:**
- Python 3.7+
- `supabase-py` installed (`pip install supabase`)
- `VITE_SUPABASE_URL` or `SUPABASE_URL` environment variable
- `SUPABASE_SERVICE_ROLE_KEY` environment variable

**Features:**
- Downloads all files from `resumes` bucket
- Creates compressed tar.gz archive
- Generates manifest.json with backup metadata
- Automatic cleanup of old backups (90 days retention)
- Logging to `backups/backup.log`

**Schedule with cron:**
```bash
# Weekly on Sundays at 3 AM
0 3 * * 0 cd /path/to/project && python3 scripts/backup_storage.py
```

### `restore_database.sh`

Database restore script (use with caution).

**Usage:**
```bash
# Dry run (no changes)
./scripts/restore_database.sh db_backup_20250101_020000.sql.gz --dry-run

# Actual restore
./scripts/restore_database.sh db_backup_20250101_020000.sql.gz
```

**Warning:** This will overwrite your current database. Always test with `--dry-run` first.

**Note:** Direct restore via Supabase CLI is limited. For production restores, use:
- Supabase Dashboard → Database → Backups (point-in-time recovery)
- `psql` with connection string

### `verify_backup.sh`

Verify backup file integrity and contents.

**Usage:**
```bash
./scripts/verify_backup.sh db_backup_20250101_020000.sql.gz
```

**Checks:**
- File integrity (gzip test)
- Table count
- Record count estimates
- File size

## Setup

### 1. Install Dependencies

```bash
# Supabase CLI
npm install -g supabase

# Python dependencies
pip install supabase
```

### 2. Configure Environment

Create `.env` file with:
```bash
SUPABASE_PROJECT_REF=your-project-ref
VITE_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Login to Supabase

```bash
supabase login
```

### 4. Make Scripts Executable

```bash
chmod +x scripts/*.sh
```

## Backup Storage

Backups are stored in:
- Database: `backups/database/`
- Storage: `backups/storage/`

**Important:** These directories are in `.gitignore`. Do not commit backups to Git.

## Cloud Storage Integration

### Upload to AWS S3

```bash
# Install AWS CLI
pip install awscli

# Configure
aws configure

# Upload backup
aws s3 cp backups/database/db_backup_20250101.sql.gz \
  s3://jengahacks-backups/database/
```

### Upload to Google Cloud Storage

```bash
# Install gsutil
pip install gsutil

# Upload backup
gsutil cp backups/database/db_backup_20250101.sql.gz \
  gs://jengahacks-backups/database/
```

## Monitoring

Check backup logs:
```bash
tail -f backups/backup.log
```

Set up alerts for backup failures (see `BACKUP_STRATEGY.md`).

## Troubleshooting

### Backup Script Fails

1. Check Supabase CLI is installed and logged in
2. Verify `SUPABASE_PROJECT_REF` is set correctly
3. Check disk space: `df -h`
4. Review logs: `tail -20 backups/backup.log`

### Storage Backup Fails

1. Verify `SUPABASE_SERVICE_ROLE_KEY` is set (not anon key)
2. Check Python dependencies: `pip list | grep supabase`
3. Verify bucket name is correct (`resumes`)
4. Check network connectivity

### Restore Fails

1. Verify backup file integrity: `gzip -t backup.sql.gz`
2. Check database connection
3. Ensure sufficient disk space
4. Review restore logs

## Related Documentation

- [Backup Strategy](../BACKUP_STRATEGY.md) - Comprehensive backup documentation
- [Deployment Guide](../DEPLOYMENT.md) - Deployment procedures
- [Troubleshooting Guide](../TROUBLESHOOTING.md) - Common issues and solutions

