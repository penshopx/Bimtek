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

export async function POST(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action');
  
  const body = await request.json();
  const { userId } = body;
  
  const dbData = await getDb();
  
  if (!dbData) {
    return NextResponse.json({ success: false, message: 'Database unavailable' }, { status: 503 });
  }
  
  const { db, schema } = dbData;
  const { eq } = await import('drizzle-orm');
  
  switch (action) {
    case 'getProgress': {
      const progress = await db.select().from(schema.bimtekProgress);
      return NextResponse.json({ progress });
    }
    
    case 'saveProgress': {
      const { moduleId, completed, lessonId } = body;
      
      if (lessonId) {
        const existing = await db.select()
          .from(schema.bimtekLessons)
          .where(eq(schema.bimtekLessons.id, `${userId}-${moduleId}-${lessonId}`));
        
        if (existing.length > 0) {
          await db.update(schema.bimtekLessons)
            .set({ completed, completedAt: completed ? new Date().toISOString() : null })
            .where(eq(schema.bimtekLessons.id, `${userId}-${moduleId}-${lessonId}`));
        } else {
          await db.insert(schema.bimtekLessons).values({
            id: `${userId}-${moduleId}-${lessonId}`,
            moduleId,
            lessonId,
            completed,
            completedAt: completed ? new Date().toISOString() : null,
          });
        }
      }
      
      const existingModule = await db.select()
        .from(schema.bimtekProgress)
        .where(eq(schema.bimtekProgress.moduleId, moduleId));
      
      if (existingModule.length > 0) {
        await db.update(schema.bimtekProgress)
          .set({ completedAt: new Date().toISOString(), progress: 100 })
          .where(eq(schema.bimtekProgress.moduleId, moduleId));
      } else {
        await db.insert(schema.bimtekProgress).values({
          moduleId,
          completedAt: new Date().toISOString(),
          progress: 100,
        });
      }
      
      return NextResponse.json({ success: true });
    }
    
    case 'getQuizScores': {
      const scores = await db.select().from(schema.quizScores);
      return NextResponse.json({ scores });
    }
    
    case 'saveQuizScore': {
      const { category, score, totalQuestions } = body;
      await db.insert(schema.quizScores).values({
        id: `quiz-${Date.now()}-${userId}`,
        category,
        score,
        totalQuestions,
        takenAt: new Date(),
      });
      return NextResponse.json({ success: true });
    }
    
    case 'getBookmarks': {
      const bookmarks = await db.select().from(schema.bookmarks);
      return NextResponse.json({ bookmarks });
    }
    
    case 'addBookmark': {
      const { type, itemId, title } = body;
      const existing = await db.select()
        .from(schema.bookmarks)
        .where(eq(schema.bookmarks.itemId, itemId));
      
      if (existing.length === 0) {
        await db.insert(schema.bookmarks).values({
          id: `bm-${Date.now()}-${userId}`,
          type,
          itemId,
          title,
          createdAt: new Date(),
        });
      }
      return NextResponse.json({ success: true });
    }
    
    case 'removeBookmark': {
      const { itemId } = body;
      await db.delete(schema.bookmarks).where(eq(schema.bookmarks.itemId, itemId));
      return NextResponse.json({ success: true });
    }
    
    case 'getActivities': {
      const activities = await db.select()
        .from(schema.activities)
        .orderBy(schema.activities.timestamp);
      return NextResponse.json({ activities: activities.slice(-100).reverse() });
    }
    
    case 'addActivity': {
      const { type, title, description, metadata } = body;
      await db.insert(schema.activities).values({
        id: `act-${Date.now()}-${userId}`,
        type,
        title,
        description,
        metadata: metadata ? JSON.stringify(metadata) : null,
        timestamp: new Date(),
      });
      return NextResponse.json({ success: true });
    }
    
    case 'getAchievements': {
      const achievements = await db.select().from(schema.achievements);
      return NextResponse.json({ achievements });
    }
    
    case 'unlockAchievement': {
      const { achievementId } = body;
      const existing = await db.select()
        .from(schema.achievements)
        .where(eq(schema.achievements.achievementId, achievementId));
      
      if (existing.length === 0) {
        await db.insert(schema.achievements).values({
          id: `ach-${Date.now()}-${userId}`,
          achievementId,
          unlockedAt: new Date(),
        });
      }
      return NextResponse.json({ success: true });
    }
    
    case 'getStreak': {
      const streakData = await db.select().from(schema.streak).limit(1);
      return NextResponse.json({ streak: streakData[0] || null });
    }
    
    case 'updateStreak': {
      const { currentStreak, longestStreak, lastActivityDate, totalDays } = body;
      const existing = await db.select().from(schema.streak).limit(1);
      
      if (existing.length > 0) {
        await db.update(schema.streak)
          .set({ currentStreak, longestStreak, lastActivityDate, totalDays })
          .where(eq(schema.streak.id, existing[0].id));
      } else {
        await db.insert(schema.streak).values({
          currentStreak,
          longestStreak,
          lastActivityDate,
          totalDays,
        });
      }
      return NextResponse.json({ success: true });
    }
    
    case 'getProfile': {
      const profiles = await db.select().from(schema.profile).limit(1);
      return NextResponse.json({ profile: profiles[0] || null });
    }
    
    case 'updateProfile': {
      const { name, email, company, position } = body;
      const existing = await db.select().from(schema.profile).limit(1);
      
      if (existing.length > 0) {
        await db.update(schema.profile)
          .set({ name, email, company, position, updatedAt: new Date() })
          .where(eq(schema.profile.id, existing[0].id));
      } else {
        await db.insert(schema.profile).values({
          name,
          email,
          company,
          position,
        });
      }
      return NextResponse.json({ success: true });
    }
    
    default:
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  }
}
