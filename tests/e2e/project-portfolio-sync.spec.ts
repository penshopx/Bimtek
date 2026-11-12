import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { createClient, type Client } from '@libsql/client';
import { expect, test, type Page } from '@playwright/test';

type TestAccount = { id: string; email: string; password: string };

async function login(page: Page, account: TestAccount) {
  await page.goto('/login');
  await page.locator('input[type="email"]').fill(account.email);
  await page.locator('input[type="password"]').fill(account.password);
  await page.getByRole('button', { name: 'Masuk', exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  const skipProfileSetup = page.getByRole('button', { name: 'Lewati untuk sekarang', exact: true });
  if (await skipProfileSetup.isVisible().catch(() => false)) await skipProfileSetup.click();
}

async function openProjects(page: Page) {
  const listResponse = page.waitForResponse(response =>
    new URL(response.url()).pathname === '/api/ruang-proyek' &&
    response.request().method() === 'GET',
  );
  await page.goto('/ruang-proyek');
  expect((await listResponse).status()).toBe(200);
  await expect(page.getByRole('heading', { name: 'Ruang Proyek', exact: true })).toBeVisible();
}

test('Ruang Proyek terpisah antar akun dan tersinkron setelah akun yang sama masuk di browser kedua', async ({
  browser, request,
}) => {
  const client: Client = createClient({ url: `file:${path.resolve('.data/app.db')}` });
  let accountA: TestAccount | undefined;
  let accountB: TestAccount | undefined;
  let contextA: Awaited<ReturnType<typeof browser.newContext>> | undefined;
  let contextB: Awaited<ReturnType<typeof browser.newContext>> | undefined;

  async function register(label: string): Promise<TestAccount> {
    const email = `project-portfolio-${label}-${randomUUID()}@example.invalid`;
    const password = `${randomUUID()}-Aa1`;
    const response = await request.post('/api/auth?action=register', {
      data: { name: `E2E proyek ${label}`, email, password },
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
    await openProjects(pageA);
    await expect(pageA.getByText('0 dari 0 proyek', { exact: true })).toBeVisible();

    await pageA.getByRole('button', { name: 'Catat proyek', exact: true }).click();
    const dialogA = pageA.getByRole('dialog');
    await dialogA.getByLabel('Nama proyek').fill('E2E Gedung Latihan A');
    await dialogA.getByLabel('Peran Anda').fill('Site Engineer');
    await dialogA.getByLabel('Ringkasan pekerjaan').fill('Mencatat koordinasi pekerjaan struktur sebagai data uji privat.');
    await dialogA.getByLabel('Hasil dan refleksi pribadi').fill('Catatan lintas browser untuk pengujian.');
    const saveResponse = pageA.waitForResponse(response =>
      new URL(response.url()).pathname === '/api/ruang-proyek' &&
      response.request().method() === 'POST',
    );
    await dialogA.getByRole('button', { name: 'Simpan proyek', exact: true }).click();
    expect((await saveResponse).status()).toBe(201);
    await expect(pageA.getByRole('status')).toContainText('Proyek berhasil ditambahkan.');
    await expect(pageA.getByRole('heading', { name: 'E2E Gedung Latihan A', exact: true })).toBeVisible();

    const savedRow = await client.execute({
      sql: 'SELECT user_id, name FROM project_portfolios WHERE user_id = ?',
      args: [accountA.id],
    });
    expect(savedRow.rows).toHaveLength(1);
    expect(savedRow.rows[0]).toMatchObject({ user_id: accountA.id, name: 'E2E Gedung Latihan A' });

    await login(pageB, accountB);
    await openProjects(pageB);
    await expect(pageB.getByText('0 dari 0 proyek', { exact: true })).toBeVisible();
    await expect(pageB.getByRole('heading', { name: 'E2E Gedung Latihan A', exact: true })).toHaveCount(0);
    const accountBRows = await client.execute({
      sql: 'SELECT id FROM project_portfolios WHERE user_id = ?',
      args: [accountB.id],
    });
    expect(accountBRows.rows).toHaveLength(0);

    await pageB.getByRole('button', { name: 'Keluar', exact: true }).click();
    await expect(pageB).toHaveURL('/');
    await login(pageB, accountA);
    await openProjects(pageB);
    await expect(pageB.getByRole('heading', { name: 'E2E Gedung Latihan A', exact: true })).toBeVisible();
    await expect(pageB.getByText('1 dari 1 proyek', { exact: true })).toBeVisible();

    await pageA.reload();
    await expect(pageA.getByRole('heading', { name: 'E2E Gedung Latihan A', exact: true })).toBeVisible();

    const expiredSessionIds = await Promise.all([pageA, pageB].map(page =>
      page.evaluate(() => localStorage.getItem('sessionId')),
    ));
    expect(expiredSessionIds[0]).toBeTruthy();
    expect(expiredSessionIds[1]).toBeTruthy();
    expect(expiredSessionIds[0]).not.toBe(expiredSessionIds[1]);

    await client.execute({
      sql: 'UPDATE sessions SET expires_at = ? WHERE id IN (?, ?)',
      args: ['2000-01-01T00:00:00.000Z', expiredSessionIds[0], expiredSessionIds[1]],
    });
    const rejectedStatuses = await Promise.all([pageA, pageB].map((page, index) =>
      page.evaluate(async sessionId => {
        const response = await fetch('/api/ruang-proyek', {
          headers: { 'x-session-id': sessionId ?? '' },
        });
        return response.status;
      }, expiredSessionIds[index]),
    ));
    expect(rejectedStatuses).toEqual([401, 401]);

    await Promise.all([pageA.reload(), pageB.reload()]);
    await expect.poll(() => pageA.evaluate(() => localStorage.getItem('sessionId'))).toBeNull();
    await expect.poll(() => pageB.evaluate(() => localStorage.getItem('sessionId'))).toBeNull();
    await expect(pageA.getByRole('link', { name: 'Masuk ke akun' })).toBeVisible();
    await expect(pageB.getByRole('link', { name: 'Masuk ke akun' })).toBeVisible();
  } finally {
    try {
      if (accountA && accountB) {
        await client.batch([
          {
            sql: 'DELETE FROM project_portfolios WHERE user_id IN (?, ?)',
            args: [accountA.id, accountB.id],
          },
          { sql: 'DELETE FROM sessions WHERE user_id IN (?, ?)', args: [accountA.id, accountB.id] },
          { sql: 'DELETE FROM users WHERE id IN (?, ?)', args: [accountA.id, accountB.id] },
        ], 'write');
      } else if (accountA) {
        await client.batch([
          { sql: 'DELETE FROM project_portfolios WHERE user_id = ?', args: [accountA.id] },
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
