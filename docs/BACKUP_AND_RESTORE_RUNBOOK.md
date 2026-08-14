# ResumeNova — Backup and Restoration Runbook

**Purpose:** Standard operating procedures for automated backups, point-in-time recovery, and disaster recovery testing for ResumeNova production systems.

---

## 1. Database Backup Procedures

### 1.1 Automated Nightly Backup Script

Save as `/usr/local/bin/resumenova-backup.sh`:

```bash
#!/bin/bash
set -eo pipefail

BACKUP_DIR="/var/backups/resumenova/db"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DB_NAME="resumenova_prod"
DB_USER="resumenova_backup"
DB_PASS="<BACKUP_USER_PASSWORD>"
BACKUP_FILE="${BACKUP_DIR}/resumenova_${TIMESTAMP}.sql.gz"

mkdir -p "$BACKUP_DIR"

# Perform transactional dump with single transaction and gzipped compression
mysqldump -u "$DB_USER" -p"$DB_PASS" \
  --single-transaction \
  --quick \
  --routines \
  --triggers \
  "$DB_NAME" | gzip -9 > "$BACKUP_FILE"

# Retention: Delete backups older than 30 days
find "$BACKUP_DIR" -type f -name "*.sql.gz" -mtime +30 -delete

echo "[$(date)] Backup completed successfully: $BACKUP_FILE"
```

Make executable and schedule in cron:

```bash
chmod +x /usr/local/bin/resumenova-backup.sh
# Add to crontab: 0 2 * * * /usr/local/bin/resumenova-backup.sh >> /var/log/resumenova-backup.log 2>&1
```

---

## 2. File Storage Backup Procedure

Generated exports and resume attachments stored in `backend/storage/app/exports` should be synchronized nightly to cold storage (e.g. AWS S3 Glacier or Cloudflare R2):

```bash
aws s3 sync /var/www/resumenova/backend/storage/app/exports s3://resumenova-cold-backups/exports/ --delete
```

---

## 3. Database Restoration Procedure

### 3.1 Point-in-Time Recovery / Disaster Restoration

1. **Stop Application Traffic & Workers:**

   ```bash
   sudo supervisorctl stop all
   cd /var/www/resumenova/backend && php artisan down --secret="rescue-session-token"
   ```

2. **Locate Target Backup Artifact:**

   ```bash
   ls -la /var/backups/resumenova/db/
   ```

3. **Restore into Database:**

   ```bash
   gunzip < /var/backups/resumenova/db/resumenova_YYYYMMDD_HHMMSS.sql.gz | mysql -u root -p resumenova_prod
   ```

4. **Verify Schema & Data Consistency:**

   ```bash
   mysql -u root -p -e "SELECT count(*) FROM users; SELECT count(*) FROM resumes; SELECT count(*) FROM exports;" resumenova_prod
   ```

5. **Bring Application Back Online:**

   ```bash
   cd /var/www/resumenova/backend
   php artisan up
   sudo supervisorctl start all
   ```

---

## 4. Disaster Recovery Testing

- Perform a quarterly restoration test into an isolated staging database.
- Confirm foreign key constraints, indexes, and encrypted user API keys remain decryptable with the production `APP_KEY`.
