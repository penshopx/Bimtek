---
name: Multipart runtime compatibility
description: Differences between Bun test requests and Next.js multipart parsing.
---

Do not assume Bun's multipart test fixtures and Next.js use identical File constructors or MIME strings. A valid TXT multipart part can be parsed with a charset parameter even when the original fixture supplied only text/plain.

**Why:** this runtime difference caused valid test uploads to be rejected before reaching storage; comparing MIME strings literally obscured the actual failure.

**How to apply:** test multipart requests through the handler, not just the file validator. Compare normalized base media types, validate bytes independently, and avoid constructor-identity assumptions across request implementations.
