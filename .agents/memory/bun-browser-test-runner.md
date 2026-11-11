---
name: Bun browser-test runner
description: Why browser tests need precompiled specs and explicit browser discovery in this environment.
---

When Playwright is launched under Bun, compile TypeScript browser specs to
JavaScript with external packages before loading them in the runner.

**Why:** Playwright's TypeScript loader produced an opaque AggregateError and
reported no tests, although Bun could compile the same source. Precompilation
allowed the real browser tests to run successfully without changing app code.
The configured Node module was also not available on the shell PATH; changing
the module version did not resolve that absence.

**How to apply:** Keep the authored spec in TypeScript and the generated file
temporary. Preserve the test exit status during cleanup. Prefer the supplied
Chromium when available, and fall back to normal Playwright browser discovery
outside this environment. Do not replace the application's runtime just to
launch browser tests.

Browser suites that directly seed the local development database must target
the same local workflow rather than inheriting a remote preview hostname.

**Why:** The preview HTTPS certificate can be untrusted by Playwright's request
client even when the local app works. Mixing local fixtures with a different
host can also exercise the wrong database. Disabling TLS verification globally
would hide the cause.

**How to apply:** For local-database fixture suites, scope host selection to the
runner (for example, unset `REPLIT_DEV_DOMAIN` just for its process to use the
existing loopback fallback). Keep shared browser configuration usable for tests
that intentionally exercise the proxy.

Bare `bun test` can discover Playwright `.spec.ts` files alongside Bun tests;
use the intended runner or scope the command to the source test directory.
Combined UI suites may also fail where the same files pass individually, so
confirm isolation/order behavior before treating the individual results as
proof that the aggregate suite is healthy.

**Why:** In this workspace, the broad command mixed runner types, and several
UI test failures appeared only in the aggregate run. The discrepancy remains
unexplained, so a green isolated run is not a substitute for a reliable full
suite.

**How to apply:** Keep Playwright and Bun commands explicit, and investigate
cross-test state or runner configuration when aggregate and isolated outcomes
differ.
