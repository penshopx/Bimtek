---
name: Multi-step form submission
description: React button reuse can accidentally submit an intermediate step during a click.
---

Keep the primary button's submit behavior consistent across steps, and route intermediate steps through a form handler that prevents the default submission before changing state.

**Why:** In a React multi-step form, updating the step from a button click can reuse the same DOM button and change its type from button to submit before the browser performs its default action. This can unexpectedly submit the final step and start an AI request.

**How to apply:** For forms that transition into a final submit step, use a stable submit button and handle step advancement inside the form's prevented submit handler, or explicitly prevent the click's default action before changing steps. Verify intermediate navigation produces no network mutation.
