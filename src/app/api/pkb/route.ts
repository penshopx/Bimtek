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

async function resolveUser(request: Request) {
  const { db: database, schema: sch } = await getDb();
  const { eq } = await import('drizzle-orm');
  const sessionId = request.headers.get('x-session-id');
  if (!sessionId) return null;
  const sessions = await database.select().from(sch.sessions).where(eq(sch.sessions.id, sessionId));
  if (!sessions[0]) return null;
  const users = await database.select().from(sch.users).where(eq(sch.users.id, sessions[0].userId));
  return users[0] || null;
}

export async function GET(request: Request) {
  try {
    const user = await resolveUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db: database, schema: sch } = await getDb();
    const { eq, desc } = await import('drizzle-orm');

    const activities = await database
      .select()
      .from(sch.pkbActivities)
      .where(eq(sch.pkbActivities.userId, user.id))
      .orderBy(desc(sch.pkbActivities.date));

    return NextResponse.json({ activities });
  } catch (e) {
    return NextResponse.json({ error: 'Database not available' }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await resolveUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db: database, schema: sch } = await getDb();
    const { eq } = await import('drizzle-orm');
    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'add': {
        const { type, title, date, organizer, points, description } = data;
        if (!type || !title || !date || !organizer || points == null) {
          return NextResponse.json({ error: 'Field tidak lengkap' }, { status: 400 });
        }
        const now = new Date().toISOString();
        const id = `pkb-${Date.now()}-${user.id}`;
        await database.insert(sch.pkbActivities).values({
          id,
          userId: user.id,
          type,
          title,
          date,
          organizer,
          points: Number(points),
          description: description || null,
          createdAt: now,
          updatedAt: now,
        });
        return NextResponse.json({ success: true, id });
      }

      case 'update': {
        const { id, type, title, date, organizer, points, description } = data;
        if (!id) return NextResponse.json({ error: 'ID diperlukan' }, { status: 400 });

        // Ensure the activity belongs to the requesting user
        const existing = await database
          .select()
          .from(sch.pkbActivities)
          .where(eq(sch.pkbActivities.id, id));
        if (!existing[0] || existing[0].userId !== user.id) {
          return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        await database
          .update(sch.pkbActivities)
          .set({
            type,
            title,
            date,
            organizer,
            points: Number(points),
            description: description || null,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(sch.pkbActivities.id, id));

        return NextResponse.json({ success: true });
      }

      case 'delete': {
        const { id } = data;
        if (!id) return NextResponse.json({ error: 'ID diperlukan' }, { status: 400 });

        const existing = await database
          .select()
          .from(sch.pkbActivities)
          .where(eq(sch.pkbActivities.id, id));
        if (!existing[0] || existing[0].userId !== user.id) {
          return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        await database.delete(sch.pkbActivities).where(eq(sch.pkbActivities.id, id));
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (e) {
    return NextResponse.json({ error: 'Database not available' }, { status: 503 });
  }
}
