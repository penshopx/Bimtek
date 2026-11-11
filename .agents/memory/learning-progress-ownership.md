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

Treat the guided route as an editorial introduction assembled from available learning categories, not a verified occupation-specific certification curriculum.

**Why:** connecting the existing catalog to a job target does not establish official scheme coverage or prove competency. Module checkmarks are self-reported activity, and reaching a quiz result is not an official passing decision.

**How to apply:** retain these distinctions in progress labels, completion summaries, and future reports or certificates.
