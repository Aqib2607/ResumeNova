# ResumeNova

# Technical Architecture & Tech Stack Document

Version: 1.0

Project Name: ResumeNova

Platform Type: AI-Powered Resume Builder Platform

Architecture Type: Monolithic Modular Architecture

Deployment Model: Web Application

Target Scale:

- Initial: < 1,000 Users
- Future: 10,000+ Users

Related Documents:

- 01_Requirements_Architecture_Document.md
- 02_Functional_Specification_Document.md
- 03_Database_Architecture_Document.md
- 04_PRD_Product_Requirements_Document.md
- 05_Design_Document.md

---

# 1. Technology Stack Overview

## Frontend

Framework:

Laravel Blade

---

Styling:

Tailwind CSS

---

Components:

Blade Components

---

JavaScript:

Alpine.js

---

Icons:

Lucide Icons

---

Notifications:

SweetAlert2

---

Tables:

DataTables

---

Charts:

ApexCharts

---

# 2. Backend Stack

Framework:

Laravel 12

---

Language:

PHP 8.3+

---

Architecture Pattern:

Service Layer Architecture

---

Design Patterns:

Repository Pattern

Dependency Injection

Factory Pattern

Strategy Pattern

Observer Pattern

---

# 3. Database

Database Engine:

MySQL 8+

---

ORM:

Laravel Eloquent

---

Migration System:

Laravel Migrations

---

Seeder System:

Laravel Seeders

---

# 4. Authentication Architecture

Authentication Provider:

Laravel Authentication

---

Login Methods:

Email + Password

Google OAuth

---

OAuth Package:

Laravel Socialite

---

Authorization:

RBAC

Role-Based Access Control

---

Roles:

SUPER_ADMIN

ADMIN

USER

---

# 5. AI Infrastructure

Provider:

Groq

---

Integration Method:

REST API

---

Supported Models

Resume Generation:

Qwen3 32B

---

ATS Analysis:

DeepSeek R1 Distill

---

Cover Letters:

Qwen3 32B

---

Interview Questions:

Llama 4 Scout

---

# 6. AI Service Architecture

```text
User Request
      ↓
AI Controller
      ↓
AI Service
      ↓
Provider Manager
      ↓
API Failover Engine
      ↓
Groq API
      ↓
Response Parser
      ↓
Result Storage
```

---

# 7. API Failover Engine

Core Innovation

ResumeNova supports multiple API keys per user.

---

## Workflow

```text
Request
   ↓
Priority Key 1
   ↓
Success?
   ↓
No
   ↓
Checkpoint Save
   ↓
Priority Key 2
   ↓
Continue
```

---

## Components

APIKeyManager

APIHealthMonitor

CheckpointManager

ResponseMerger

RetryHandler

---

## Responsibilities

Monitor API failures

Track quota errors

Handle rate limits

Switch providers

Preserve generation progress

Merge AI responses

---

# 8. AI Prompt Architecture

Prompt Types

Resume Summary

Experience Enhancement

Skill Optimization

ATS Analysis

Cover Letter Generation

Interview Questions

---

## Prompt Storage

Database-driven

Table:

prompt_templates

Future-ready

---

# 9. Resume Generation Architecture

```text
Resume Input
      ↓
Prompt Builder
      ↓
Groq Request
      ↓
AI Response
      ↓
Content Validator
      ↓
Resume Renderer
      ↓
Version Storage
```

---

# 10. ATS Engine Architecture

Hybrid Model

---

Layer 1

Rule-Based Analysis

Checks:

Keyword Density

Formatting

Section Completeness

Resume Length

---

Layer 2

AI Analysis

Checks:

Skill Matching

Experience Relevance

Context Understanding

Improvement Suggestions

---

Layer 3

Result Aggregation

Final Score

Recommendations

---

# 11. Cover Letter Engine

Inputs:

Resume

Job Description

Language

---

Outputs:

Professional Letter

Tailored Letter

ATS-Friendly Letter

---

Architecture

```text
Resume
   ↓
Prompt Builder
   ↓
Groq
   ↓
Formatter
   ↓
Storage
```

---

# 12. Interview Preparation Engine

Inputs:

Resume

Job Description

---

Outputs:

HR Questions

Technical Questions

Behavioral Questions

---

Storage:

interview_sessions

interview_questions

---

# 13. Export Architecture

## PDF

Library:

DomPDF

---

Flow:

```text
Resume
 ↓
Blade Template
 ↓
HTML
 ↓
PDF
 ↓
Download
```

---

## DOCX

Library:

PHPWord

---

Flow:

```text
Resume
 ↓
Template Renderer
 ↓
PHPWord
 ↓
DOCX
 ↓
Download
```

---

# 14. File Storage Architecture

Storage Driver:

Local Storage

---

Directory Structure

```text
storage/app/

resumes/
exports/
profile-images/
templates/
logs/
```

---

Future:

Amazon S3

Cloudflare R2

MinIO

---

# 15. Notification Architecture

Channels:

Database

Email

---

Events

Resume Generated

Export Completed

ATS Completed

API Failure

Role Updated

---

# 16. Queue Architecture

Queue Driver:

Database Queue

---

Future:

Redis Queue

---

Queue Jobs

Generate Resume

Generate Cover Letter

ATS Analysis

Export PDF

Export DOCX

Send Email

Generate Interview Questions

---

# 17. Logging Architecture

Laravel Log System

---

Log Channels

Application Logs

AI Logs

Security Logs

Audit Logs

System Logs

---

# 18. Security Architecture

## Data Encryption

API Keys

Encrypted

AES-256

---

Passwords

bcrypt

---

Sessions

Secure Cookies

---

# Security Controls

CSRF Protection

XSS Protection

SQL Injection Protection

Rate Limiting

Prompt Injection Filtering

Input Validation

Role Validation

---

# 19. Audit System

Tracks

Login

Logout

Resume Creation

Resume Deletion

API Changes

Role Changes

Template Changes

Admin Actions

---

# 20. Analytics Architecture

Metrics

Users

Resumes

Exports

ATS Reports

Cover Letters

AI Requests

API Failures

---

Visualization

ApexCharts

---

# 21. Laravel Module Structure

```text
app/

Actions/

Console/

Events/

Exceptions/

Http/

Models/

Observers/

Policies/

Repositories/

Rules/

Services/

Traits/

Jobs/

Listeners/

Notifications/
```

---

# 22. Service Layer Structure

```text
Services/

Auth/

Resume/

ATS/

CoverLetter/

Interview/

Export/

AI/

Analytics/

Template/

Admin/
```

---

# 23. Repository Layer Structure

```text
Repositories/

UserRepository

ResumeRepository

ATSRepository

CoverLetterRepository

APIKeyRepository

AnalyticsRepository
```

---

# 24. Controller Structure

```text
Controllers/

Auth/

User/

Admin/

Resume/

ATS/

CoverLetter/

Interview/

Export/
```

---

# 25. Blade Structure

```text
resources/views/

layouts/

components/

landing/

auth/

dashboard/

resume/

ats/

coverletter/

interview/

admin/
```

---

# 26. Environment Variables

```env
APP_NAME=ResumeNova

APP_ENV=production

APP_DEBUG=false

APP_URL=

DB_CONNECTION=mysql
DB_HOST=
DB_PORT=
DB_DATABASE=
DB_USERNAME=
DB_PASSWORD=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=

QUEUE_CONNECTION=database

MAIL_MAILER=smtp

MAIL_HOST=
MAIL_PORT=
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_ENCRYPTION=tls

FILESYSTEM_DISK=local
```

---

# 27. CI/CD Strategy

Version Control:

Git

---

Repository:

GitHub

---

Branch Strategy

main

develop

feature/*

hotfix/*

---

Deployment

GitHub Actions

Future Enhancement

---

# 28. Production Infrastructure

Phase 1

Single VPS

---

Recommended Specs

4 CPU

8 GB RAM

100 GB SSD

---

Stack

Ubuntu 24.04

Nginx

PHP 8.3

MySQL 8

Supervisor

Laravel Scheduler

---

# 29. Backup Strategy

Database Backup

Daily

---

File Backup

Daily

---

Retention

30 Days

---

# 30. Future Scalability Roadmap

Phase 2

Redis

Horizon

Queue Workers

---

Phase 3

S3 Storage

Load Balancer

CDN

---

Phase 4

Multi-AI Provider Support

OpenAI

Claude

Gemini

Groq

---

# 31. Technical Success Criteria

All modules operational

AI generation functional

API failover functional

ATS analysis functional

PDF export functional

DOCX export functional

Admin portal functional

Role management functional

Analytics functional

Audit logging functional

Responsive UI functional

Production deployment ready

---

# End of Technical Architecture & Tech Stack Document
