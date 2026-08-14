# ResumeNova

# Functional Specification Document (FSD)

Version: 1.0

Project Type: AI-Powered Resume Builder Platform

Related Document:
01_Requirements_Architecture_Document.md

---

# 1. Functional Overview

This document defines detailed workflows, CRUD operations, validations, permissions, business rules, state transitions, audit requirements, and edge-case handling for ResumeNova.

The purpose of this document is to provide implementation-level guidance for developers.

---

# 2. User Lifecycle Workflow

## Registration Flow

User Actions:

1. Open Landing Page
2. Click Register
3. Enter:

   * Name
   * Email
   * Password
4. Submit

System Actions:

1. Validate data
2. Create user record
3. Assign User role
4. Create default profile
5. Create dashboard workspace
6. Login user

Final State:

ACTIVE_USER

---

## Google Login Workflow

User Actions:

1. Click Continue with Google

System Actions:

1. Google OAuth Authentication
2. Retrieve profile
3. Create user if not exists
4. Login user

Final State:

ACTIVE_USER

---

# 3. User Profile Module

## CRUD Matrix

| Operation | User | Admin | Super Admin |
| --------- | ---- | ----- | ----------- |
| Create    | Yes  | Yes   | Yes         |
| Read      | Own  | All   | All         |
| Update    | Own  | All   | All         |
| Delete    | No   | No    | Yes         |

---

## Validation Rules

Name:

* Required
* 3-100 characters

Email:

* Required
* Unique

Phone:

* Optional
* Valid format

Profile Image:

* JPG
* PNG
* Max 2MB

---

# 4. API Key Management Module

## Purpose

Users may register multiple Groq API keys.

---

## Workflow

### Add API Key

User:

1. Enter Name
2. Enter API Key
3. Assign Priority

System:

1. Validate format
2. Encrypt key
3. Store securely
4. Activate key

---

## CRUD Matrix

| Operation | User | Admin | Super Admin |
| --------- | ---- | ----- | ----------- |
| Create    | Own  | No    | Yes         |
| Read      | Own  | No    | Yes         |
| Update    | Own  | No    | Yes         |
| Delete    | Own  | No    | Yes         |

---

## Validation Rules

API Key:

Required

Must start with:

gsk_

Priority:

Unique per user

---

## Business Rules

Rule 1

Only active keys participate in failover.

Rule 2

Priority must be unique.

Rule 3

Encrypted before storage.

Rule 4

Never displayed fully.

---

# 5. API Failover Workflow

## Scenario

User owns:

Key A
Key B
Key C

Priority:

1 → Key A

2 → Key B

3 → Key C

---

## Execution Flow

Generation Start

↓

Use Key A

↓

Quota Exceeded?

YES

↓

Save Progress Checkpoint

↓

Switch Key B

↓

Continue Generation

↓

Merge Responses

↓

Return Final Result

---

## Failure Conditions

If all keys fail:

Generation Status:

FAILED

User receives:

"No available API keys."

---

# 6. Resume Builder Module

## Resume States

DRAFT

↓

GENERATING

↓

COMPLETED

↓

PUBLISHED

↓

ARCHIVED

---

# Manual Builder Workflow

Step 1

Personal Information

↓

Step 2

Education

↓

Step 3

Experience

↓

Step 4

Skills

↓

Step 5

Projects

↓

Step 6

Certifications

↓

Step 7

Languages

↓

Step 8

References

↓

Generate Resume

---

# AI Interview Builder Workflow

User Starts Session

↓

AI Asks Question

↓

User Answers

↓

AI Stores Response

↓

Next Question

↓

Resume Draft Created

↓

User Review

↓

Generate Final Resume

---

# CRUD Matrix

| Operation | User | Admin | Super Admin |
| --------- | ---- | ----- | ----------- |
| Create    | Yes  | Yes   | Yes         |
| Read      | Own  | All   | All         |
| Update    | Own  | Yes   | Yes         |
| Delete    | Own  | Yes   | Yes         |

---

# Validation Rules

Title:

Required

3-150 characters

Summary:

Maximum 5000 characters

Skills:

Maximum 100 skills

Experience:

Maximum 50 entries

Education:

Maximum 20 entries

---

# 7. Resume Versioning Module

## Workflow

Save Resume

↓

Create Version Snapshot

↓

Store Immutable Copy

↓

Assign Version Number

↓

Available For Restore

---

## Actions

Create Version

Restore Version

Duplicate Version

Compare Version

Delete Version

---

## Business Rules

Version history preserved.

Deleting current version does not delete historical versions.

---

# 8. ATS Analysis Module

## Workflow

User Select Resume

↓

Paste Job Description

OR

Upload Job Description

↓

Analyze

↓

Rule-Based Check

↓

AI Analysis

↓

Merge Results

↓

Generate Report

---

## Output

ATS Score

Missing Keywords

Missing Skills

Formatting Issues

Recommendations

---

## ATS States

PENDING

↓

ANALYZING

↓

COMPLETED

↓

FAILED

---

# 9. Cover Letter Generator

## Workflow

Select Resume

↓

Provide Job Description

↓

Select Language

↓

Generate

↓

Review

↓

Export

---

## Supported Languages

English

Bangla

---

# Cover Letter States

DRAFT

↓

GENERATING

↓

COMPLETED

---

# 10. Interview Question Generator

## Inputs

Resume

Job Description

Language

Question Count

---

## Outputs

HR Questions

Technical Questions

Behavioral Questions

Scenario Questions

---

# 11. Export Module

## PDF Export Workflow

Resume

↓

Template Renderer

↓

PDF Generator

↓

Download

---

## DOCX Export Workflow

Resume

↓

Template Renderer

↓

PHPWord

↓

Download

---

## Validation Rules

Resume must be completed.

Template must exist.

---

# 12. Dashboard Module

## User Dashboard Widgets

Recent Resumes

ATS Scores

Recent Exports

API Key Status

Cover Letters

Interview Questions

Usage Summary

---

# 13. Administration Module

## User Management

Functions:

View Users

Edit Users

Suspend Users

Activate Users

Change Roles

Delete Accounts

---

## Template Management

Functions:

Create Template

Update Template

Delete Template

Publish Template

Unpublish Template

---

## Analytics Dashboard

Metrics:

Total Users

Daily Registrations

Monthly Registrations

Generated Resumes

Generated Cover Letters

ATS Reports

Export Counts

AI Requests

API Failures

Template Usage

---

# 14. Role Permission Matrix

## User

Manage Own Profile

Manage Own Resumes

Manage Own API Keys

Generate AI Content

Export Documents

---

## Admin

Manage Users

Manage Templates

View Analytics

Monitor Usage

Cannot modify Super Admin

---

## Super Admin

Full Access

System Configuration

Role Governance

Audit Logs

Template Governance

---

# 15. Audit Trail Requirements

Log Every:

User Login

User Logout

Registration

Resume Creation

Resume Update

Resume Deletion

Version Restore

ATS Analysis

Cover Letter Generation

API Key Creation

API Key Update

API Key Deletion

Role Changes

Template Changes

---

# 16. Edge Case Handling

## Case 1

User deletes active API key.

System:

Automatically selects next priority key.

---

## Case 2

Resume generation interrupted.

System:

Restore checkpoint.

Continue generation.

---

## Case 3

Uploaded Job Description unreadable.

System:

Reject upload.

Display validation error.

---

## Case 4

User exceeds allowed file size.

System:

Reject upload.

Log event.

---

## Case 5

Template deleted while resume exists.

System:

Keep rendered version.

Prevent template dependency failure.

---

# 17. Error Handling Requirements

User-Friendly Messages:

API Failure

Generation Failure

Export Failure

Authentication Failure

Upload Failure

ATS Failure

---

# 18. Notification Requirements

Success Notifications

Warning Notifications

Error Notifications

System Notifications

Generation Completion Notifications

---

# End of Functional Specification Document
