import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import type { db as applicationDb } from '@/db';
import * as schema from '@/db/schema';

export type AdminDatabase = typeof applicationDb;

/** Trust only an unexpired server-side session and its current user's role. */
export async function requireAdmin(request: NextRequest, db: AdminDatabase): Promise<
  { actor: { id: string; role: string | null }; response?: never } |
  { actor?: never; response: NextResponse }
> {
  const sessionId = request.headers.get('x-session-id') || request.cookies.get('sessionId')?.value;
  const unauthenticated = () => ({
    response: NextResponse.json(
      { success: false, message: 'Silakan masuk kembali.' }, { status: 401 },
    ),
  });
  if (!sessionId) return unauthenticated();
  const [session] = await db.select().from(schema.sessions).where(eq(schema.sessions.id, sessionId)).limit(1);
  const expiresAt = session ? new Date(session.expiresAt).getTime() : NaN;
  if (!session || !Number.isFinite(expiresAt) || expiresAt <= Date.now()) return unauthenticated();
  const [actor] = await db.select({ id: schema.users.id, role: schema.users.role })
    .from(schema.users).where(eq(schema.users.id, session.userId)).limit(1);
  if (!actor) return unauthenticated();
  if (actor.role !== 'admin') {
    return { response: NextResponse.json({ success: false, message: 'Akses ditolak.' }, { status: 403 }) };
  }
  return { actor };
}
