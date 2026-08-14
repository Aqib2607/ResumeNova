# ResumeNova

# Database Architecture Document (DAD)

Version: 1.0

Database Engine: MySQL 8+

Framework: Laravel 12

Related Documents:

* 01_Requirements_Architecture_Document.md
* 02_Functional_Specification_Document.md

---

# 1. Database Architecture Overview

ResumeNova follows a modular relational database architecture designed for:

* Multi-user support
* Role-based access control
* Resume versioning
* AI request tracking
* API failover management
* ATS analysis storage
* Cover letter generation
* Audit logging
* Future SaaS scalability

Database Design Principles:

* Normalized schema
* Soft delete support
* Audit-ready architecture
* Minimal data duplication
* Future multi-tenant compatibility

---

# 2. Core Entity Relationship Overview

```text
Users
 ├── Profiles
 ├── API Keys
 ├── Resumes
 │     ├── Resume Versions
 │     ├── Resume Education
 │     ├── Resume Experience
 │     ├── Resume Skills
 │     ├── Resume Projects
 │     ├── Resume Certifications
 │     ├── Resume Languages
 │     └── Resume References
 │
 ├── ATS Analyses
 ├── Cover Letters
 ├── Interview Sessions
 ├── Exports
 └── Audit Logs

Roles
 └── User Roles

Templates
 ├── Template Categories
 └── Template Versions
```

---

# 3. RBAC Structure

## roles

| Field       | Type        |
| ----------- | ----------- |
| id          | bigint      |
| name        | varchar(50) |
| slug        | varchar(50) |
| description | text        |
| created_at  | timestamp   |
| updated_at  | timestamp   |

---

## Initial Roles

```text
SUPER_ADMIN
ADMIN
USER
```

---

## user_roles

| Field       | Type      |
| ----------- | --------- |
| id          | bigint    |
| user_id     | bigint    |
| role_id     | bigint    |
| assigned_by | bigint    |
| created_at  | timestamp |

---

# 4. Users Module

## users

| Field             | Type         |
| ----------------- | ------------ |
| id                | bigint       |
| uuid              | char(36)     |
| name              | varchar(150) |
| email             | varchar(255) |
| password          | varchar(255) |
| google_id         | varchar(255) |
| email_verified_at | timestamp    |
| status            | enum         |
| last_login_at     | datetime     |
| created_at        | timestamp    |
| updated_at        | timestamp    |
| deleted_at        | timestamp    |

---

## User Status

```text
ACTIVE
SUSPENDED
PENDING
DELETED
```

---

# 5. User Profiles

## profiles

| Field              | Type         |
| ------------------ | ------------ |
| id                 | bigint       |
| user_id            | bigint       |
| phone              | varchar(30)  |
| address            | text         |
| country            | varchar(100) |
| linkedin_url       | varchar(500) |
| website_url        | varchar(500) |
| portfolio_url      | varchar(500) |
| profile_image      | varchar(255) |
| preferred_language | varchar(10)  |
| created_at         | timestamp    |
| updated_at         | timestamp    |

---

# 6. API Key Infrastructure

## api_keys

Stores encrypted Groq API keys.

| Field          | Type         |
| -------------- | ------------ |
| id             | bigint       |
| user_id        | bigint       |
| provider       | varchar(50)  |
| key_name       | varchar(100) |
| encrypted_key  | longtext     |
| priority_order | integer      |
| is_active      | boolean      |
| usage_count    | bigint       |
| failure_count  | bigint       |
| last_used_at   | datetime     |
| created_at     | timestamp    |
| updated_at     | timestamp    |

---

## Provider Values

```text
GROQ
```

Future:

```text
OPENAI
GEMINI
CLAUDE
```

---

# 7. API Failover Tracking

## api_generation_sessions

Tracks generation continuation.

| Field               | Type        |
| ------------------- | ----------- |
| id                  | bigint      |
| user_id             | bigint      |
| session_type        | varchar(50) |
| current_api_key_id  | bigint      |
| status              | varchar(50) |
| checkpoint_data     | longtext    |
| progress_percentage | integer     |
| created_at          | timestamp   |
| updated_at          | timestamp   |

---

## api_failover_logs

| Field               | Type      |
| ------------------- | --------- |
| id                  | bigint    |
| session_id          | bigint    |
| failed_api_key_id   | bigint    |
| switched_api_key_id | bigint    |
| failure_reason      | text      |
| created_at          | timestamp |

---

# 8. Resume Core Structure

## resumes

| Field             | Type         |
| ----------------- | ------------ |
| id                | bigint       |
| user_id           | bigint       |
| title             | varchar(255) |
| template_id       | bigint       |
| language          | varchar(10)  |
| current_version   | integer      |
| status            | varchar(50)  |
| generated_summary | longtext     |
| created_at        | timestamp    |
| updated_at        | timestamp    |
| deleted_at        | timestamp    |

---

## Resume Status

```text
DRAFT
GENERATING
COMPLETED
PUBLISHED
ARCHIVED
```

---

# 9. Resume Versions

## resume_versions

| Field          | Type      |
| -------------- | --------- |
| id             | bigint    |
| resume_id      | bigint    |
| version_number | integer   |
| snapshot_json  | longtext  |
| change_notes   | text      |
| created_at     | timestamp |

---

# 10. Resume Personal Information

## resume_personal_details

| Field         | Type         |
| ------------- | ------------ |
| id            | bigint       |
| resume_id     | bigint       |
| full_name     | varchar(255) |
| email         | varchar(255) |
| phone         | varchar(50)  |
| address       | text         |
| linkedin_url  | varchar(500) |
| website_url   | varchar(500) |
| portfolio_url | varchar(500) |

---

# 11. Resume Education

## resume_educations

| Field          | Type         |
| -------------- | ------------ |
| id             | bigint       |
| resume_id      | bigint       |
| institution    | varchar(255) |
| degree         | varchar(255) |
| field_of_study | varchar(255) |
| start_date     | date         |
| end_date       | date         |
| result         | varchar(50)  |
| description    | text         |

---

# 12. Resume Experience

## resume_experiences

| Field             | Type         |
| ----------------- | ------------ |
| id                | bigint       |
| resume_id         | bigint       |
| company_name      | varchar(255) |
| job_title         | varchar(255) |
| start_date        | date         |
| end_date          | date         |
| currently_working | boolean      |
| description       | longtext     |

---

# 13. Resume Skills

## resume_skills

| Field       | Type         |
| ----------- | ------------ |
| id          | bigint       |
| resume_id   | bigint       |
| skill_name  | varchar(255) |
| skill_level | varchar(50)  |

---

# 14. Resume Projects

## resume_projects

| Field        | Type         |
| ------------ | ------------ |
| id           | bigint       |
| resume_id    | bigint       |
| project_name | varchar(255) |
| project_url  | varchar(500) |
| description  | longtext     |

---

# 15. Resume Certifications

## resume_certifications

| Field                | Type         |
| -------------------- | ------------ |
| id                   | bigint       |
| resume_id            | bigint       |
| certification_name   | varchar(255) |
| issuing_organization | varchar(255) |
| issue_date           | date         |

---

# 16. Resume Languages

## resume_languages

| Field             | Type         |
| ----------------- | ------------ |
| id                | bigint       |
| resume_id         | bigint       |
| language_name     | varchar(100) |
| proficiency_level | varchar(50)  |

---

# 17. Resume References

## resume_references

| Field          | Type         |
| -------------- | ------------ |
| id             | bigint       |
| resume_id      | bigint       |
| reference_name | varchar(255) |
| designation    | varchar(255) |
| company        | varchar(255) |
| contact_info   | varchar(255) |

---

# 18. ATS Analysis Module

## ats_analyses

| Field            | Type      |
| ---------------- | --------- |
| id               | bigint    |
| user_id          | bigint    |
| resume_id        | bigint    |
| ats_score        | integer   |
| missing_keywords | longtext  |
| missing_skills   | longtext  |
| recommendations  | longtext  |
| created_at       | timestamp |

---

## ats_analysis_reports

Stores detailed results.

| Field       | Type     |
| ----------- | -------- |
| id          | bigint   |
| analysis_id | bigint   |
| report_json | longtext |

---

# 19. Cover Letter Module

## cover_letters

| Field      | Type         |
| ---------- | ------------ |
| id         | bigint       |
| user_id    | bigint       |
| resume_id  | bigint       |
| language   | varchar(10)  |
| title      | varchar(255) |
| content    | longtext     |
| created_at | timestamp    |

---

# 20. Interview Preparation Module

## interview_sessions

| Field           | Type        |
| --------------- | ----------- |
| id              | bigint      |
| user_id         | bigint      |
| resume_id       | bigint      |
| job_description | longtext    |
| language        | varchar(10) |
| created_at      | timestamp   |

---

## interview_questions

| Field         | Type        |
| ------------- | ----------- |
| id            | bigint      |
| session_id    | bigint      |
| question_type | varchar(50) |
| question_text | longtext    |

---

# 21. Export Module

## exports

| Field       | Type         |
| ----------- | ------------ |
| id          | bigint       |
| user_id     | bigint       |
| resume_id   | bigint       |
| export_type | varchar(20)  |
| file_path   | varchar(500) |
| created_at  | timestamp    |

---

## Export Types

```text
PDF
DOCX
```

---

# 22. Template Management

## templates

| Field         | Type         |
| ------------- | ------------ |
| id            | bigint       |
| name          | varchar(255) |
| category_id   | bigint       |
| preview_image | varchar(255) |
| blade_view    | varchar(255) |
| status        | varchar(50)  |
| created_at    | timestamp    |

---

## template_categories

| Field | Type         |
| ----- | ------------ |
| id    | bigint       |
| name  | varchar(100) |

---

## template_versions

| Field          | Type    |
| -------------- | ------- |
| id             | bigint  |
| template_id    | bigint  |
| version_number | integer |
| change_log     | text    |

---

# 23. Notifications

## notifications

| Field      | Type         |
| ---------- | ------------ |
| id         | bigint       |
| user_id    | bigint       |
| type       | varchar(50)  |
| title      | varchar(255) |
| message    | text         |
| is_read    | boolean      |
| created_at | timestamp    |

---

# 24. Audit Logs

## audit_logs

| Field       | Type         |
| ----------- | ------------ |
| id          | bigint       |
| user_id     | bigint       |
| module_name | varchar(100) |
| action      | varchar(100) |
| old_value   | longtext     |
| new_value   | longtext     |
| ip_address  | varchar(50)  |
| user_agent  | text         |
| created_at  | timestamp    |

---

# 25. System Logs

## system_logs

| Field      | Type         |
| ---------- | ------------ |
| id         | bigint       |
| severity   | varchar(20)  |
| module     | varchar(100) |
| message    | longtext     |
| created_at | timestamp    |

---

# 26. Analytics Tables

## analytics_daily

| Field                   | Type    |
| ----------------------- | ------- |
| id                      | bigint  |
| total_users             | integer |
| resumes_generated       | integer |
| ats_reports_generated   | integer |
| cover_letters_generated | integer |
| exports_generated       | integer |
| ai_requests             | integer |
| created_date            | date    |

---

# 27. Indexing Strategy

High Priority Indexes:

users.email

users.uuid

api_keys.user_id

api_keys.priority_order

resumes.user_id

resume_versions.resume_id

ats_analyses.resume_id

cover_letters.user_id

audit_logs.user_id

analytics_daily.created_date

---

# 28. Soft Delete Strategy

Soft Deletes Enabled:

users

resumes

templates

profiles

Benefits:

* Recovery capability
* Audit compliance
* Historical analytics

---

# 29. Data Retention Policy

Audit Logs:

5 years

System Logs:

2 years

Resume Versions:

Unlimited

ATS Reports:

Unlimited

Exports:

365 days

---

# 30. Future Scalability Strategy

Phase 1

Single MySQL Database

< 1,000 Users

---

Phase 2

Read Replicas

Redis Cache

Queue Workers

---

Phase 3

Database Sharding

Object Storage

Microservice AI Layer

---

# End of Database Architecture Document
