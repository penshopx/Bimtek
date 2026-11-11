---
name: LibSQL transaction test fixtures
description: Test database setup for Drizzle transactions using the LibSQL adapter.
---

Use a temporary file-backed SQLite database, not a `:memory:` client, when a route test exercises `db.transaction()`.

**Why:** with the LibSQL adapter, the transaction may run on a separate in-memory connection, so tables created on the original `:memory:` client are absent inside the transaction.

**How to apply:** create a unique temporary database file for the test, run the schema setup there, then close the client and remove the temporary directory.
