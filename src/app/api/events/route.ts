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

export async function GET() {
  try {
    const { db: database, schema: sch } = await getDb();
    const events = await database.select().from(sch.offlineEvents);
    return NextResponse.json(events);
  } catch (e) {
    return NextResponse.json({ error: 'Database not available' }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    const { db: database, schema: sch } = await getDb();
    const { eq } = await import('drizzle-orm');
    
    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'register': {
        const event = await database.select().from(sch.offlineEvents).where(eq(sch.offlineEvents.id, data.eventId));
        if (!event[0] || (event[0].registered ?? 0) >= event[0].capacity) {
          return NextResponse.json({ success: false, message: 'Event full or not found' }, { status: 400 });
        }
        
        const existing = await database.select().from(sch.eventParticipants).where(eq(sch.eventParticipants.email, data.participant.email));
        if (existing.length > 0) {
          return NextResponse.json({ success: false, message: 'Already registered' }, { status: 400 });
        }

        await database.insert(sch.eventParticipants).values({
          ...data.participant,
          eventId: data.eventId,
          status: 'registered',
          registeredAt: new Date().toISOString(),
        });

        const newRegistered = (event[0].registered ?? 0) + 1;
        const newStatus = newRegistered >= event[0].capacity ? 'full' : 'open';
        await database.update(sch.offlineEvents).set({ registered: newRegistered, status: newStatus }).where(eq(sch.offlineEvents.id, data.eventId));

        return NextResponse.json({ success: true });
      }

      case 'create': {
        await database.insert(sch.offlineEvents).values(data.event);
        return NextResponse.json({ success: true });
      }

      case 'delete': {
        await database.delete(sch.offlineEvents).where(eq(sch.offlineEvents.id, data.eventId));
        return NextResponse.json({ success: true });
      }

      case 'markAttendance': {
        await database.update(sch.eventParticipants).set({ status: 'attended' }).where(eq(sch.eventParticipants.id, data.participantId));
        return NextResponse.json({ success: true });
      }

      case 'cancelRegistration': {
        await database.delete(sch.eventParticipants).where(eq(sch.eventParticipants.id, data.participantId));
        const event = await database.select().from(sch.offlineEvents).where(eq(sch.offlineEvents.id, data.eventId));
        if (event[0]) {
          const newRegistered = Math.max(0, (event[0].registered ?? 0) - 1);
          await database.update(sch.offlineEvents).set({ registered: newRegistered, status: 'open' }).where(eq(sch.offlineEvents.id, data.eventId));
        }
        return NextResponse.json({ success: true });
      }

      case 'complete': {
        const event = await database.select().from(sch.offlineEvents).where(eq(sch.offlineEvents.id, data.eventId));
        if (!event[0]) return NextResponse.json({ success: false }, { status: 400 });

        const participants = await database.select().from(sch.eventParticipants).where(eq(sch.eventParticipants.eventId, data.eventId));
        const attended = participants.filter((p: any) => p.status === 'attended');

        const newCerts = attended.map((p: any) => ({
          id: `cert-${Date.now()}-${p.id}`,
          eventId: data.eventId,
          participantId: p.id,
          participantName: p.name,
          eventTitle: event[0].title,
          eventDate: event[0].date,
          instructorName: event[0].instructorName,
          location: event[0].location,
          issuedAt: new Date().toISOString(),
        }));

        if (newCerts.length > 0) {
          await database.insert(sch.certificates).values(newCerts);
        }
        await database.update(sch.offlineEvents).set({ status: 'completed' }).where(eq(sch.offlineEvents.id, data.eventId));

        return NextResponse.json({ success: true, certificatesIssued: newCerts.length });
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (e) {
    return NextResponse.json({ error: 'Database not available' }, { status: 503 });
  }
}
