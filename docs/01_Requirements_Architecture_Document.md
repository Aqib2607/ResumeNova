# ResumeNova

# Requirements Architecture Document (RAD)

Version: 1.0

Project Type: AI-Powered Resume Builder Platform

Project Name: ResumeNova

Technology Stack:

- Laravel 12
- Blade Templates
- MySQL
- Groq API
- Google OAuth
- Bootstrap/Tailwind (Finalized in Design Document)
- PDF Export
- DOCX Export

---

# 1. System Overview

ResumeNova is a web-based AI-powered career document generation platform that enables users to create, optimize, analyze, and export professional resumes using advanced AI models provided through Groq.

The platform supports multilingual resume generation (English and Bangla), ATS optimization, cover letter generation, interview preparation, resume versioning, and AI-assisted career enhancement.

The system uses a unique user-managed API architecture where users can register multiple Groq API keys and define a priority order. If an API key reaches usage limitations, the system automatically switches to the next available key while preserving generation progress.

The platform consists of:

- Public Website
- Authentication System
- User Portal
- Resume Builder
- ATS Analysis Engine
- Cover Letter Generator
- Interview Preparation Module
- Resume Versioning System
- API Key Management System
- Administration Portal
- Analytics Dashboard

---

# 2. Business Goals

Primary Goals:

- Simplify professional resume creation
- Reduce resume writing effort using AI
- Improve ATS compatibility
- Support bilingual resume generation
- Enable self-managed AI usage through user-owned API keys
- Provide a complete career document ecosystem

Secondary Goals:

- Support future SaaS monetization
- Support enterprise scalability
- Support additional AI providers in future releases

---

# 3. User Roles

## 3.1 Guest

Permissions:

- Access landing page
- View feature information
- Register account
- Login account

Restrictions:

- Cannot access dashboard
- Cannot generate resumes
- Cannot use AI features

---

## 3.2 User

Permissions:

- Manage profile
- Create resumes
- Generate AI content
- Upload API keys
- Manage API priority
- Generate cover letters
- Run ATS analysis
- Export PDF
- Export DOCX
- Manage resume versions
- Generate interview questions

Restrictions:

- Cannot access administration modules

---

## 3.3 Admin

Permissions:

- View all users
- Edit users
- Change user roles
- Suspend users
- Reactivate users
- Manage templates
- View analytics
- View system logs
- Monitor AI usage

Restrictions:

- Cannot modify Super Admin

---

## 3.4 Super Admin

Permissions:

- Full system access
- Full role management
- Full template management
- Full configuration management
- Full analytics access

---

# 4. System Modules

## Module 1: Landing Website

Purpose:

Public marketing website.

Features:

- Hero section
- Features section
- Resume templates showcase
- ATS optimization showcase
- Cover letter showcase
- Testimonials
- FAQ
- Login/Register CTA
- Footer

Architecture:

Single-page landing page.

---

## Module 2: Authentication System

Features:

- Registration
- Login
- Logout
- Password Reset
- Google OAuth Login
- Session Management

Authentication Methods:

- Email + Password
- Google Login

---

## Module 3: User Profile Management

Profile Data:

- Full Name
- Email
- Phone
- Address
- Country
- LinkedIn
- Portfolio
- Website
- Profile Picture

Features:

- Edit Profile
- Change Password
- Manage Preferences

---

## Module 4: API Key Management

Purpose:

Allow users to use their own Groq API keys.

Features:

- Add API Key
- Edit API Key
- Delete API Key
- Prioritize API Keys
- Enable/Disable API Keys

Security Requirements:

- AES Encryption
- Hidden Display
- Partial Reveal
- Secure Storage

Example:

gsk_xxxxxxxxxxxxxAB12

---

## Module 5: Resume Builder

Purpose:

Resume creation and management.

Creation Modes:

### Mode A

Manual Builder

Steps:

1 Personal Information
2 Education
3 Experience
4 Skills
5 Projects
6 Certifications
7 Languages
8 References

### Mode B

AI Interview Builder

AI asks structured questions.

System generates content progressively.

---

## Module 6: Resume Templates

Initial Templates:

### Template 1

Modern Professional

### Template 2

Corporate Executive

### Template 3

Minimal ATS

### Template 4

Creative Professional

Features:

- Live Preview
- Template Switching
- Dynamic Styling

---

## Module 7: AI Resume Generator

Purpose:

Generate professional content.

Functions:

- Professional Summary
- Experience Enhancement
- Skills Optimization
- Project Description Creation
- Career Objective Generation

Languages:

- English
- Bangla

---

## Module 8: Resume Versioning

Features:

- Save Version
- Restore Version
- Duplicate Version
- Compare Versions

Version Naming:

Resume v1
Resume v2
Resume v3

---

## Module 9: ATS Analysis Engine

Inputs:

- Resume
- Job Description

Outputs:

- ATS Score
- Missing Keywords
- Missing Skills
- Formatting Suggestions
- AI Recommendations

Architecture:

Hybrid

- Rule-based engine
- AI-enhanced analysis

---

## Module 10: Cover Letter Generator

Inputs:

- Resume
- Job Description

Outputs:

- Professional Cover Letter
- Tailored Cover Letter
- Industry Specific Cover Letter

Languages:

- English
- Bangla

---

## Module 11: Interview Preparation Module

Features:

Generate:

- HR Questions
- Technical Questions
- Behavioral Questions

Based On:

- Resume
- Job Description

---

## Module 12: Export Engine

Formats:

### PDF

Professional formatting

### DOCX

Editable format

Libraries:

- DomPDF
- PHPWord

---

## Module 13: Dashboard

Features:

- Recent Resumes
- ATS Scores
- Cover Letters
- API Key Status
- Resume Analytics
- Export History

---

## Module 14: Admin Portal

Features:

- User Management
- Role Management
- Resume Statistics
- AI Usage Monitoring
- Template Management
- Platform Analytics

---

# 5. API Failover Architecture

Unique Core Requirement

Users may store multiple Groq API keys.

Example:

Priority 1 → Key A
Priority 2 → Key B
Priority 3 → Key C

Execution Logic:

If Key A returns:

- Quota Exceeded
- Rate Limited
- Invalid

System automatically switches to Key B.

Generation must continue from the last successful chunk.

The system must NOT restart the generation process.

Requirements:

- Chunk-based generation
- Progress checkpointing
- Response stitching
- Automatic retry mechanism

---

# 6. Reporting Requirements

User Reports:

- Generated Resumes
- ATS Reports
- Cover Letter History
- API Usage History

Admin Reports:

- Total Users
- Active Users
- Daily Registrations
- AI Requests
- Export Statistics
- Template Usage
- ATS Analysis Counts

---

# 7. Security Model

Authentication:

- Laravel Sanctum
- CSRF Protection

Data Security:

- Encrypted API Keys
- Secure Password Hashing
- Session Protection

Input Protection:

- XSS Protection
- SQL Injection Protection
- Prompt Injection Filtering

Audit Logging:

- Login Events
- Role Changes
- API Key Changes
- Resume Deletions

---

# 8. Compliance Requirements

Data Protection:

- User-owned API Keys
- Secure Storage
- Exportable User Data

Privacy:

- No API key exposure
- No plaintext credential storage

---

# 9. Non-Functional Requirements

Performance:

- Dashboard Load < 2 Seconds
- Resume Generation < 15 Seconds

Availability:

- 99% uptime target

Scalability:

- Initial Target:
  Under 1,000 users

Future Target:
10,000+ users

Maintainability:

- Modular Laravel Architecture
- Service Layer Pattern
- Repository Pattern

---

# 10. Developer Deliverables

Backend:

- Laravel Project
- MySQL Database
- API Integration Layer

Frontend:

- Blade Templates
- Responsive Dashboard
- Resume Preview System

Administration:

- RBAC System
- Analytics Dashboard

Documentation:

- Functional Specification
- Database Architecture
- PRD
- Design Document
- Tech Stack Document

---

# End of Requirements Architecture Document
