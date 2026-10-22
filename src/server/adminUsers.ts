import { randomUUID } from 'node:crypto';
import { and, asc, count, eq, gte, ne, or } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import * as schema from '@/db/schema';
import { type AdminDatabase, requireAdmin } from './adminAuthorization';

function audit(actor: string, action: string, details: Record<string, unknown> = {}) {
  return {
    id: randomUUID(),
    type: 'admin-audit',
    title: action,
    description: 'Operasi administrasi pengguna',
    timestamp: new Date(),
    metadata: JSON.stringify({ actor, action, ...details }),
  };
}

/** Both public route aliases use the same authorization, projection and limit. */
export async function listAdminUsers(request: NextRequest, db: AdminDatabase, input?: Record<string, unknown>) {
  const auth = await requireAdmin(request, db);
  if (!auth.actor) return auth.response;
  const params = request.nextUrl.searchParams;
  const value = (key: string) => input?.[key] ?? params.get(key);
  const limit = Number(value('limit') ?? 25);
  const offset = Number(value('offset') ?? 0);
  const q = value('q') ?? '';
  if (!Number.isSafeInteger(limit) || limit < 1 || !Number.isSafeInteger(offset) ||
      offset < 0 || offset > 100_000 || typeof q !== 'string' || q.length > 200) {
    return NextResponse.json({ message: 'Parameter daftar pengguna tidak valid.' }, { status: 400 });
  }
  const boundedLimit = Math.min(limit, 100);
  const query = q.trim().replace(/[\\%_]/g, '\\$&');
  // LIKE uses an explicit escape clause so wildcard input cannot expand the result set.
  const { sql } = await import('drizzle-orm');
  const where = query ? or(
    sql`${schema.users.name} LIKE ${`%${query}%`} ESCAPE '\\'`,
    sql`${schema.users.email} LIKE ${`%${query}%`} ESCAPE '\\'`,
  ) : undefined;
  const result = await db.transaction(async tx => {
    const users = await tx.select({
      id: schema.users.id, name: schema.users.name, email: schema.users.email,
      role: schema.users.role, company: schema.users.company,
      position: schema.users.position, createdAt: schema.users.createdAt,
    }).from(schema.users).where(where).orderBy(asc(schema.users.id)).limit(boundedLimit).offset(offset);
    const [total] = await tx.select({ value: count() }).from(schema.users).where(where);
    const [recent] = await tx.select({ value: count() }).from(schema.users).where(and(
      where, gte(schema.users.createdAt, new Date(Date.now() - 30 * 86400000).toISOString()),
    ));
    await tx.insert(schema.activities).values(audit(auth.actor.id, 'users.list', { limit: boundedLimit, offset }));
    return { users, total: total.value, recentUsers: recent.value, limit: boundedLimit, offset };
  });
  return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } });
}

export async function changeAdminUserRole(request: NextRequest, db: AdminDatabase, body: Record<string, unknown>) {
  const auth = await requireAdmin(request, db);
  if (!auth.actor) return auth.response;
  const { userId, role } = body;
  if (typeof userId !== 'string' || !userId.trim() ||
      typeof role !== 'string' || !['user', 'instructor', 'admin'].includes(role)) {
    return NextResponse.json({ success: false, message: 'Pengguna atau peran tidak valid.' }, { status: 400 });
  }
  if (userId === auth.actor.id) {
    return NextResponse.json({ success: false, message: 'Peran akun sendiri tidak boleh diubah.' }, { status: 403 });
  }
  // Transaction plus conditional update protects against concurrent admin promotion/demotion.
  return db.transaction(async tx => {
    const [target] = await tx.select({ role: schema.users.role }).from(schema.users).where(eq(schema.users.id, userId));
    if (!target) return NextResponse.json({ success: false, message: 'Pengguna tidak ditemukan.' }, { status: 404 });
    if (target.role === 'admin') {
      return NextResponse.json({ success: false, message: 'Peran akun admin tidak boleh diubah pada tahap ini.' }, { status: 403 });
    }
    const updated = await tx.update(schema.users).set({ role, updatedAt: new Date().toISOString() })
      .where(and(eq(schema.users.id, userId), ne(schema.users.role, 'admin'))).returning({ id: schema.users.id });
    if (!updated.length) return NextResponse.json({ success: false, message: 'Data berubah. Muat ulang daftar.' }, { status: 409 });
    await tx.insert(schema.activities).values(audit(auth.actor.id, 'users.role.change', {
      target: userId, from: target.role, to: role,
    }));
    // Existing sessions remain; every admin operation re-reads the current role.
    return NextResponse.json({ success: true });
  });
}

export async function disabledAccountDeletion(request: NextRequest, db: AdminDatabase) {
  const auth = await requireAdmin(request, db);
  if (!auth.actor) return auth.response;
  return NextResponse.json({
    success: false, message: 'Penghapusan akun dinonaktifkan sementara.',
  }, { status: 403 });
}
