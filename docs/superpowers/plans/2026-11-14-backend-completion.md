# Backend Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish the remaining production-hardening work on the BloodNet backend without changing the public API contract.

**Architecture:** Keep FastAPI + SQLAlchemy + SQLite for local/demo use, add Alembic as the schema source of truth, serialize dispatch/activation in-process, add request tracing and readiness checks, and fix Smart Service SLA pressure to use the current simulation clock.

**Tech Stack:** Python 3.14, FastAPI, SQLAlchemy 2.x, Alembic, SQLite WAL, pytest, httpx.

**Spec:** `participant_kit/openapi.yaml`, `PARTICIPANT_README.md`, `SERVICES.md`, and the existing `backend/tests/test_api.py`.

## Global Constraints

- Do not change existing endpoint paths, auth tokens, or response shapes used by `harness/contract_tests.py`.
- All simulation logic must use simulation time, never wall-clock time.
- Existing 9 backend tests and 15 contract tests must continue to pass.
- Do not claim full multi-worker safety; document the single-process lock limitation.
- Use UTF-8 for all Persian docs.

## Review Focus

- Concurrent dispatch of the same stock must not double-allocate in one process.
- Duplicate dispatch IDs must replay without incrementing `allocated_units` twice.
- Callback events may arrive out of order; a later `accepted` must not erase an earlier `donated`.
- Smart Service SLA pressure must increase as simulation time advances.
- Fresh install must be able to create the schema with Alembic.

---

### Task 1: Add Alembic baseline

**Files:**
- Create: `backend/alembic.ini`
- Create: `backend/alembic/env.py`
- Create: `backend/alembic/script.py.mako`
- Create: `backend/alembic/versions/20261114_0001_initial.py`
- Modify: `backend/README.md`

**Interfaces:**
- Consumes: `app.config.settings.database_url`, `app.db.Base.metadata`
- Produces: `alembic upgrade head` creates all six tables.

- [ ] **Step 1: Create Alembic config and env**
- [ ] **Step 2: Autogenerate or write the initial migration for all models**
- [ ] **Step 3: Run `alembic upgrade head` against a temp SQLite DB and verify all tables**
- [ ] **Step 4: Commit**

### Task 2: Add request tracing and readiness health

**Files:**
- Create: `backend/app/middleware.py`
- Modify: `backend/app/main.py`
- Modify: `backend/app/config.py`
- Test: `backend/tests/test_api.py`

**Interfaces:**
- Produces: `GET /health/ready` -> `{"ok": true, "database": "ok"}`
- Produces: every response includes `X-Request-ID`; caller-supplied IDs are preserved.

- [ ] **Step 1: Write failing tests for readiness and request ID**
- [ ] **Step 2: Run tests and confirm failure**
- [ ] **Step 3: Implement middleware and readiness endpoint**
- [ ] **Step 4: Run tests and confirm pass**
- [ ] **Step 5: Commit**

### Task 3: Serialize dispatch and cover idempotency/out-of-order callbacks

**Files:**
- Modify: `backend/app/routers.py`
- Modify: `backend/app/services.py`
- Test: `backend/tests/test_api.py`

**Interfaces:**
- Consumes: `ACTIVATION_LOCK`, `Dispatch`, `dispatch_stock`
- Produces: dispatch handler serialized with activation; duplicate dispatch ID returns existing row without a second allocation.

- [ ] **Step 1: Write failing dispatch replay and out-of-order callback tests**
- [ ] **Step 2: Run tests and confirm failure**
- [ ] **Step 3: Wrap dispatch in `ACTIVATION_LOCK` and reuse the existing dispatch row**
- [ ] **Step 4: Run tests and confirm pass**
- [ ] **Step 5: Commit**

### Task 4: Fix Smart Service SLA pressure to use current simulation time

**Files:**
- Modify: `backend/app/services.py`
- Modify: `backend/app/routers.py`
- Test: `backend/tests/test_api.py`

**Interfaces:**
- Produces: `smart_advice(db, request_id, sim: float | None = None)`; when `sim` is omitted, uses `gateway_clock()`.
- Produces: `GET /smart/requests/{id}` accepts optional `X-Sim-Time`.

- [ ] **Step 1: Write failing test: advice at sim 100 has more SLA pressure than at sim 10**
- [ ] **Step 2: Run test and confirm failure**
- [ ] **Step 3: Implement current-sim elapsed calculation**
- [ ] **Step 4: Run test and confirm pass**
- [ ] **Step 5: Commit**

### Task 5: Final verification and documentation

**Files:**
- Modify: `backend/README.md`
- Modify: `README.md` (if backend status is stale)
- Test: full backend suite, contract tests, smoke run

- [ ] **Step 1: Rewrite backend README in clean UTF-8 Persian with run/migrate/test commands**
- [ ] **Step 2: Run `pytest` and confirm all tests pass**
- [ ] **Step 3: Start backend and run `python -m harness.contract_tests --team http://127.0.0.1:8000`**
- [ ] **Step 4: Run one practice smoke scenario and record the score**
- [ ] **Step 5: Commit and push `main`; fast-forward `backend` branch if it exists**
