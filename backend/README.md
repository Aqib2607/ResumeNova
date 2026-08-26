# ResumeNova – Backend API & AI Engine

An enterprise-grade, high-performance Laravel 12 REST API powering the ResumeNova career platform. Engineered with a clean Service/Repository architecture, multi-key Groq LLM failover, dual-layer ATS scoring, and asynchronous document compilation.

---

## 🛠️ Tech Stack & Architecture

| Layer                   | Technology                  | Details                                                                 |
| :---------------------- | :-------------------------- | :---------------------------------------------------------------------- |
| **Framework**           | Laravel 12.x / PHP 8.3+     | PSR-12 strict-typed REST API architecture                               |
| **Authentication**      | Laravel Sanctum & Socialite | Stateful token authentication and Google OAuth                          |
| **Database**            | MySQL 8.0+                  | 25 structured migrations with Eloquent ORM                              |
| **AI Inference**        | Groq Cloud SDK              | Multi-model support (DeepSeek, Llama, Qwen, Mixtral) with BYOK failover |
| **Document Generation** | DomPDF & PHPWord            | Programmatic compilation for PDF and `.docx`                            |
| **Testing**             | PestPHP 4.7 & PHPUnit       | 111 feature tests covering auth, AI, exports, and RBAC                  |
| **Code Quality**        | Laravel Pint & Larastan     | Static analysis and automated formatting                                |

---

## 🚀 Quick Setup

### Prerequisites

- PHP >= 8.3 with extensions: `pdo_mysql`, `mbstring`, `openssl`, `gd`, `zip`
- Composer >= 2.6
- MySQL >= 8.0

### Step-by-Step Installation

```bash
# 1. Install PHP dependencies
composer install

# 2. Copy environment file
cp .env.example .env

# 3. Generate application encryption key
php artisan key:generate

# 4. Create and configure MySQL database
# In MySQL: CREATE DATABASE resumenova CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
# Update DB_* credentials in .env

# 5. Run migrations & seed database
php artisan migrate --seed

# 6. Start the local API server
php artisan serve --port=8000
```

---

## 📂 Backend Architecture

```text
backend/
├── app/
│   ├── Actions/              # Isolated, single-purpose action classes
│   ├── Contracts/            # Interface contracts & repository abstractions
│   ├── DTOs/                 # Data Transfer Objects
│   ├── Enums/                # PHP 8.1+ backed enums (UserRole, ExportStatus, etc.)
│   ├── Events/               # Domain event dispatches
│   ├── Helpers/              # Global helpers (helpers.php)
│   ├── Http/
│   │   ├── Controllers/      # Feature API & Admin Controllers
│   │   ├── Middleware/       # ActiveUser, AdminRole, Sanctum middleware
│   │   └── Requests/         # Form validation requests
│   ├── Jobs/                 # Background queue worker jobs
│   ├── Models/               # Eloquent Models (User, Resume, ApiKey, etc.)
│   ├── Notifications/        # In-app notification triggers
│   ├── Policies/             # Authorization policies & RBAC gates
│   ├── Repositories/         # Data access repository layer
│   └── Services/             # Domain business logic & Groq AI Failover engine
│
├── config/                   # AI, Queue, Sanctum, and App configs
├── database/
│   ├── migrations/           # 25 Schema migrations
│   └── seeders/              # Initial seeders for testing & demo accounts
├── routes/
│   ├── api.php               # Protected REST API endpoints
│   └── web.php               # Web routes & asset delivery
└── tests/                    # PestPHP automated test suite
```

---

## ⚡ Core Subsystems

### 1. Groq AI Multi-Key Failover Pipeline

- **Priority Routing**: Distributes AI workloads based on user-configured key rankings.
- **Rate-Limit Failover (`429`)**: Seamlessly shifts to next available key during quota or throughput limits.
- **Cooldown Window Tracking**: Tracks when rate-limited keys can safely re-enter the pool.
- **State Checkpoints**: Mid-stream generation checkpoints stored in `ai_checkpoints`.

### 2. Dual-Layer ATS Analyzer

- **Deterministic Evaluation**: Validates structural compliance, contact information, section completeness, and keyword frequencies.
- **Semantic LLM Analysis**: Compares candidate profile against target job description to produce gap analysis, role matching percentage, and actionable recommendations.

### 3. Document Compilation Engine

- **PDF Generation**: HTML-to-PDF compilation via `barryvdh/laravel-dompdf`.
- **Word (`.docx`) Generation**: Native document styling via `phpoffice/phpword`.

---

## 🧪 Testing

```bash
# Run complete PestPHP test suite (111 tests / 384 assertions)
php artisan test

# Run tests with filter
php artisan test --filter=AI
php artisan test --filter=Auth
php artisan test --filter=Export
```

---

## 📖 Operational Documentation

For server configurations, Nginx setups, and deployment procedures, see the root documentation directory:

- [Production Deployment Guide](../docs/PRODUCTION_DEPLOYMENT_GUIDE.md)
- [Production Environment Reference](../docs/PRODUCTION_ENVIRONMENT_REFERENCE.md)
- [Backup & Restore Runbook](../docs/BACKUP_AND_RESTORE_RUNBOOK.md)
- [Incident Response Runbook](../docs/INCIDENT_RESPONSE_RUNBOOK.md)
