---
name: Tailwind workspace cache scanning
description: A large unignored package cache can make Tailwind/PostCSS stall during a Next.js development compile.
---

Generated package caches inside the workspace must remain ignored so Tailwind's source scan does not traverse hundreds of megabytes of cached packages.

**Why:** During a Next.js dev restart, the first page request stalled indefinitely in the PostCSS worker while an unignored Bun cache occupied the workspace; excluding and clearing only generated caches restored normal compilation.

**How to apply:** If the first Next.js page compile hangs in PostCSS, inspect workspace cache directories and `.gitignore` before changing application CSS or route code. Remove only generated caches, then restart the workflow.