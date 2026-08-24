import { NextRequest, NextResponse } from 'next/server';

// ── Input limits ──────────────────────────────────────────────────────────────
const MAX_JABATAN_LENGTH = 120;
const MAX_NAME_LENGTH = 120;
const MAX_PENDIDIKAN_LENGTH = 60;
const MAX_PENGALAMAN_LENGTH = 200;
const MAX_UNIT_PENGALAMAN_LENGTH = 1000;
const MAX_UNITS = 10;

// ── In-memory rate limiter ────────────────────────────────────────────────────
// Keyed by userId; allows MAX_REQUESTS per WINDOW_MS.
const MAX_REQUESTS = 10;
const WINDOW_MS = 60_000; // 1 minute
const rateLimitMap = new Map<string, { count: number; windowStart: number }>();

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now - entry.windowStart > WINDOW_MS) {
    rateLimitMap.set(key, { count: 1, windowStart: now });
    return false;
  }
  if (entry.count >= MAX_REQUESTS) return true;
  entry.count += 1;
  return false;
}

// Prune stale entries every 2 minutes
setInterval(() => {
  const cutoff = Date.now() - WINDOW_MS;
  for (const [key, entry] of rateLimitMap.entries()) {
    if (entry.windowStart < cutoff) rateLimitMap.delete(key);
  }
}, 120_000);

// ── Session resolver ──────────────────────────────────────────────────────────
async function getAuthenticatedUser(request: NextRequest) {
  const sessionId =
    request.cookies.get('sessionId')?.value ||
    request.headers.get('x-session-id') ||
    null;
  if (!sessionId) return null;

  try {
    const { db } = await import('@/db');
    const schema = await import('@/db/schema');
    const { eq } = await import('drizzle-orm');

    const sessions = await db
      .select()
      .from(schema.sessions)
      .where(eq(schema.sessions.id, sessionId));
    if (!sessions[0]) return null;
    if (new Date(sessions[0].expiresAt) <= new Date()) return null;

    const users = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, sessions[0].userId));
    return users[0] ?? null;
  } catch {
    return null;
  }
}

function truncate(val: unknown, max: number): string {
  if (typeof val !== 'string') return '';
  return val.slice(0, max);
}

export async function POST(request: NextRequest) {
  const authUser = await getAuthenticatedUser(request);
  if (!authUser) {
    return NextResponse.json({ error: 'Autentikasi diperlukan' }, { status: 401 });
  }

  if (isRateLimited(authUser.id)) {
    return NextResponse.json(
      { error: 'Terlalu banyak permintaan. Coba lagi dalam semenit.' },
      { status: 429 },
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'AI tidak tersedia' }, { status: 503 });

  const body = await request.json();
  const { action } = body;

  if (action === 'getUnits') {
    const jabatan = truncate(body.jabatan, MAX_JABATAN_LENGTH);
    const level = truncate(body.level, MAX_PENDIDIKAN_LENGTH);
    if (!jabatan) return NextResponse.json({ error: 'Jabatan diperlukan' }, { status: 400 });

    const prompt = `Kamu adalah pakar SKKNI (Standar Kompetensi Kerja Nasional Indonesia) bidang konstruksi.
Berikan daftar Unit Kompetensi (UK) yang relevan untuk jabatan:
- Jabatan: ${jabatan}
- Level: ${level || '-'}

Berdasarkan standar SKKNI / KM PUPR yang berlaku di Indonesia, buat 5-8 unit kompetensi yang paling penting untuk jabatan ini.

Format JSON:
{
  "units": [
    {
      "kode": "XXX.XX00.000.00",
      "nama": "Nama unit kompetensi",
      "elemen": ["Elemen kompetensi 1", "Elemen kompetensi 2", "Elemen kompetensi 3"]
    }
  ]
}

Kode unit harus mengikuti format SKKNI Indonesia yang nyata. Kembalikan HANYA JSON.`;

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1500,
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
    });

    if (!res.ok) return NextResponse.json({ error: 'AI gagal merespons' }, { status: 502 });
    const data = await res.json();
    try {
      return NextResponse.json(JSON.parse(data.choices[0]?.message?.content ?? '{}'));
    } catch {
      return NextResponse.json({ error: 'Format respons tidak valid' }, { status: 500 });
    }
  }

  if (action === 'generateDraft') {
    const jabatan = truncate(body.jabatan, MAX_JABATAN_LENGTH);
    const level = truncate(body.level, MAX_PENDIDIKAN_LENGTH);
    const namaAsesi = truncate(body.namaAsesi, MAX_NAME_LENGTH);
    const pendidikan = truncate(body.pendidikan, MAX_PENDIDIKAN_LENGTH);
    const pengalaman = truncate(body.pengalaman, MAX_PENGALAMAN_LENGTH);
    const rawUnits = Array.isArray(body.units) ? body.units.slice(0, MAX_UNITS) : [];

    if (!jabatan || !rawUnits.length) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    const units = rawUnits.map((u: unknown) => {
      const unit = u as Record<string, unknown>;
      return {
        kode: truncate(unit.kode, 30),
        nama: truncate(unit.nama, 200),
        pengalaman: truncate(unit.pengalaman, MAX_UNIT_PENGALAMAN_LENGTH),
      };
    });

    const unitList = units
      .map((u: { kode: string; nama: string; pengalaman: string }, i: number) =>
        `${i + 1}. [${u.kode}] ${u.nama}\n   Pengalaman kandidat: ${u.pengalaman || '(tidak diisi)'}`
      )
      .join('\n\n');

    const prompt = `Kamu adalah asesor BNSP berpengalaman yang membantu kandidat mengisi FR.APL.02 Asesmen Mandiri.

Data kandidat:
- Nama: ${namaAsesi || 'Kandidat SKK'}
- Jabatan yang diajukan: ${jabatan}
- Level: ${level || '-'}
- Pendidikan terakhir: ${pendidikan || 'tidak disebutkan'}
- Total pengalaman: ${pengalaman || 'tidak disebutkan'}

Unit Kompetensi dan pengalaman kandidat:
${unitList}

Tugas: Buat draft pernyataan mandiri FR.APL.02 yang profesional dan siap diajukan ke LSP.
Untuk setiap unit kompetensi, buat:
1. Pernyataan kompetensi formal dalam Bahasa Indonesia baku
2. Daftar bukti konkret yang disarankan berdasarkan pengalaman yang diceritakan
3. Keterangan "Kompeten" atau "Belum Kompeten" (berdasarkan apakah pengalaman relevan disebutkan)

Format JSON:
{
  "namaAsesi": "...",
  "jabatan": "...",
  "tanggalDibuat": "${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}",
  "ringkasan": "Paragraf singkat profil kompetensi kandidat berdasarkan pengalaman yang diceritakan",
  "units": [
    {
      "kode": "...",
      "nama": "...",
      "pernyataan": "Pernyataan mandiri formal bahwa saya kompeten dalam ... karena ...",
      "buktKompetensi": ["Dokumen 1", "Dokumen 2", "Referensi proyek"],
      "statusMandiri": "Kompeten / Belum Kompeten",
      "catatan": "Catatan tambahan untuk asesor"
    }
  ],
  "disclaimer": "Pernyataan ini dibuat secara mandiri oleh kandidat dan akan diverifikasi oleh asesor BNSP yang ditunjuk LSP."
}
Kembalikan HANYA JSON.`;

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 3000,
        temperature: 0.35,
        response_format: { type: 'json_object' },
      }),
    });

    if (!res.ok) return NextResponse.json({ error: 'AI gagal merespons' }, { status: 502 });
    const data = await res.json();
    try {
      return NextResponse.json(JSON.parse(data.choices[0]?.message?.content ?? '{}'));
    } catch {
      return NextResponse.json({ error: 'Format respons tidak valid' }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Action tidak dikenal' }, { status: 400 });
}
