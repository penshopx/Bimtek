---
name: Drizzle migration ordering
description: Prevent generated SQLite migrations from repeating old DDL or being silently skipped.
---

After generating a Drizzle migration, inspect both its SQL and the new journal entry. Keep only the intended schema diff, and ensure the new journal `when` value is greater than every existing migration timestamp.

**Why:** This project has manually added migrations that are not fully represented by the latest generated snapshot, plus journal entries dated ahead of wall-clock time. Drizzle can therefore regenerate old DDL and silently skip a valid new migration whose timestamp is lower than the recorded maximum.

**How to apply:** After `db:generate`, remove unrelated historical DDL from the new SQL, make the journal timestamp monotonically increasing, run the development migration, and verify the expected columns or tables directly.