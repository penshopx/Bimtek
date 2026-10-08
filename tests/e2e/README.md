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

## Quiz order preference

```sh
bun run test:quiz-order
```

This read-only browser test starts with empty storage in an isolated context.
It switches to **Acak**, then back to **Urutan Tetap**, checking the visible
toggle and stored preference after each change, a full reload, a new same-origin
tab, and return navigation through the home page's quiz link. It does not
answer questions, record attempts, seed storage on reload, or modify the database.

## Admin edit and clear attempt history

```sh
bun run test:quiz-edit-clear
```

Development only, against the existing workflow and local `.data/app.db`.
The command deliberately unsets `REPLIT_DEV_DOMAIN` for the browser runner so
it reaches that same local workflow over loopback, not a different host or the
HTTPS preview (whose certificate may not be trusted by the test runner).
The suite registers a unique temporary account, promotes only that account to
admin, and logs in through the real login form. It seeds three temporary
questions with valid/stale, zero, and unrelated control attempts. No server
actions or authentication responses are mocked.

Coverage:
- Editing question text and checking the clear-history checkbox saves the text
  and physically deletes all its attempts (confirmed directly in the database).
- The row shows `Belum ada data`, with no attempt count or `Reset stats` button,
  immediately after save and after reload.
- The control question retains its attempts.
- Reopening the cleared question and editing an initially unattempted question
  both hide the checkbox.

Cleanup runs even after a failed assertion and deletes only this run's questions,
attempts, temporary account, and sessions. Browser contexts are isolated;
the test does not use or change any existing admin account.
