# ResumeNova

# Product Requirements Document (PRD)

Version: 1.0

Project Name: ResumeNova

Product Type: AI-Powered Resume Builder & Career Optimization Platform

Prepared For: University Final Project

Prepared By: ResumeNova Product Team

---

# 1. Executive Summary

ResumeNova is a modern AI-powered career document platform that enables users to create professional resumes, optimize resumes for Applicant Tracking Systems (ATS), generate cover letters, prepare for interviews, and export documents in multiple formats.

The platform leverages Groq-powered AI models while allowing users to bring and manage their own API keys. A unique API failover mechanism ensures uninterrupted AI generation by automatically switching to backup API keys without restarting the generation process.

ResumeNova aims to simplify professional document creation while helping job seekers improve hiring outcomes through intelligent AI-assisted career tools.

---

# 2. Product Vision

To become a comprehensive AI-powered career development platform that helps students, fresh graduates, and professionals create stronger resumes, improve ATS performance, and prepare effectively for employment opportunities.

---

# 3. Problem Statement

Many job seekers face difficulties creating professional resumes because:

* They lack resume writing knowledge.
* They are unfamiliar with ATS requirements.
* Resume formatting consumes time.
* Cover letters require repetitive effort.
* Career documentation is often inconsistent.
* Existing solutions are expensive or overly complex.

ResumeNova addresses these problems through AI-assisted automation and structured workflows.

---

# 4. Business Objectives

## Primary Objectives

* Enable professional resume creation.
* Improve ATS compatibility.
* Simplify cover letter generation.
* Provide interview preparation assistance.
* Support bilingual resume creation.

---

## Secondary Objectives

* Build a scalable SaaS-ready platform.
* Enable future monetization.
* Support multiple AI providers.
* Expand into a full career management ecosystem.

---

# 5. Product Goals

## Goal 1

Reduce resume creation time by at least 70%.

---

## Goal 2

Improve ATS compatibility for generated resumes.

---

## Goal 3

Provide export-ready documents without manual formatting.

---

## Goal 4

Support both English and Bangla career documents.

---

## Goal 5

Provide uninterrupted AI generation through API failover.

---

# 6. Target Audience

## Primary Audience

University Students

Characteristics:

* Final-year students
* Internship seekers
* Fresh graduates

---

## Secondary Audience

Entry-Level Professionals

Characteristics:

* 0–5 years experience
* Career switchers
* Job seekers

---

## Tertiary Audience

Experienced Professionals

Characteristics:

* Mid-level professionals
* Senior professionals
* Management applicants

---

# 7. User Personas

## Persona 1

### Name

Rahim Hasan

### Age

23

### Occupation

CSE Student

### Goal

Create internship-ready resume.

### Pain Points

* No resume writing experience
* No ATS knowledge

---

## Persona 2

### Name

Nusrat Jahan

### Age

28

### Occupation

Software Engineer

### Goal

Switch companies.

### Pain Points

* Resume outdated
* Needs ATS optimization

---

## Persona 3

### Name

Mahmud Alam

### Age

35

### Occupation

Project Manager

### Goal

Apply for leadership roles.

### Pain Points

* Needs executive-level resume
* Requires tailored cover letters

---

# 8. User Journey

## Journey 1

New User Resume Creation

Landing Page

↓

Register

↓

Dashboard

↓

Add API Key

↓

Create Resume

↓

Choose Builder Method

↓

Generate Resume

↓

Review

↓

Export

---

## Journey 2

ATS Analysis

Dashboard

↓

Select Resume

↓

Paste Job Description

↓

Analyze

↓

Receive ATS Report

↓

Improve Resume

---

## Journey 3

Cover Letter Generation

Dashboard

↓

Select Resume

↓

Paste Job Description

↓

Generate Cover Letter

↓

Review

↓

Export

---

# 9. Feature Prioritization

## Must Have

Authentication

Google Login

User Dashboard

Resume Builder

AI Resume Generator

Groq Integration

API Key Management

Resume Templates

ATS Analysis

Cover Letter Generator

PDF Export

DOCX Export

Admin Dashboard

Role Management

Resume Versioning

Audit Logs

---

## Should Have

Interview Question Generator

Resume Comparison

Generation History

Analytics Dashboard

Notification Center

---

## Could Have

LinkedIn Import

Portfolio Generator

Resume Sharing

Public Resume Links

AI Career Advisor

---

## Won't Have (Version 1)

Job Marketplace

Recruiter Portal

Video Resume

Mobile App

Enterprise Plans

---

# 10. Functional Requirements

## FR-01

User Registration

Users must register using:

* Email
* Password

---

## FR-02

Google Authentication

Users must be able to login with Google.

---

## FR-03

Resume Creation

Users must create multiple resumes.

---

## FR-04

Resume Generation

AI must generate:

* Summary
* Experience
* Skills
* Projects

---

## FR-05

ATS Analysis

System must evaluate resumes against job descriptions.

---

## FR-06

Cover Letter Generation

System must generate personalized cover letters.

---

## FR-07

Resume Versioning

System must store historical resume versions.

---

## FR-08

Export

System must export:

* PDF
* DOCX

---

## FR-09

API Key Failover

System must switch API keys automatically.

---

## FR-10

Role Management

Admins must manage user roles.

---

# 11. Non-Functional Requirements

## Performance

Dashboard < 2 seconds

Resume Generation < 15 seconds

---

## Reliability

99% uptime target

---

## Scalability

Support:

* Initial 1,000 users
* Future 10,000+ users

---

## Security

Encrypted API Keys

Secure Authentication

CSRF Protection

Audit Logging

Role-Based Access Control

---

# 12. Competitive Analysis

## Resume.io

Advantages:

* Large template library

Weaknesses:

* Limited AI functionality

---

## Kickresume

Advantages:

* Strong AI generation

Weaknesses:

* Limited ATS insights

---

## Enhancv

Advantages:

* Attractive designs

Weaknesses:

* Complex user flow

---

# ResumeNova Competitive Advantage

User-Owned API Infrastructure

API Failover System

English + Bangla Support

Resume Versioning

Integrated ATS Analysis

Interview Preparation

---

# 13. Unique Selling Propositions

## USP 1

Multiple Groq API Key Management

---

## USP 2

Automatic Failover Recovery

---

## USP 3

English and Bangla Resume Generation

---

## USP 4

Integrated ATS Optimization

---

## USP 5

AI Interview Preparation

---

# 14. Success Metrics

## Product Metrics

Total Users

Active Users

Generated Resumes

Generated Cover Letters

Generated ATS Reports

Exports

---

## Performance Metrics

Average Generation Time

API Failover Success Rate

Export Success Rate

System Uptime

---

## Engagement Metrics

Monthly Active Users

Resume Updates

Version Usage

Dashboard Usage

---

# 15. Acceptance Criteria

Authentication works.

Google Login works.

Resume generation works.

ATS analysis works.

Cover letter generation works.

PDF export works.

DOCX export works.

Role management works.

API failover works.

Audit logs work.

All dashboards work.

---

# 16. MVP Scope

Version 1.0

Authentication

Google Login

Profile Management

Resume Builder

AI Generation

API Key Management

Resume Templates

ATS Analysis

Cover Letters

PDF Export

DOCX Export

Admin Portal

Analytics

Role Management

---

# 17. Future Roadmap

## Phase 2

LinkedIn Import

Portfolio Generator

Advanced ATS Analysis

Resume Sharing

---

## Phase 3

AI Career Advisor

Job Matching

Career Roadmaps

Skill Gap Analysis

---

## Phase 4

Recruiter Portal

Enterprise Accounts

Team Workspaces

Subscription Billing

---

# 18. Project Success Definition

ResumeNova will be considered successful when users can:

* Create professional resumes quickly.
* Generate ATS-optimized content.
* Produce tailored cover letters.
* Export professional documents.
* Use uninterrupted AI generation through API failover.
* Successfully prepare for job applications using AI-powered assistance.

---

# End of Product Requirements Document
