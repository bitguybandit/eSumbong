# eSumbong

### A Web-Based Complaint Reporting and Resolution System for Barangay Local Government Units

eSumbong is a web-based complaint reporting and resolution system designed to help residents submit community complaints and allow Barangay Officers to review, process, refer, resolve, and close complaints in a structured manner.

Developed as a Bachelor of Science in Information Technology software project at **Western Institute of Technology**.

---


## Complaint Workflow

The standard complaint lifecycle follows this process:

text
SUBMITTED
    ↓
UNDER REVIEW
    ↓
REFERRED
    ↓
RESOLVED
    ↓
CLOSED

Invalid complaints may follow:

text
UNDER REVIEW
    ↓
REJECTED

### Workflow Description

1. *Submitted* — A resident submits a complaint through the system.
2. *Under Review* — A Barangay Officer reviews and validates the complaint.
3. *Referred* — The complaint is referred to an appropriate target when necessary.
4. *Resolved* — The complaint has been addressed and resolution details are recorded.
5. *Closed* — The complaint process is completed and the case is formally closed.
6. *Rejected* — A complaint may be rejected when it is determined to be invalid or inappropriate, with a reason recorded by the officer.



## Table of Contents

- [Project Scope](#project-scope)
- [Core Features](#core-features)
- [Complaint Workflow](#complaint-workflow)
- [Referral Mechanism](#referral-mechanism)
- [System Architecture](#system-architecture)
- [Database / ERD](#database--erd)
- [User Flow](#user-flow)
- [Sitemap](#sitemap)
- [Technology Stack](#technology-stack)
- [Project Status](#project-status)
- [Development Approach](#development-approach)
- [Getting Started](#getting-started)
- [Guest Access](#guest-access)
- [Officer Access](#officer-access)
- [Project Information](#project-information)

---

## Project Scope

The current pilot MVP consists of two primary user roles:

### Resident

Residents can submit community complaints, provide relevant details and evidence, and track the progress of their complaints.

### Barangay Officer

Barangay Officers can review, validate, categorize, refer, process, resolve, and close submitted complaints.

The current MVP does *not* include:

- Administrator accounts
- Municipal Officer accounts
- Department Officer accounts
- Automatic complaint routing
- Automatic referral to external offices

---

## Core Features

### Resident

- Account registration and login
- Complaint submission
- Complaint description and categorization
- Photo attachment
- Complaint location selection using a map
- Anonymous reporting
- Guest complaint submission without an account
- Complaint tracking using a Tracking ID
- Status notifications

### Barangay Officer

- Complaint queue
- Complaint review and validation
- Complaint rejection with reason
- Complaint categorization
- Referral suggestion review
- Referral acceptance or override
- Action and contact logging
- Resolution remarks
- Resolution photo attachment
- Complaint closure
