import { expect, test, type Page } from '@playwright/test';

test('quiz order preference survives reload, return navigation, and a fresh same-origin tab', async ({ page, context }) => {
  // Playwright supplies an isolated browser context with empty storage.
  // Never seed localStorage on each load: that would conceal restore failures.
  await page.goto('/quiz');
  await expect(page.getByRole('button', { name: /Urutan Tetap$/ })).toBeVisible();

  async function expectMode(target: Page, random: boolean) {
    await expect(target.getByRole('button', {
      name: random ? /Acak$/ : /Urutan Tetap$/,
    })).toBeVisible();
    await expect.poll(() => target.evaluate(() =>
      localStorage.getItem('quiz-random-mode'),
    )).toBe(String(random));
  }

  for (const random of [true, false]) {
    await page.getByRole('button', {
      name: random ? /Urutan Tetap$/ : /Acak$/,
    }).click();
    await expectMode(page, random);

    await page.reload();
    await expectMode(page, random);

    // A new Page shares this context's origin storage, not React state.
    const freshTab = await context.newPage();
    try {
      await freshTab.goto('/quiz');
      await expectMode(freshTab, random);
    } finally {
      await freshTab.close();
    }

    await page.goto('/');
    await page.locator('a[href="/quiz"]').first().click();
    await expectMode(page, random);
  }
});
