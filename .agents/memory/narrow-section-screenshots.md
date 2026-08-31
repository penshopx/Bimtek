---
name: Narrow section screenshots
description: Reliable capture of a complete responsive section at an exact mobile CSS width.
---

Capture long responsive sections by setting mobile device metrics and clipping the screenshot to the section's DOM bounds through Chromium DevTools.

**Why:** Command-line screenshots use a fixed viewport and can leave large blank areas or misframe anchored content when the viewport is made artificially tall. Review evidence then may not show the complete target section clearly.

**How to apply:** For mobile layout verification, keep a realistic narrow viewport, measure the target element after the page settles, and use a beyond-viewport screenshot clip at the element's document coordinates.