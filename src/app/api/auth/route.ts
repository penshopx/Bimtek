import { NextRequest, NextResponse } from 'next/server';
import { changeAdminUserRole, disabledAccountDeletion, listAdminUsers } from '@/server/adminUsers';

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

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action');
  
  if (action === 'me') {
    const sessionId = request.headers.get('x-session-id') || request.cookies.get('sessionId')?.value;
    if (!sessionId) {
      return NextResponse.json({ user: null });
    }
    
    const dbData = await getDb();
    if (!dbData) {
      return NextResponse.json({ user: null });
    }
    
    const { db, schema } = dbData;
    const { eq } = await import('drizzle-orm');
    
    const sessions = await db.select().from(schema.sessions).where(eq(schema.sessions.id, sessionId));
    if (!sessions[0] || new Date(sessions[0].expiresAt) <= new Date()) {
      return NextResponse.json({ user: null });
    }
    
    const users = await db.select().from(schema.users).where(eq(schema.users.id, sessions[0].userId));
    if (!users[0]) {
      return NextResponse.json({ user: null });
    }
    
    const user = users[0];
    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        company: user.company,
        position: user.position,
        bidang: user.bidang,
        jabatanSkk: user.jabatanSkk,
        kualifikasiSkk: user.kualifikasiSkk,
        skkCertificateLevel: user.skkCertificateLevel,
        skkIssuedAt: user.skkIssuedAt,
        createdAt: user.createdAt,
      }
    });
  }
  
  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
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
  const { eq, and } = await import('drizzle-orm');
  
  switch (action) {
    case 'register': {
      const { name, email, password } = body;
      
      const existing = await db.select().from(schema.users).where(eq(schema.users.email, email));
      if (existing.length > 0) {
        return NextResponse.json({ success: false, message: 'Email sudah terdaftar' }, { status: 400 });
      }
      
      const userId = generateId();
      const now = new Date().toISOString();
      
      await db.insert(schema.users).values({
        id: userId,
        name,
        email,
        passwordHash: simpleHash(password),
        role: 'user',
        createdAt: now,
        updatedAt: now,
      });
      
      const sessionId = generateId();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      
      await db.insert(schema.sessions).values({
        id: sessionId,
        userId,
        expiresAt,
        createdAt: now,
      });
      
      return NextResponse.json({
        success: true,
        user: { id: userId, name, email, role: 'user', createdAt: now },
        sessionId,
      });
    }
    
    case 'login': {
      const { email, password } = body;
      
      const users = await db.select().from(schema.users).where(eq(schema.users.email, email));
      const user = users[0];
      
      if (!user || user.passwordHash !== simpleHash(password)) {
        return NextResponse.json({ success: false, message: 'Email atau password salah' }, { status: 401 });
      }
      
      const sessionId = generateId();
      const now = new Date().toISOString();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      
      await db.insert(schema.sessions).values({
        id: sessionId,
        userId: user.id,
        expiresAt,
        createdAt: now,
      });
      
      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          phone: user.phone,
          company: user.company,
          position: user.position,
          bidang: user.bidang,
          jabatanSkk: user.jabatanSkk,
          kualifikasiSkk: user.kualifikasiSkk,
          skkCertificateLevel: user.skkCertificateLevel,
          skkIssuedAt: user.skkIssuedAt,
          createdAt: user.createdAt,
        },
        sessionId,
      });
    }
    
    case 'logout': {
      const { sessionId } = body;
      if (sessionId) {
        await db.delete(schema.sessions).where(eq(schema.sessions.id, sessionId));
      }
      return NextResponse.json({ success: true });
    }
    
    case 'verify': {
      const { sessionId } = body;
      const sessions = await db.select().from(schema.sessions).where(eq(schema.sessions.id, sessionId));
      
      if (!sessions[0] || new Date(sessions[0].expiresAt) <= new Date()) {
        return NextResponse.json({ success: false, message: 'Session invalid or expired' }, { status: 401 });
      }
      
      const users = await db.select().from(schema.users).where(eq(schema.users.id, sessions[0].userId));
      const user = users[0];
      
      if (!user) {
        return NextResponse.json({ success: false, message: 'User not found' }, { status: 401 });
      }
      
      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          phone: user.phone,
          company: user.company,
          position: user.position,
          bidang: user.bidang,
          jabatanSkk: user.jabatanSkk,
          kualifikasiSkk: user.kualifikasiSkk,
          skkCertificateLevel: user.skkCertificateLevel,
          skkIssuedAt: user.skkIssuedAt,
          createdAt: user.createdAt,
        },
      });
    }
    
    case 'update': {
      const { userId, updates } = body;
      const sessionId = request.headers.get('x-session-id') || request.cookies.get('sessionId')?.value;
      if (!sessionId) {
        return NextResponse.json({ success: false, message: 'Silakan masuk kembali.' }, { status: 401 });
      }
      const [session] = await db.select().from(schema.sessions).where(eq(schema.sessions.id, sessionId));
      if (!session || new Date(session.expiresAt) <= new Date()) {
        return NextResponse.json({ success: false, message: 'Sesi login tidak berlaku.' }, { status: 401 });
      }
      if (userId && userId !== session.userId) {
        return NextResponse.json({ success: false, message: 'Tidak dapat mengubah profil pengguna lain.' }, { status: 403 });
      }
      const allowedFields = new Set([
        'name', 'avatar', 'phone', 'company', 'position', 'bidang', 'jabatanSkk',
        'kualifikasiSkk', 'skkCertificateLevel', 'skkIssuedAt',
      ]);
      if (!updates || typeof updates !== 'object' || Array.isArray(updates)
        || Object.keys(updates).length === 0
        || Object.entries(updates).some(([key, value]) =>
          !allowedFields.has(key) || (value !== null && typeof value !== 'string')
          || (key === 'name' && (typeof value !== 'string' || !value.trim())))) {
        return NextResponse.json({ success: false, message: 'Data pembaruan profil tidak valid.' }, { status: 400 });
      }
      const [user] = await db.select().from(schema.users).where(eq(schema.users.id, session.userId));
      if (!user) {
        return NextResponse.json({ success: false, message: 'Pengguna tidak ditemukan.' }, { status: 401 });
      }
      await db.update(schema.users)
        .set({ ...updates, updatedAt: new Date().toISOString() })
        .where(eq(schema.users.id, session.userId));
      
      return NextResponse.json({ success: true });
    }
    
    case 'getAllUsers': {
      return listAdminUsers(request, db, body);
    }
    
    case 'updateUserRole': {
      return changeAdminUserRole(request, db, body);
    }
    
    case 'deleteUser': {
      return disabledAccountDeletion(request, db);
    }
    
    default:
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  }
}
