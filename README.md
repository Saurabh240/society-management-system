# society-management-system
Society Management System for Users

## Tech Stack
- Backend: Spring Boot (Modular Monolith)
- Frontend: React + TypeScript
- DB: PostgreSQL
- Auth: JWT + RBAC

## Modules
- Communication
- Accounting

## Local Setup
docker compose up -d
## Kafka Setup
docker compose -f docker-compose-kafka.yml up -d

---

# 🚀 Intern Onboarding Guide

**SaaS Community Communication + Accounting Platform**

Welcome to the project!
This document explains **how the system is built**, **how you are expected to work**, and **what rules you must follow**.

Please read this **fully before writing any code**.

---

## 1. Project Overview (High Level)

This is a **multi-tenant SaaS platform** used by **Community Management Companies**.

### Core Modules

* **Communication Module**

  * Communities, Properties, Units
  * Announcements & Notifications
* **Accounting Module**

  * Chart of Accounts
  * Journals & Ledger
  * Banking, Bills, Budgets
  * Financial Reports

### Architecture Style

* **Backend:** Spring Boot – *Modular Monolith*
* **Frontend:** React + TypeScript
* **Auth:** JWT + Role-Based Access Control
* **Tenancy:** Subdomain-based isolation

---

## 2. Repository Structure (Do NOT Change)

```
.
├── backend          # Spring Boot application
├── frontend         # React application
├── docker           # Pre-configured (DO NOT MODIFY)
├── .github/workflows
└── README.md
```

---

## 3. Backend Architecture (Very Important)

### Package Structure

```
com.company.saas
│
├── platform         # Shared infrastructure (DO NOT MIX BUSINESS LOGIC)
│   ├── tenant
│   ├── security
│   ├── audit
│   └── common
│
├── communication    # Communication module
│
├── accounting       # Accounting module
│
└── bootstrap
```

### Backend Rules (Non-Negotiable)

❌ **NOT allowed**

* Business logic in controllers
* Accessing another module’s repository
* Hardcoding tenantId or role
* SQL in controllers/services

✅ **Required**

* Controllers → Application Services → Domain → Repository
* TenantContext used for all data access
* DTOs used for API responses

---

## 4. Frontend Architecture

### Folder Structure

```
src
├── platform         # Auth, routing, layout
├── communication    # Communication screens
├── accounting       # Accounting screens
├── api              # API calls only
└── shared           # Reusable UI components
```

### Frontend Rules

❌ **NOT allowed**

* API calls directly inside components
* Hardcoded roles or permissions
* Mixing accounting and communication UI

✅ **Required**

* API calls only via `*Api.ts`
* Role handling from backend metadata
* One module = one folder

---

## 5. Sprint 1 Scope (What You Are Working On)

### Backend

* Tenant resolution (subdomain)
* Tenant context propagation
* JWT authentication (Senior only)
* RBAC (Senior only)
* Global exception handling
* Audit logging

### Frontend

* React app setup
* Login / Logout
* Token handling
* Protected routing
* Base layout & navigation

🚫 **Out of Scope**

* Accounting features
* Communication features
* Unit tests
* Styling improvements

---

## 6. How You Are Expected to Work (Daily)

### Daily Workflow

1. Pull latest code from `main`
2. Work on **only your assigned task**
3. Commit small, meaningful changes
4. Push branch before end of day

### Commit Message Format

```
feat: tenant filter for subdomain resolution
fix: clear tenant context after request
```

---

## 7. Daily Stand-Up Expectations

Every day you must clearly answer:

1. **What did I complete yesterday?**
2. **What will I complete today?**
3. **What is blocking me (if anything)?**

🚫 Avoid vague answers like:

* “Still working”
* “Exploring”
* “Almost done”

---

## 8. Pull Request Rules (Very Strict)

Before raising a PR, verify:

### Architecture

* [ ] Module boundaries respected
* [ ] TenantContext used correctly
* [ ] No cross-module imports

### Code Quality

* [ ] Clean, readable code
* [ ] Single responsibility per class
* [ ] No commented-out code

### Security

* [ ] No auth logic outside security layer
* [ ] No sensitive logs
* [ ] No hardcoded credentials

❌ **PRs failing checks will be rejected without discussion**

---

## 9. Accounting-Specific Warning (For Future Sprints)

When you work on accounting later:

* Journal entries are **immutable**
* Ledger is **derived**, never stored
* Debit must always equal credit
* Never update financial history

---

## 10. When to Ask for Help

Ask early if:

* You are unsure about architecture
* You feel blocked for more than 30 minutes
* You think a rule must be broken

🚫 Do NOT silently implement shortcuts.

---

## 11. Golden Rule (Remember This)

> **Speed is important, but correctness is mandatory.
> A clean foundation matters more than fast delivery.**

---

## 12. Acknowledgement

By contributing to this repository, you agree to:

* Follow this guide
* Respect architecture decisions
* Accept PR feedback constructively

---

### Welcome aboard 🚀

If you follow this guide strictly, you’ll grow fast and the project will succeed.

---
