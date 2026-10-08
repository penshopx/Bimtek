# Quiz retry browser regression

Run against the existing **development** workflow using its local `.data/app.db`.
Do not run against production or a separately hosted application.

```sh
# Replit uses its provided Chromium automatically.
# Outside Replit, install Playwright's Chromium once:
bun --bun x playwright install chromium

# Start the application using Replit's Start application workflow, then:
bun run test:quiz-retry
```

The suite creates four questions in a unique temporary category for each test,
uses the real category/question server actions, and cleans up only its own rows.
It starts with a fresh, signed-out browser and fixed question order.
Attempt-recording calls for the fixture questions are intercepted and aborted
(service workers are blocked), so the tests cannot alter user analytics or
trigger the attempt retention cleanup. Assertions verify interception occurred
and no fixture attempts reached the database.

Coverage:
- Two wrong answers display `Ulangi Soal yang Salah (2)`.
- Clicking the button resets the session and displays exactly those two
  questions, with the two-question progress counter and result denominator.
- Correcting the missed questions removes the retry button.
- A perfect initial four-question session also has no retry button.

Failed runs retain browser traces and screenshots under `test-results/`.

The command compiles the saved TypeScript spec to temporary JavaScript before
launching Playwright, then removes it while preserving the test exit code.
This avoids a Playwright TypeScript loader incompatibility with Bun.
`PLAYWRIGHT_CHROMIUM_EXECUTABLE` can select another installed Chromium binary.
