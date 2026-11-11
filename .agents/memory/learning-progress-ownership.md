---
name: Learning progress ownership
description: Why the guided learner journey does not automatically adopt old shared-browser completion records.
---

Do not automatically attribute legacy browser-wide module or lesson completion to whichever account is currently signed in. Keep those old records intact and explain why they are excluded from account-specific progress.

**Why:** older browser-wide records have no reliable owner. Importing them automatically could display one learner's work as another learner's progress on a shared computer.

**How to apply:** new learning journeys use explicitly account-separated records. Any future migration needs a deliberate ownership confirmation rather than an implicit import.

Account-keyed browser progress can be explicitly merged into the signed-in account. The server must derive ownership from a valid session, merge updates by each step/category's timestamp, and report sync failures without discarding the browser copy.

**Why:** this preserves learner-owned local work while preventing client-supplied account IDs from selecting another person's records.

**How to apply:** treat browser-local separation and server-side synchronization as separate layers. Never describe local-only records as cross-device data, and do not automatically import the older unowned global keys.

Send normal progress edits as targeted lesson, module, or quiz operations rather than stale whole-progress snapshots. Reserve full-snapshot writes for an explicit reconciliation step, and retry transient SQLite busy errors around the operation transaction.

**Why:** two authenticated browsers can edit different lessons in the same module from the same old snapshot; replacing the full module would erase one learner's newer checklist change. SQLite may also report a busy transaction while the independent edits arrive together.

**How to apply:** when adding a new progress mutation, update only the addressed item against the latest account record inside a transaction. Keep the local copy on network failure and surface a retry path.

Treat the guided route as an editorial introduction assembled from available learning categories, not a verified occupation-specific certification curriculum.

**Why:** connecting the existing catalog to a job target does not establish official scheme coverage or prove competency. Module checkmarks are self-reported activity, and reaching a quiz result is not an official passing decision.

**How to apply:** retain these distinctions in progress labels, completion summaries, and future reports or certificates.
