# ResumeNova Deployment Guide

This guide outlines the necessary steps to deploy ResumeNova to a production environment.

## 1. Prerequisites

- PHP 8.3+
- MySQL 8.0+ or PostgreSQL 15+
- Redis (for cache and queues)
- Web Server (Nginx/Apache)
- Composer & Node.js

## 2. Initial Setup

1. Clone the repository and navigate to the `backend` directory.
2. Install PHP dependencies:
    ```bash
    composer install --optimize-autoloader --no-dev
    ```
3. Install frontend dependencies and build assets:
    ```bash
    npm ci
    npm run build
    ```

## 3. Environment Configuration

Copy `.env.example` to `.env` and configure the following critical variables:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-production-url.com

# Use daily log rotation to prevent massive log files
LOG_CHANNEL=daily

# Setup database credentials
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=resumenova
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password

# Use Redis or Database for robust queues in production
QUEUE_CONNECTION=redis
CACHE_STORE=redis
SESSION_DRIVER=redis
```

## 4. Application Key & Migrations

Generate the app key and run migrations:

```bash
php artisan key:generate --force
php artisan migrate --force
```

## 5. Storage Symlink

Link the storage directory so uploaded avatars are accessible:

```bash
php artisan storage:link
```

## 6. Performance Optimization Commands

Run these commands to cache configurations, routes, and views for optimal performance:

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache
```

_Note: Run `php artisan optimize:clear` whenever you update your code and need to clear these caches._

## 7. Queue Worker

To process background jobs (e.g., sending emails), set up a persistent queue worker using Supervisor.
Example Supervisor configuration (`/etc/supervisor/conf.d/resumenova-worker.conf`):

```ini
[program:resumenova-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /path/to/resumenova/backend/artisan queue:work redis --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=4
redirect_stderr=true
stdout_logfile=/path/to/resumenova/backend/storage/logs/worker.log
stopwaitsecs=3600
```

## 8. Scheduler (Cron Job)

Add the following Cron entry to your server to run Laravel's scheduled tasks every minute:

```bash
* * * * * cd /path/to/resumenova/backend && php artisan schedule:run >> /dev/null 2>&1
```

## 9. Security Checklist

- [ ] Ensure `APP_DEBUG` is `false`.
- [ ] Ensure the web server's document root points strictly to the `/public` directory.
- [ ] Use SSL/HTTPS for all traffic.
- [ ] Restrict file permissions (`chown -R www-data:www-data storage bootstrap/cache`).
