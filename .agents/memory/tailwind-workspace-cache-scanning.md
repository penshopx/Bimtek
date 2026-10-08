---
name: Tailwind workspace cache scanning
description: A large unignored package cache can make Tailwind/PostCSS stall during a Next.js development compile.
---

Generated package caches inside the workspace must remain ignored so Tailwind's source scan does not traverse hundreds of megabytes of cached packages.

**Why:** During a Next.js dev restart, the first page request stalled indefinitely in the PostCSS worker while an unignored Bun cache occupied the workspace; excluding and clearing only generated caches restored normal compilation.

**How to apply:** If the first Next.js page compile hangs in PostCSS, inspect workspace cache directories and `.gitignore` before changing application CSS or route code. Remove only generated caches, then restart the workflow.

ESLint has a separate scan scope: `.gitignore` alone does not prevent the default whole-project lint command from traversing `.cache/.bun` and exhausting memory.

**Why:** a default lint run was killed while parsing cached dependency files; excluding generated/cache/upload directories at the CLI completed with application warnings only.

**How to apply:** distinguish lint failures in application code from scanner scope failures. For a narrowly scoped edit, use explicit ignore flags without changing unrelated configuration; fix persistent ESLint ignores in a separately authorized cleanup.