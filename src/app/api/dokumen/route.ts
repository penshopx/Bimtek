import { NextRequest, NextResponse } from 'next/server';

let db: any;
let schema: any;

async function getDb() {
  if (!db) {
    try {
      const dbModule = await import('@/db');
      db = dbModule.db;
      schema = await import('@/db/schema');
    } catch (e) {
      return null;
    }
  }
  return { db, schema };
}

/**
 * Resolves the effective user identity for checklist isolation.
 *
 * Priority:
 * 1. Authenticated user → userId from the sessions table (via x-session-id header or sessionId cookie).
 * 2. Guest device → device-scoped ID sent by the client as x-device-id (must start with "guest-").
 *
 * Returns null when neither can be established, which callers treat as 401.
 */
async function resolveUserId(request: NextRequest, dbData: any): Promise<string | null> {
  const sessionId = request.headers.get('x-session-id') || request.cookies.get('sessionId')?.value;
  if (sessionId && dbData) {
    const { db, schema } = dbData;
    const { eq } = await import('drizzle-orm');
    const sessions = await db.select().from(schema.sessions).where(eq(schema.sessions.id, sessionId));
    if (sessions[0]) {
      return sessions[0].userId;
    }
  }
  // Fall back to a device-scoped guest ID supplied by the client
  const deviceId = request.headers.get('x-device-id');
  if (deviceId && deviceId.startsWith('guest-')) {
    return deviceId;
  }
  return null;
}

export async function GET(request: NextRequest) {
  const jabatanId = request.nextUrl.searchParams.get('jabatan');
  if (!jabatanId) {
    return NextResponse.json({ error: 'jabatan required' }, { status: 400 });
  }

  const dbData = await getDb();
  if (!dbData) {
    return NextResponse.json({ items: [] });
  }

  const userId = await resolveUserId(request, dbData);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { db, schema } = dbData;
  const { eq, and } = await import('drizzle-orm');

  const items = await db
    .select()
    .from(schema.documentChecklist)
    .where(
      and(
        eq(schema.documentChecklist.userId, userId),
        eq(schema.documentChecklist.jabatanId, jabatanId),
      ),
    );

  return NextResponse.json({ items });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { jabatanId, documentId, checked, na, note } = body;

  if (!jabatanId || !documentId) {
    return NextResponse.json({ error: 'jabatanId and documentId required' }, { status: 400 });
  }

  const dbData = await getDb();
  if (!dbData) {
    return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 503 });
  }

  const userId = await resolveUserId(request, dbData);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { db, schema } = dbData;
  const { eq } = await import('drizzle-orm');

  const id = `dc-${userId}-${jabatanId}-${documentId}`;

  const existing = await db
    .select()
    .from(schema.documentChecklist)
    .where(eq(schema.documentChecklist.id, id));

  const now = new Date().toISOString();

  // Build the field update set.
  // When both checked and na are provided (e.g. a full reset), update both together
  // so a single request is atomic and avoids insert races on new rows.
  // When only na is provided: setting na=true clears checked; clearing na leaves checked alone.
  // When only checked is provided: setting checked=true clears na.
  // When only note is provided: update only the note field.
  let fields: Record<string, unknown>;
  if (note !== undefined && checked === undefined && na === undefined) {
    // Note-only update: just persist the note text
    fields = { note: note ?? null };
  } else if (na !== undefined && checked !== undefined) {
    // Atomic reset: both fields explicitly provided
    fields = {
      checked: checked ?? false,
      checkedAt: checked ? now : null,
      na: na ?? false,
    };
  } else if (na !== undefined) {
    // N/A toggle: setting na clears checked; clearing na leaves checked alone
    fields = {
      na: na ?? false,
      ...(na ? { checked: false, checkedAt: null } : {}),
    };
  } else {
    // Checked toggle: setting checked clears na
    fields = {
      checked: checked ?? false,
      checkedAt: checked ? now : null,
      ...(checked ? { na: false } : {}),
    };
  }

  if (existing.length > 0) {
    await db
      .update(schema.documentChecklist)
      .set(fields)
      .where(eq(schema.documentChecklist.id, id));
  } else {
    await db.insert(schema.documentChecklist).values({
      id,
      userId,
      jabatanId,
      documentId,
      checked: checked ?? false,
      checkedAt: checked ? now : null,
      na: na ?? false,
      note: note ?? null,
      createdAt: now,
    });
  }

  return NextResponse.json({ success: true });
}
