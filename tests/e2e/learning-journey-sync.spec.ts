import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { createClient, type Client } from '@libsql/client';
import { expect, test, type Page } from '@playwright/test';

type TestAccount = { id: string; email: string; password: string };
const journeyUrl = '**/api/learning-journey';

async function waitForJourneyRead(page: Page, pathName: string) {
  const response = page.waitForResponse(response =>
    new URL(response.url()).pathname === '/api/learning-journey' &&
    response.request().method() === 'GET',
  );
  await page.goto(pathName);
  expect((await response).status()).toBe(200);
}

async function login(page: Page, account: TestAccount) {
  await page.goto('/login');
  await page.locator('input[type="email"]').fill(account.email);
  await page.locator('input[type="password"]').fill(account.password);
  await page.getByRole('button', { name: 'Masuk', exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  const skipProfileSetup = page.getByRole('button', { name: 'Lewati untuk sekarang', exact: true });
  if (await skipProfileSetup.isVisible().catch(() => false)) await skipProfileSetup.click();
}

test('progres terisolasi, sinkron lintas browser, tahan update bersamaan, dan menolak sesi kedaluwarsa', async ({
  browser, request,
}) => {
  const client: Client = createClient({ url: `file:${path.resolve('.data/app.db')}` });
  let accountA: TestAccount | undefined;
  let accountB: TestAccount | undefined;
  let contextA: Awaited<ReturnType<typeof browser.newContext>> | undefined;
  let contextB: Awaited<ReturnType<typeof browser.newContext>> | undefined;

  async function register(label: string): Promise<TestAccount> {
    const email = `learning-journey-${label}-${randomUUID()}@example.invalid`;
    const password = `${randomUUID()}-Aa1`;
    const response = await request.post('/api/auth?action=register', {
      data: { name: `E2E alur ${label}`, email, password },
    });
    expect(response.ok()).toBe(true);
    const body = await response.json();
    expect(body.success).toBe(true);
    return { id: body.user.id, email, password };
  }

  try {
    accountA = await register('A');
    accountB = await register('B');
    contextA = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    contextB = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const pageA = await contextA.newPage();
    const pageB = await contextB.newPage();

    await login(pageA, accountA);
    await waitForJourneyRead(pageA, '/bimtek');
    const moduleA = pageA.getByRole('button', { name: /Tandai selesai:.*Teknik Fondasi gedung/i });
    await expect(moduleA).toHaveAttribute('aria-pressed', 'false');
    const moduleSave = pageA.waitForResponse(response =>
      new URL(response.url()).pathname === '/api/learning-journey' &&
      response.request().method() === 'PATCH',
    );
    await moduleA.click();
    expect((await moduleSave).status()).toBe(200);
    await expect(pageA.getByRole('button', {
      name: /Batalkan tanda selesai:.*Teknik Fondasi gedung/i,
    })).toHaveAttribute('aria-pressed', 'true');

    const rowA = await client.execute({
      sql: 'SELECT progress FROM learning_journey_progress WHERE user_id = ?',
      args: [accountA.id],
    });
    expect(JSON.parse(String(rowA.rows[0].progress)).modules['sipil-gedung-1'].completed).toBe(true);

    await login(pageB, accountB);
    await waitForJourneyRead(pageB, '/bimtek');
    const isolatedB = pageB.getByRole('button', { name: /Tandai selesai:.*Teknik Fondasi gedung/i });
    await expect(isolatedB).toHaveAttribute('aria-pressed', 'false');
    expect((await client.execute({
      sql: 'SELECT user_id FROM learning_journey_progress WHERE user_id = ?',
      args: [accountB.id],
    })).rows).toHaveLength(0);

    await pageB.getByRole('button', { name: 'Keluar', exact: true }).click();
    await expect(pageB).toHaveURL('/');
    await login(pageB, accountA);
    await waitForJourneyRead(pageB, '/bimtek');
    await expect(pageB.getByRole('button', {
      name: /Batalkan tanda selesai:.*Teknik Fondasi gedung/i,
    })).toHaveAttribute('aria-pressed', 'true');

    await Promise.all([
      waitForJourneyRead(pageA, '/bimtek/sipil-gedung-1'),
      waitForJourneyRead(pageB, '/bimtek/sipil-gedung-1'),
    ]);
    const lessonOneA = pageA.getByRole('button', { name: 'Tandai Pengenalan Materi selesai' });
    const lessonTwoB = pageB.getByRole('button', { name: 'Tandai Teori dan Konsep Dasar selesai' });
    const firstLessonSave = pageA.waitForResponse(response =>
      new URL(response.url()).pathname === '/api/learning-journey' &&
      response.request().method() === 'PATCH',
    );
    await lessonOneA.click();
    expect((await firstLessonSave).status()).toBe(200);
    const secondLessonSave = pageB.waitForResponse(response =>
      new URL(response.url()).pathname === '/api/learning-journey' &&
      response.request().method() === 'PATCH',
    );
    await lessonTwoB.click();
    expect((await secondLessonSave).status()).toBe(200);
    await expect(pageB.getByRole('button', {
      name: 'Tandai Pengenalan Materi belum selesai',
    })).toHaveAttribute('aria-pressed', 'true');
    await expect(pageB.getByRole('button', {
      name: 'Tandai Teori dan Konsep Dasar belum selesai',
    })).toHaveAttribute('aria-pressed', 'true');

    await waitForJourneyRead(pageA, '/bimtek/sipil-gedung-1');
    await expect(pageA.getByRole('button', {
      name: 'Tandai Pengenalan Materi belum selesai',
    })).toHaveAttribute('aria-pressed', 'true');
    await expect(pageA.getByRole('button', {
      name: 'Tandai Teori dan Konsep Dasar belum selesai',
    })).toHaveAttribute('aria-pressed', 'true');

    await pageA.route(journeyUrl, route => {
      if (route.request().method() === 'PATCH') return route.abort();
      return route.continue();
    });
    await waitForJourneyRead(pageA, '/bimtek');
    const offlineModule = pageA.getByRole('button', {
      name: /Tandai selesai:.*Struktur Beton Bertulang/i,
    });
    const failedSave = pageA.waitForRequest(request =>
      new URL(request.url()).pathname === '/api/learning-journey' &&
      request.method() === 'PATCH',
    );
    await offlineModule.click();
    await failedSave;
    await expect(pageA.getByRole('alert')).toContainText('Progres belum tersinkron');
    await expect(offlineModule).toHaveAttribute('aria-pressed', 'true');

    await waitForJourneyRead(pageB, '/bimtek');
    await expect(pageB.getByRole('button', {
      name: /Tandai selesai:.*Struktur Beton Bertulang/i,
    })).toHaveAttribute('aria-pressed', 'false');
    await pageA.unroute(journeyUrl);
    await pageA.goto('/alur-belajar');
    await expect(pageA.getByTestId('button-journey-sync')).toBeVisible();
    await pageA.getByTestId('button-journey-sync').click();
    await expect(pageA.getByTestId('journey-sync-success')).toContainText('Progres berhasil disimpan');

    const syncedA = await client.execute({
      sql: 'SELECT progress FROM learning_journey_progress WHERE user_id = ?',
      args: [accountA.id],
    });
    expect(JSON.parse(String(syncedA.rows[0].progress)).modules['sipil-gedung-2'].completed).toBe(true);
    await waitForJourneyRead(pageB, '/bimtek');
    await expect(pageB.getByRole('button', {
      name: /Batalkan tanda selesai:.*Struktur Beton Bertulang/i,
    })).toHaveAttribute('aria-pressed', 'true');

    const expiredSessionA = await pageA.evaluate(() => localStorage.getItem('sessionId'));
    const expiredSessionB = await pageB.evaluate(() => localStorage.getItem('sessionId'));
    expect(expiredSessionA).toBeTruthy();
    expect(expiredSessionB).toBeTruthy();
    await client.batch([
      {
        sql: 'UPDATE sessions SET expires_at = ? WHERE id IN (?, ?)',
        args: ['2000-01-01T00:00:00.000Z', expiredSessionA, expiredSessionB],
      },
    ], 'write');
    await Promise.all([pageA.reload(), pageB.reload()]);
    await expect.poll(() => pageA.evaluate(() => localStorage.getItem('sessionId'))).toBeNull();
    await expect.poll(() => pageB.evaluate(() => localStorage.getItem('sessionId'))).toBeNull();
    const expiredStatuses = await Promise.all([pageA, pageB].map(page =>
      page.evaluate(async sessionId => {
        const response = await fetch('/api/learning-journey', {
          headers: { 'x-session-id': sessionId ?? '' },
        });
        return response.status;
      }, page === pageA ? expiredSessionA : expiredSessionB),
    ));
    expect(expiredStatuses).toEqual([401, 401]);
  } finally {
    try {
      if (accountA && accountB) {
        await client.batch([
          {
            sql: 'DELETE FROM learning_journey_progress WHERE user_id IN (?, ?)',
            args: [accountA.id, accountB.id],
          },
          { sql: 'DELETE FROM sessions WHERE user_id IN (?, ?)', args: [accountA.id, accountB.id] },
          { sql: 'DELETE FROM users WHERE id IN (?, ?)', args: [accountA.id, accountB.id] },
        ], 'write');
      } else if (accountA) {
        await client.batch([
          { sql: 'DELETE FROM learning_journey_progress WHERE user_id = ?', args: [accountA.id] },
          { sql: 'DELETE FROM sessions WHERE user_id = ?', args: [accountA.id] },
          { sql: 'DELETE FROM users WHERE id = ?', args: [accountA.id] },
        ], 'write');
      }
    } finally {
      try {
        await Promise.all([
          contextA?.close().catch(() => undefined),
          contextB?.close().catch(() => undefined),
        ]);
      } finally {
        client.close();
      }
    }
  }
});
