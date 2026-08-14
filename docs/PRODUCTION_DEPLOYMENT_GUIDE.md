# ResumeNova — Production Deployment Guide

**Version:** 1.0  
**Target Architecture:** React SPA (`src/` Vite Build) + Laravel 11/12 REST API (`backend/`) + MySQL 8.0+ + Groq AI  
**Security Level:** Production / High-Availability

---

## 1. Architecture & Infrastructure Overview

ResumeNova operates on a decoupled client-server model:

- **Frontend Layer:** Static Single Page Application compiled by Vite into HTML, CSS, and JS bundles (`dist/`). Can be hosted behind Nginx, Apache, Cloudflare Pages, AWS S3 + CloudFront, or Vercel.
- **Backend API Layer:** Laravel 11/12 PHP 8.2+ application located in `backend/` exposing RESTful endpoints under `/api/*`. Hosted on an Nginx/Apache + PHP-FPM server (Ubuntu 22.04/24.04 LTS, AWS EC2, DigitalOcean Droplet, Laravel Forge, or Docker container).
- **Database Layer:** MySQL 8.0+ or MariaDB 10.11+ storing 18 normalized tables with foreign keys and transactional integrity.
- **Queue / Worker Layer:** PHP CLI queue worker (`php artisan queue:work`) handling asynchronous processing.
- **Scheduler:** System cron daemon triggering `php artisan schedule:run` every minute.

---

## 2. Server Prerequisites

### 2.1 System Packages (Ubuntu/Debian)

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y nginx mysql-server php8.2 php8.2-fpm php8.2-mysql php8.2-mbstring \
    php8.2-xml php8.2-bcmath php8.2-curl php8.2-zip php8.2-gd php8.2-intl \
    git curl unzip supervisor certbot python3-certbot-nginx
```

### 2.2 Node.js & Composer

- Node.js: `v20.x LTS` or `v22.x LTS`
- Composer: `v2.7+`

---

## 3. Step-by-Step Deployment Procedure

### Step 1: Clone & Directory Permissions

```bash
cd /var/www
git clone https://github.com/YourOrg/ResumeNova.git resumenova
cd /var/www/resumenova/backend

# Set proper ownership and permissions
sudo chown -R www-data:www-data /var/www/resumenova/backend/storage /var/www/resumenova/backend/bootstrap/cache
sudo chmod -R 775 /var/www/resumenova/backend/storage /var/www/resumenova/backend/bootstrap/cache
```

### Step 2: Configure Environment Variables

Copy `.env.example` and set production secrets:

```bash
cp /var/www/resumenova/backend/.env.example /var/www/resumenova/backend/.env
```

Key production variables:

```ini
APP_NAME=ResumeNova
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.resumenova.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=resumenova_prod
DB_USERNAME=resumenova_user
DB_PASSWORD="<SECURE_GENERATED_PASSWORD>"

SANCTUM_STATEFUL_DOMAINS=app.resumenova.com,resumenova.com
SESSION_DOMAIN=.resumenova.com

GOOGLE_CLIENT_ID="<GOOGLE_CLIENT_ID>"
GOOGLE_CLIENT_SECRET="<GOOGLE_CLIENT_SECRET>"
GOOGLE_REDIRECT_URI="https://api.resumenova.com/api/auth/google/callback"
```

Generate the encryption key:

```bash
php artisan key:generate --force
```

### Step 3: Install Backend Dependencies & Optimize

```bash
cd /var/www/resumenova/backend
composer install --no-dev --optimize-autoloader

php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Step 4: Run Database Migrations & Seeders

```bash
# Execute transactional migrations
php artisan migrate --force

# Seed core resume templates
php artisan db:seed --class=ResumeTemplateSeeder --force
```

### Step 5: Build Frontend SPA

```bash
cd /var/www/resumenova
npm ci
npm run build

# The built assets in dist/ are automatically mirrored into backend/public or can be served directly
```

### Step 6: Configure Nginx

Create `/etc/nginx/sites-available/resumenova`:

```nginx
server {
    listen 80;
    server_name app.resumenova.com api.resumenova.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name app.resumenova.com api.resumenova.com;
    root /var/www/resumenova/backend/public;

    ssl_certificate /etc/letsencrypt/live/resumenova.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/resumenova.com/privkey.pem;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Content-Type-Options "nosniff";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    index index.html index.php;
    charset utf-8;

    # API and Backend routing
    location /api {
        try_files $uri $uri/ /index.php?$query_string;
    }

    # Frontend SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

Enable site and test configuration:

```bash
sudo ln -s /etc/nginx/sites-available/resumenova /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### Step 7: Configure Supervisor (Queue Worker)

Create `/etc/supervisor/conf.d/resumenova-worker.conf`:

```ini
[program:resumenova-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/resumenova/backend/artisan queue:work database --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/www/resumenova/backend/storage/logs/worker.log
```

Start supervisor:

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start all
```

### Step 8: Configure Cron (Scheduler)

Add to www-data crontab (`sudo crontab -u www-data -e`):

```cron
* * * * * cd /var/www/resumenova/backend && php artisan schedule:run >> /dev/null 2>&1
```

---

## 4. Post-Deployment Verification

- Run health check: `curl -I https://app.resumenova.com`
- Test API status: `curl -I https://api.resumenova.com/api/user`
- Verify SSL certification: SSL Labs grade A/A+
