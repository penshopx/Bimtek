---
name: Browser-local profile privacy
description: Keep personal profile details out of preparation URLs and require deliberate AI sharing.
---

Browser-local professional profile details must stay local when navigating to preparation tools. URLs should carry only the minimum target needed for preselection, not names, education, experience, or current certificate details.

**Why:** query parameters reach the server on GET requests and remain in browser history. Sending the entire profile through a link would undermine the browser-local privacy boundary even without saving it to a database.

**How to apply:** read optional details from browser storage on the destination. For AI coaching, require a deliberate action to insert the details into a reviewable message, followed by explicit submission; do not automatically send them.
