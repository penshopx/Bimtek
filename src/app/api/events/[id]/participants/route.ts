import { NextResponse } from 'next/server';

let db: any;
let schema: any;

async function getDb() {
  if (!db) {
    try {
      const dbModule = await import('@/db');
      db = dbModule.db;
      schema = await import('@/db/schema');
    } catch (e) {
      throw new Error('Database not available');
    }
  }
  return { db, schema };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require a valid session — participant PII must not be publicly accessible
    const sessionId = request.headers.get('x-session-id');
    if (!sessionId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db: database, schema: sch } = await getDb();
    const { eq } = await import('drizzle-orm');

    // Verify the session exists and belongs to an admin user
    const sessions = await database
      .select()
      .from(sch.sessions)
      .where(eq(sch.sessions.id, sessionId));
    if (!sessions[0]) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const users = await database
      .select()
      .from(sch.users)
      .where(eq(sch.users.id, sessions[0].userId));
    if (!users[0] || users[0].role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const participants = await database
      .select()
      .from(sch.eventParticipants)
      .where(eq(sch.eventParticipants.eventId, id));

    return NextResponse.json(participants);
  } catch (e) {
    return NextResponse.json({ error: 'Database not available' }, { status: 503 });
  }
}
