# ResumeNova — Production Environment Reference

This document catalogs every environment configuration variable required for running ResumeNova in a production environment.

---

## 1. Frontend Environment Variables (`.env`)

| Variable Name | Purpose | Example / Recommended Value | Sensitivity |
| --- | --- | --- | --- |
| `VITE_API_URL` | Base URL for Laravel REST API endpoints | `/api` (or `https://api.resumenova.com/api`) | Public |
| `VITE_APP_NAME` | Client brand title | `ResumeNova` | Public |

---

## 2. Backend Environment Variables (`backend/.env`)

### 2.1 Core Application

| Variable Name | Type | Description | Production Value |
| --- | --- | --- | --- |
| `APP_NAME` | string | Application identifier | `ResumeNova` |
| `APP_ENV` | string | Runtime environment | `production` |
| `APP_KEY` | base64 | AES-256 Application key | Generated via `php artisan key:generate` |
| `APP_DEBUG` | boolean | Debug mode | `false` |
| `APP_URL` | url | Primary API URL | `https://api.resumenova.com` |
| `APP_TIMEZONE` | string | System timezone | `UTC` |
| `BCRYPT_ROUNDS` | integer | Password hashing cost | `12` |

### 2.2 Database (MySQL)

| Variable Name | Description | Production Value |
| --- | --- | --- |
| `DB_CONNECTION` | Database driver | `mysql` |
| `DB_HOST` | Database host IP or domain | `127.0.0.1` (or managed DB host) |
| `DB_PORT` | MySQL connection port | `3306` |
| `DB_DATABASE` | Production schema name | `resumenova_prod` |
| `DB_USERNAME` | Restricted database user | `resumenova_app` |
| `DB_PASSWORD` | Strong user password | `<STRONG_SECRET_PASSWORD>` |

### 2.3 Sessions, Cache & Queues

| Variable Name | Description | Production Value |
| --- | --- | --- |
| `SESSION_DRIVER` | Session storage engine | `database` (or `redis`) |
| `SESSION_LIFETIME` | Session duration in minutes | `120` |
| `SESSION_ENCRYPT` | Session encryption | `true` |
| `SESSION_DOMAIN` | Cookie domain boundary | `.resumenova.com` |
| `CACHE_STORE` | Caching engine | `database` (or `redis`) |
| `QUEUE_CONNECTION` | Asynchronous queue driver | `database` (or `redis`) |

### 2.4 Google OAuth

| Variable Name | Description | Production Value |
| --- | --- | --- |
| `GOOGLE_CLIENT_ID` | Google Cloud Console Client ID | `<YOUR_GOOGLE_CLIENT_ID>` |
| `GOOGLE_CLIENT_SECRET` | Google Cloud Console Secret | `<YOUR_GOOGLE_CLIENT_SECRET>` |
| `GOOGLE_REDIRECT_URI` | OAuth callback target | `https://api.resumenova.com/api/auth/google/callback` |

### 2.5 Mail Configuration

| Variable Name | Description | Production Value |
| --- | --- | --- |
| `MAIL_MAILER` | Mail driver | `smtp` / `resend` / `postmark` |
| `MAIL_HOST` | Mail server host | `smtp.resend.com` |
| `MAIL_PORT` | Port | `587` |
| `MAIL_USERNAME` | SMTP User | `resend` |
| `MAIL_PASSWORD` | SMTP API Key | `<YOUR_MAIL_API_KEY>` |
| `MAIL_FROM_ADDRESS` | Sender email | `noreply@resumenova.com` |
| `MAIL_FROM_NAME` | Sender name | `ResumeNova` |

---

## 3. Secret Handling Rules

1. **Never commit `.env` files** to Git repositories.
2. **Never hardcode secrets** in application source files or frontend components.
3. User-supplied Groq API keys are encrypted at rest using `APP_KEY` via Laravel's `'encrypted'` model cast.
4. Rotate `APP_KEY` only with appropriate re-encryption routines to avoid corrupting user-stored API keys.
