---
name: Browser failure simulation
description: Reliable browser interception for testing failure and retry states.
---

Use a fresh browser context with service workers blocked when simulating API failures through request interception.

**Why:** This app's service worker bypassed browser routing during a save-failure check, allowing an intended failed request to succeed. Blocking service workers made the simulated server error and network abort reach the actual UI.

**How to apply:** For failure/retry tests, intercept only the relevant mutation and confirm that the interception actually fired before accepting the result. Do not disable service workers in application code for this purpose.
