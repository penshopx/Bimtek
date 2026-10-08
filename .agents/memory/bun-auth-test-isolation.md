---
name: Bun auth-test isolation
description: Avoid cross-suite closed database connections in auth route integration tests.
---

Tests that mock separate in-memory databases must not share an API handler instance that caches its database connection.

**Why:** Bun shares imported modules across test files. Restoring a mock does not clear an already cached connection; closing one fixture can make another suite fail with `CLIENT_CLOSED` even when both pass alone.

**How to apply:** Give a new suite its own route module instance (Bun supports an import query suffix), and initialize that instance's lazy database while the suite's mock is active using a non-mutating request. Verify database-backed suites together in both argument orders, not only individually.
