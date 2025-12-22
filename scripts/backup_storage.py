#!/usr/bin/env python3
"""
Storage backup script for JengaHacks Hub
Backs up resume files from Supabase storage bucket
"""

import os
import sys
import json
from datetime import datetime, timedelta
from pathlib import Path
import shutil
import logging

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('backups/backup.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Configuration
BUCKET_NAME = "resumes"
BACKUP_DIR = Path("./backups/storage")
RETENTION_DAYS = 90

def get_supabase_client():
    """Initialize Supabase client"""
    try:
        from supabase import create_client, Client
    except ImportError:
        logger.error("supabase-py not installed. Install with: pip install supabase")
        sys.exit(1)
    
    url = os.getenv("VITE_SUPABASE_URL") or os.getenv("SUPABASE_URL")
    service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    if not url or not service_key:
        logger.error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")
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
    
    logger.info(f"Starting storage backup for bucket: {BUCKET_NAME}")
    
    # List all files in bucket
    try:
        files = supabase.storage.from_(BUCKET_NAME).list()
    except Exception as e:
        logger.error(f"Failed to list files: {e}")
        sys.exit(1)
    
    if not files:
        logger.info("No files found in bucket")
        return
    
    logger.info(f"Found {len(files)} files to backup")
    
    # Download each file
    downloaded = 0
    failed = 0
    failed_files = []
    
    for file_info in files:
        file_name = file_info.get('name', '')
        if not file_name:
            continue
            
        try:
            # Download file
            file_data = supabase.storage.from_(BUCKET_NAME).download(file_name)
            
            # Save to backup directory
            file_path = backup_path / file_name
            with open(file_path, 'wb') as f:
                f.write(file_data)
            
            downloaded += 1
            logger.debug(f"Downloaded: {file_name}")
            
        except Exception as e:
            logger.error(f"Error downloading {file_name}: {e}")
            failed += 1
            failed_files.append(file_name)
    
    # Create manifest
    manifest = {
        "timestamp": timestamp,
        "bucket": BUCKET_NAME,
        "total_files": len(files),
        "downloaded": downloaded,
        "failed": failed,
        "failed_files": failed_files,
        "files": [f.get('name', '') for f in files if f.get('name')]
    }
    
    manifest_path = backup_path / "manifest.json"
    with open(manifest_path, 'w') as f:
        json.dump(manifest, f, indent=2)
    
    logger.info(f"Manifest created: {manifest_path}")
    
    # Compress backup
    archive_path = BACKUP_DIR / f"storage_backup_{timestamp}.tar.gz"
    logger.info(f"Creating archive: {archive_path}")
    
    try:
        shutil.make_archive(
            str(archive_path).replace('.tar.gz', ''),
            'gztar',
            backup_path
        )
        logger.info(f"Archive created: {archive_path}")
    except Exception as e:
        logger.error(f"Failed to create archive: {e}")
        sys.exit(1)
    
    # Remove uncompressed directory
    shutil.rmtree(backup_path)
    logger.info("Removed uncompressed backup directory")
    
    # Calculate archive size
    archive_size = archive_path.stat().st_size / (1024 * 1024)  # MB
    logger.info(f"Archive size: {archive_size:.2f} MB")
    
    logger.info(f"\nBackup Summary:")
    logger.info(f"  Files downloaded: {downloaded}")
    logger.info(f"  Files failed: {failed}")
    logger.info(f"  Archive: {archive_path}")
    
    if failed > 0:
        logger.warning(f"  Failed files: {', '.join(failed_files)}")
    
    # Cleanup old backups
    cleanup_old_backups()
    
    logger.info("Storage backup completed successfully")

def cleanup_old_backups():
    """Remove backups older than retention period"""
    cutoff_time = datetime.now() - timedelta(days=RETENTION_DAYS)
    
    deleted = 0
    for backup_file in BACKUP_DIR.glob("storage_backup_*.tar.gz"):
        file_time = datetime.fromtimestamp(backup_file.stat().st_mtime)
        if file_time < cutoff_time:
            backup_file.unlink()
            deleted += 1
            logger.info(f"Removed old backup: {backup_file}")
    
    if deleted > 0:
        logger.info(f"Removed {deleted} old backup(s)")
    else:
        logger.info("No old backups to remove")

if __name__ == "__main__":
    try:
        backup_storage()
    except KeyboardInterrupt:
        logger.info("Backup interrupted by user")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Backup failed: {e}", exc_info=True)
        sys.exit(1)

