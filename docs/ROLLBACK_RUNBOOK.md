# ResumeNova — Rollback Runbook

**Purpose:** Rapid, deterministic rollback procedures in the event of a failed production release or critical runtime incident.

---

## 1. Rollback Trigger Criteria

Initiate immediate rollback if any of the following occur post-deployment:

- **SEV-1 Critical Security Incident:** Unauthorized access, secret exposure, or authentication bypass.
- **SEV-1 Data Corruption:** Inconsistent state in `users`, `resumes`, or `exports`.
- **High 5xx Failure Rate:** Sustained HTTP 5xx error rate > 5% on critical endpoints (`/api/login`, `/api/resumes`, `/api/ats/analyze`).
- **AI Infrastructure Breakdown:** Complete inability to communicate with Groq API across all configured keys.

---

## 2. Application Release Rollback Procedure

### Step 1: Place Application in Maintenance Mode

```bash
cd /var/www/resumenova/backend
php artisan down --secret="emergency-admin-bypass"
sudo supervisorctl stop all
```

### Step 2: Roll Back Frontend Assets & Code

If using Git release tags or previous commit hashes:

```bash
cd /var/www/resumenova
git checkout <PREVIOUS_STABLE_COMMIT_OR_TAG>
npm ci
npm run build
```

### Step 3: Roll Back Backend Release & Dependencies

```bash
cd /var/www/resumenova/backend
composer install --no-dev --optimize-autoloader
```

### Step 4: Revert Database Migrations (If Needed)

Only rollback migrations if the newly introduced migration is the source of the failure:

```bash
# Roll back the most recent migration batch
php artisan migrate:rollback --step=1 --force
```

### Step 5: Flush and Re-warm Caches

```bash
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Step 6: Restart Workers and Bring Application Online

```bash
sudo supervisorctl start all
php artisan up
```

---

## 3. Post-Rollback Verification

1. Perform health check: `curl -I https://api.resumenova.com/api/user`
2. Test user login on frontend: `https://app.resumenova.com/login`
3. Check Laravel error log: `tail -n 100 /var/www/resumenova/backend/storage/logs/laravel.log`
4. Document incident timeline and root cause in an incident report.
