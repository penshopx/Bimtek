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

// GET /api/quiz?action=questions[&category=...]
// GET /api/quiz?action=categories
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action') ?? 'questions';

  const dbData = await getDb();
  if (!dbData) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }

  const { db, schema } = dbData;
  const { eq } = await import('drizzle-orm');

  switch (action) {
    case 'questions': {
      const category = searchParams.get('category');
      let rows;
      if (category && category !== 'Semua') {
        rows = await db
          .select()
          .from(schema.quizQuestions)
          .where(eq(schema.quizQuestions.category, category));
      } else {
        rows = await db.select().from(schema.quizQuestions);
      }
      // Parse JSON options field
      const questions = rows.map((q: any) => ({
        ...q,
        options: JSON.parse(q.options),
      }));
      return NextResponse.json({ questions });
    }

    case 'categories': {
      const rows = await db.select({ category: schema.quizQuestions.category }).from(schema.quizQuestions);
      const unique = ['Semua', ...Array.from(new Set(rows.map((r: any) => r.category))) as string[]];
      return NextResponse.json({ categories: unique });
    }

    default:
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  }
}

// Quiz mutations are handled exclusively through server actions in src/app/actions/quiz.ts
// which enforce server-side admin session verification. No write operations are exposed here.
export async function POST(_request: NextRequest) {
  return NextResponse.json({ error: 'Not allowed' }, { status: 405 });
}
