---
name: Next.js development route cache
description: Stale development artifacts can make an existing App Router API route return 404 after merges or restarts.
---

If an App Router API route exists on disk and appears in `.next/dev/server/app-paths-manifest.json`, but requests still receive a 404, clear the generated `.next` development cache and restart the app workflow before changing the route code.

**Why:** The development server can retain outdated route artifacts after a sequence of task merges and workflow restarts. The source route is valid, but the stale artifact is served as a not-found response.

**How to apply:** Verify the route file and manifest first. If both are present, remove only the generated `.next` cache, restart the existing application workflow, and retest the endpoint. Do not treat the initial 404 as proof that the API implementation is missing.