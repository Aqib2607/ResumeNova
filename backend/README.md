# ResumeNova – Backend

> **Week 04 · Part 2 – Authentication System**

A production-ready Laravel 12 backend for the ResumeNova platform.

---

## Tech Stack

| Layer         | Technology                    |
| ------------- | ----------------------------- |
| Language      | PHP 8.3+                      |
| Framework     | Laravel 12                    |
| Auth          | Laravel Breeze (Blade)        |
| OAuth         | Laravel Socialite (Google)    |
| Database      | MySQL 8+                      |
| Queue / Cache | Database driver (Redis-ready) |
| PDF           | barryvdh/laravel-dompdf       |
| Word          | phpoffice/phpword             |
| Frontend      | Vite + Tailwind CSS           |
| Testing       | PestPHP                       |

---

## Local Setup

### Prerequisites

- PHP 8.3+
- Composer 2+
- Node.js 20+ & npm
- MySQL 8+

### Steps

```bash
# 1. Clone the repo and navigate to the backend
git clone <repo-url>
cd ResumeNova/backend

# 2. Copy environment file
cp .env.example .env

# 3. Install PHP dependencies
composer install

# 4. Generate application key
php artisan key:generate

# 5. Configure your database in .env
# DB_DATABASE=resumenova
# DB_USERNAME=root
# DB_PASSWORD=your_password

# 6. Create the database
mysql -u root -p -e "CREATE DATABASE resumenova CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 7. Run migrations
php artisan migrate

# 8. Install Node dependencies
npm install

# 9. Start the development server (opens server + queue + Vite)
composer run dev
```

---

## Folder Architecture

```
app/
├── Actions/           # Single-purpose action classes
├── Contracts/         # Interfaces (Repository, Service, etc.)
│   └── Repository/
│       └── RepositoryInterface.php
├── DTOs/              # Data Transfer Objects
├── Enums/             # PHP 8.1+ backed enums
├── Events/            # Domain events
├── Helpers/           # Global helper functions (helpers.php)
├── Http/
│   ├── Controllers/   # Feature controllers
│   ├── Middleware/    # Custom middleware
│   └── Requests/      # Form Request validation
├── Jobs/              # Queued jobs
├── Listeners/         # Event listeners
├── Models/            # Eloquent models
├── Notifications/     # Laravel notifications
├── Observers/         # Eloquent model observers
├── Policies/          # Authorisation policies
├── Repositories/      # Data access layer
│   └── BaseRepository.php
├── Rules/             # Custom validation rules
├── Services/          # Business logic layer
│   └── BaseService.php
└── Traits/            # Shared traits
    └── ApiResponder.php

resources/views/
├── layouts/
│   ├── app.blade.php      # Authenticated shell
│   ├── guest.blade.php    # Auth pages shell
│   └── admin.blade.php    # Admin panel shell
├── components/            # Shared Blade components
├── auth/                  # Breeze auth views
├── dashboard/             # User dashboard
├── admin/                 # Admin panel pages
└── profile/               # User profile pages
```

---

## Environment Variables Reference

| Variable               | Description                          | Default                 |
| ---------------------- | ------------------------------------ | ----------------------- |
| `APP_NAME`             | Application name                     | `ResumeNova`            |
| `APP_ENV`              | Environment (`local` / `production`) | `local`                 |
| `APP_URL`              | Application base URL                 | `http://localhost:8000` |
| `DB_DATABASE`          | MySQL database name                  | `resumenova`            |
| `QUEUE_CONNECTION`     | Queue driver                         | `database`              |
| `CACHE_STORE`          | Cache driver                         | `database`              |
| `MAIL_MAILER`          | Mail driver                          | `log` (local)           |
| `GOOGLE_CLIENT_ID`     | Google OAuth client ID               | _(required for OAuth)_  |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret           | _(required for OAuth)_  |
| `GOOGLE_REDIRECT_URI`  | OAuth callback URI                   | `/auth/google/callback` |

---

## Coding Standards

- **PSR-12** for code style – enforced by Laravel Pint (`./vendor/bin/pint`)
- **Strict types** (`declare(strict_types=1)`) in all PHP files
- **Service / Repository pattern** – controllers delegate to services, services delegate to repositories
- **DTOs** for passing structured data between layers
- **Enums** for fixed value sets (roles, statuses, etc.)
- **Action classes** for single-use business operations

---

## Running Tests

```bash
php artisan test
# or
./vendor/bin/pest
```

---

## Google OAuth Setup

Google OAuth uses Laravel Socialite. No implementation is live until you add real credentials.

### 1. Create a Google Cloud Project

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project (e.g. **ResumeNova**)
3. Enable the **Google+ API** or **People API** (OAuth works without it, but profiles need it)

### 2. Create OAuth 2.0 Credentials

1. Navigate to **APIs & Services → Credentials**
2. Click **Create Credentials → OAuth client ID**
3. Application type: **Web application**
4. Add Authorized redirect URIs:
    ```
    http://localhost:8000/auth/google/callback
    https://yourdomain.com/auth/google/callback
    ```
5. Copy the **Client ID** and **Client Secret**

### 3. Configure `.env`

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback
```

### 4. Test the Flow

1. Start the dev server: `composer run dev`
2. Visit `http://localhost:8000/login`
3. Click **Continue with Google**
4. Complete the Google consent screen
5. You are redirected to `/dashboard`

---

## Running Tests

```bash
# Run all tests
php artisan test

# Run only auth tests
php artisan test --filter=Auth

# Run a specific test file
php artisan test tests/Feature/Auth/GoogleOAuthTest.php
```

> **Note**: Tests use a dedicated `resumenova_test` MySQL database (configured in `phpunit.xml`).  
> Create it with: `php artisan tinker --execute="DB::statement('CREATE DATABASE IF NOT EXISTS resumenova_test');" `

---

## Part 3 Preview

Part 3 will implement:

- Resume Builder module (CRUD, templates)
- File upload & storage
- PDF/Word export foundation
- Admin panel with user management

---

_Built with ❤️ on Laravel 12 – ResumeNova Week 04, Part 2_
