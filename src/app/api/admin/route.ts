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

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action');
  
  const dbData = await getDb();
  
  if (!dbData) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
  
  const { db, schema } = dbData;
  const { eq, sql, count } = await import('drizzle-orm');
  
  switch (action) {
    case 'stats': {
      const [userCount] = await db.select({ count: count() }).from(schema.users);
      const [eventCount] = await db.select({ count: count() }).from(schema.offlineEvents);
      const [certificateCount] = await db.select({ count: count() }).from(schema.certificates);
      const [progressCount] = await db.select({ count: count() }).from(schema.bimtekProgress);
      const [quizCount] = await db.select({ count: count() }).from(schema.quizScores);
      const [activityCount] = await db.select({ count: count() }).from(schema.activities);
      
      return NextResponse.json({
        stats: {
          users: userCount?.count || 0,
          events: eventCount?.count || 0,
          certificates: certificateCount?.count || 0,
          progress: progressCount?.count || 0,
          quizAttempts: quizCount?.count || 0,
          activities: activityCount?.count || 0,
        }
      });
    }
    
    case 'allUsers': {
      const users = await db.select().from(schema.users);
      return NextResponse.json({ users });
    }
    
    case 'allEvents': {
      const events = await db.select().from(schema.offlineEvents);
      const participants = await db.select().from(schema.eventParticipants);
      const enrichedEvents = events.map((e: any) => ({
        ...e,
        participantCount: participants.filter((p: any) => p.eventId === e.id).length,
      }));
      return NextResponse.json({ events: enrichedEvents });
    }
    
    case 'allCertificates': {
      const certs = await db.select().from(schema.certificates);
      return NextResponse.json({ certificates: certs });
    }
    
    case 'allProgress': {
      const progress = await db.select().from(schema.bimtekProgress);
      return NextResponse.json({ progress });
    }
    
    case 'allQuizScores': {
      const scores = await db.select().from(schema.quizScores);
      return NextResponse.json({ quizScores: scores });
    }
    
    case 'allActivities': {
      const activities = await db.select()
        .from(schema.activities)
        .orderBy(sql`${schema.activities.timestamp} DESC`)
        .limit(100);
      return NextResponse.json({ activities });
    }
    
    case 'searchUsers': {
      const query = searchParams.get('q')?.toLowerCase() || '';
      const users = await db.select().from(schema.users);
      const filtered = users.filter((u: any) => 
        u.name.toLowerCase().includes(query) || 
        u.email.toLowerCase().includes(query)
      );
      return NextResponse.json({ users: filtered });
    }
    
    default:
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action');
  
  const body = await request.json();
  
  const dbData = await getDb();
  
  if (!dbData) {
    return NextResponse.json({ success: false, message: 'Database unavailable' }, { status: 503 });
  }
  
  const { db, schema } = dbData;
  const { eq } = await import('drizzle-orm');
  
  switch (action) {
    case 'deleteEvent': {
      const { eventId } = body;
      await db.delete(schema.offlineEvents).where(eq(schema.offlineEvents.id, eventId));
      await db.delete(schema.eventParticipants).where(eq(schema.eventParticipants.eventId, eventId));
      return NextResponse.json({ success: true });
    }
    
    case 'deleteCertificate': {
      const { certId } = body;
      await db.delete(schema.certificates).where(eq(schema.certificates.id, certId));
      return NextResponse.json({ success: true });
    }
    
    case 'resetUserProgress': {
      const { userId } = body;
      await db.delete(schema.bimtekProgress).where(eq(schema.bimtekProgress.moduleId, userId as any));
      await db.delete(schema.bimtekLessons).where(eq(schema.bimtekLessons.moduleId, userId as any));
      await db.delete(schema.quizScores).where(eq(schema.quizScores.id, userId as any));
      return NextResponse.json({ success: true });
    }
    
    case 'createEvent': {
      const event = body.event;
      await db.insert(schema.offlineEvents).values(event);
      return NextResponse.json({ success: true });
    }
    
    case 'updateEvent': {
      const { eventId, updates } = body;
      await db.update(schema.offlineEvents).set(updates).where(eq(schema.offlineEvents.id, eventId));
      return NextResponse.json({ success: true });
    }
    
    default:
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  }
}
