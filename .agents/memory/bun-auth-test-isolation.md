---
name: Bun auth-test isolation
description: Avoid cross-suite closed database connections in auth route integration tests.
---

Tests that mock separate in-memory databases must not share an API handler instance that caches its database connection.

**Why:** Bun shares imported modules across test files. Restoring a mock does not clear an already cached connection; closing one fixture can make another suite fail with `CLIENT_CLOSED` even when both pass alone.

**How to apply:** Give a new suite its own route module instance (Bun supports an import query suffix), and initialize that instance's lazy database while the suite's mock is active using a non-mutating request. Verify database-backed suites together in both argument orders, not only individually.

For presentation-only tests, prefer passing account state into a pure view instead of globally mocking the shared authentication provider.

**Why:** Bun's module mocks can replace the provider used by a real login integration suite in the same process, even if each file passes separately.

**How to apply:** keep authentication in a thin production wrapper and exercise the view with supplied account props; run related suites together to catch cross-file interference.

For libsql integration tests that use transactions, use a shared-cache in-memory database rather than a plain `:memory:` connection.

**Why:** the local libsql client detaches its current connection when opening a transaction. Subsequent operations can open a different connection; plain in-memory tables then disappear even though the fixture client was never closed.

**How to apply:** use an isolated shared-cache in-memory fixture (for example `file::memory:?cache=shared`) for transaction tests. Do not connect test fixtures to the application's file database.
