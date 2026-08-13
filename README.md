# ATLAS: Multi-Tenant Product Analytics Platform

ATLAS is a high-performance, multi-tenant product analytics platform built with **Next.js 15 (App Router)**, **TypeScript (Strict Mode)**, **Postgres**, **Prisma ORM**, and **Auth.js v5**. 

It is designed around database-enforced multi-tenancy, sub-300ms analytical query performance over millions of events, streaming real-time metrics, and an internal operational management console.

---

## 🏛 Architecture Overview

ATLAS consists of three integrated surfaces built on a modular monorepo setup:

1. **Public Ingest API (`/api/v1/events`)**: High-throughput public endpoint absorbing single events or batches up to 500 items, backed by Argon2 API key authentication, per-key token bucket rate limiting, and strict 24-hour idempotency protection.
2. **Tenant Dashboard (`frontend/`)**: Customer-facing portal rendering streamable overview metrics (DAU/WAU/MAU), date-range filtered metrics, 2-6 step conversion funnels, N-week cohort retention heatmaps, and Server-Sent Events (SSE) live activity stream.
3. **Internal Ops Console (`/ops`)**: Staff management console for viewing tenant health, event volume distributions, quota usage, and executing real-time tenant suspension toggles.

```
                  ┌─────────────────────────────────────────┐
                  │          Ingest Clients / Apps          │
                  └────────────────────┬────────────────────┘
                                       │ HTTP POST /api/v1/events (Bearer API Key)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            ATLAS Ingest Engine                              │
│  - Argon2 API Key Validation   - Token Bucket Rate Limiting (200 req/s)     │
│  - Batch Ingestion (up to 500) - 24-Hour Idempotency Window                 │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Postgres Database Layer                            │
│  - FORCE ROW LEVEL SECURITY (RLS) on all tenant-scoped tables              │
│  - Isolated via `SET LOCAL app.tenant_id` in Prisma Transactions            │
│  - JSONB Event Properties with GIN Indexing                                 │
│  - Hourly & Daily Pre-Aggregated Event Rollup Tables                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Tenant & Ops Frontends                              │
│  - Streaming SSR with React <Suspense> Skeletons                            │
│  - Real-Time Live View via Server-Sent Events (SSE)                         │
│  - Multi-tenant Auth via NextAuth v5 & SECURITY DEFINER procedures          │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start Guide (< 10 Minutes)

Follow these steps to set up and run ATLAS on your local machine.

### 1. Prerequisites
- **Node.js**: v18.x or v20.x+
- **npm**: v9.x or v10.x+
- **Postgres Database**: Local PostgreSQL instance or Docker container (v14+ recommended)

### 2. Environment Configuration

Create `.env` in `backend/`:
```env
# Full connection string for migrations & seed (DB Owner Role)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/atlas?schema=public"

# App connection string for query isolation
APP_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/atlas?schema=public"

# NextAuth Configuration
NEXTAUTH_SECRET="atlas-super-secret-development-key-32-chars"
NEXTAUTH_URL="http://localhost:4000"
```

Create `.env` in `frontend/`:
```env
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

### 3. Database Initialization & Migrations

Navigate to the `backend` directory and run Prisma migrations:
```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
```

### 4. Seed 5 Million Realistic Events

Run the automated seed script to generate 5,000,000 realistic analytics events across 3 tenants (`Acme Corp`, `Globex Inc`, `Initech LLC`) spanning 95 days, and compute initial hourly/daily rollups:

```bash
npm run seed
```

> **Note**: Seed credentials generated:
> - **Acme Corp Owner**: `admin@acme-corp.com` / `password123!`
> - **Globex Inc Owner**: `admin@globex-inc.com` / `password123!`
> - **Initech LLC Owner**: `admin@initech-llc.com` / `password123!`

### 5. Running the Backend & Frontend Servers

Start the backend API & Auth server (Port 4000):
```bash
# In backend/
npm run dev
```

In a new terminal window, start the frontend dashboard server (Port 3000):
```bash
cd frontend
npm install
npm run dev
```

Access the applications:
- **Tenant Dashboard**: [http://localhost:3000](http://localhost:3000)
- **Backend API & Auth**: [http://localhost:4000](http://localhost:4000)

---

## 🧪 Running Automated Tests

ATLAS includes unit, security isolation, and integration test suites powered by **Vitest**.

Run all backend tests:
```bash
cd backend
npm test
```

### Test Suite Summary
- `tests/rls-isolation.test.ts`: Verifies Postgres RLS security policies. Ensures `SELECT * FROM events` without a `WHERE` clause returns **0 foreign tenant rows** when running under a tenant-scoped connection.
- `tests/ingest.test.ts`: Tests `POST /api/v1/events` single/batch ingestion, Argon2 key authentication, 24-hour idempotency key deduplication, and rate limiting headers.
- `tests/funnel-math.test.ts`: Validates 2-6 step funnel conversion and drop-off math against hand-computed fixtures.

---

## 📡 API Specification

### Ingest Endpoint: `POST /api/v1/events`

#### Headers
| Header | Type | Required | Description |
|---|---|---|---|
| `Authorization` | String | Yes | `Bearer <API_KEY>` issued for tenant |
| `Content-Type` | String | Yes | `application/json` |
| `Idempotency-Key` | String | Optional | Unique key per event payload for 24h deduplication |

#### Single Event Request Payload
```json
{
  "name": "checkout_complete",
  "distinctId": "user_10293",
  "properties": {
    "plan": "pro",
    "amount": 49.99,
    "currency": "USD"
  },
  "occurredAt": "2026-08-13T14:00:00Z"
}
```

#### Batch Request Payload (Up to 500 events)
```json
[
  {
    "name": "page_view",
    "distinctId": "user_10293",
    "properties": { "path": "/dashboard" }
  },
  {
    "name": "button_click",
    "distinctId": "user_10293",
    "properties": { "buttonId": "upgrade_cta" }
  }
]
```

#### Response Codes
- `202 Accepted`: Payload successfully queued / inserted.
- `401 Unauthorized`: Missing or invalid API key.
- `403 Forbidden`: Tenant suspended by admin.
- `429 Too Many Requests`: Rate limit exceeded (includes `Retry-After` header) or quota exhausted.

---

## 📑 Architectural Decision Records (ADRs)

Key architectural choices are documented in `backend/docs/decisions/`:

- [ADR-001: Event Properties as JSONB](backend/docs/decisions/ADR-001-event-properties-jsonb.md) — Storing event properties as JSONB with GIN index rather than EAV pattern.
- [ADR-002: Tenant Isolation via Postgres RLS](backend/docs/decisions/ADR-002-row-level-security.md) — Database-level enforcement of tenant boundaries with `FORCE ROW LEVEL SECURITY`.
- [ADR-003: RLS & Connection Pooling (`SET LOCAL`)](backend/docs/decisions/ADR-003-rls-and-connection-pooling.md) — Using `SET LOCAL app.tenant_id` within Prisma transactions to prevent PgBouncer connection leaks.
- [ADR-004: Pre-Tenant Lookups via SECURITY DEFINER](backend/docs/decisions/ADR-004-pre-tenant-lookups.md) — Restricted stored procedures for user login and org switching before active tenant context is established.
- [ADR-005: Token Bucket Ingestion Rate Limiting](backend/docs/decisions/ADR-005-rate-limiting-token-bucket.md) — In-memory sliding token bucket algorithm for sub-millisecond rate limit checks on the ingest path.

---

## 🛠 Tech Stack Summary

- **Frontend**: Next.js 15 (App Router), React 18, Vanilla CSS Design System, Server-Sent Events (SSE) Client
- **Backend**: Next.js 15 API Routes, TypeScript (Strict Mode with `noUncheckedIndexedAccess`), NextAuth v5
- **Database & ORM**: PostgreSQL, Prisma ORM, Native Postgres RLS Policies, JSONB GIN Indexes
- **Security**: Argon2 Password & API Key Hashing, Zod Validation Schemas, RLS Row Isolation
- **Testing**: Vitest for Unit & Integration Testing
