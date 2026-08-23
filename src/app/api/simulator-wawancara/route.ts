import { NextRequest, NextResponse } from 'next/server';

// ── Input limits ─────────────────────────────────────────────────────────────
const VALID_MODES = new Set(['latihan', 'simulasi']);
const VALID_ROLES = new Set(['user', 'assistant']);
const MAX_MESSAGES = 30;
const MAX_MSG_LENGTH = 3000;
const MAX_JABATAN_LENGTH = 100;
const MAX_JENJANG_LENGTH = 60;

// ── In-memory rate limiter ────────────────────────────────────────────────────
// Keyed by userId; allows MAX_REQUESTS per WINDOW_MS.
const MAX_REQUESTS = 20;
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

// Periodically prune stale entries to avoid memory growth
setInterval(() => {
  const cutoff = Date.now() - WINDOW_MS;
  for (const [key, entry] of rateLimitMap.entries()) {
    if (entry.windowStart < cutoff) rateLimitMap.delete(key);
  }
}, 120_000);

// ── Session resolver (same pattern as /api/tools) ────────────────────────────
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

// ── System prompt builder ─────────────────────────────────────────────────────
function buildSystemPrompt(jabatan: string, jenjang: string, mode: 'latihan' | 'simulasi'): string {
  const jabatanLabel = jabatan || 'Ahli Teknik Sipil';
  const jenjangLabel = jenjang || 'Madya (Level 6)';

  if (mode === 'simulasi') {
    return `Kamu adalah Asesor BNSP (Badan Nasional Sertifikasi Profesi) yang berpengalaman, sedang melakukan wawancara kompetensi terstruktur untuk jabatan **${jabatanLabel}** jenjang **${jenjangLabel}**.

## MISI SIMULASI TERSTRUKTUR
Kamu akan mengajukan tepat 5 pertanyaan kompetensi satu per satu. Setiap pertanyaan didasarkan pada unit kompetensi SKKNI relevan untuk jabatan tersebut.

## FORMAT PERTANYAANMU
1. Awali dengan: "**Pertanyaan [N]/5:**" lalu tanyakan pertanyaan berbasis kompetensi.
2. Setelah Asesi menjawab, berikan **feedback singkat** (2-3 kalimat), lalu lanjutkan ke pertanyaan berikutnya.
3. Setelah pertanyaan ke-5 dijawab, berikan **Ringkasan Asesmen** dengan skor (1-5 per pertanyaan) dan catatan peningkatan.

## JENIS PERTANYAAN (gunakan metode STAR: Situation, Task, Action, Result)
- Pengalaman kerja nyata di bidang ${jabatanLabel}
- Pengetahuan teknis unit kompetensi SKKNI
- Penanganan situasi kritis/masalah lapangan
- Koordinasi tim dan kepatuhan regulasi (K3, SNI)
- Pelaporan dan dokumentasi teknis

## FEEDBACK SETELAH JAWABAN
Format: "✅ Poin baik: [apa yang bagus] | ⚠️ Perbaiki: [apa yang kurang spesifik atau perlu ditambahkan]"

## ATURAN
- Bersikap profesional tapi tidak menakutkan
- Gunakan Bahasa Indonesia formal
- JANGAN memberikan pertanyaan berikutnya sampai Asesi menjawab
- Mulai langsung dengan Pertanyaan 1/5

Mulai sekarang dengan menyapa singkat dan langsung ajukan Pertanyaan 1/5.`;
  }

  return `Kamu adalah Asesor BNSP (Badan Nasional Sertifikasi Profesi) yang berpengalaman, membantu Asesi berlatih wawancara kompetensi untuk jabatan **${jabatanLabel}** jenjang **${jenjangLabel}**.

## MODE LATIHAN BEBAS
Asesi bebas berlatih menjawab pertanyaan kompetensi. Kamu berperan sebagai asesor yang:
- Mengajukan pertanyaan berbasis unit kompetensi SKKNI untuk jabatan ${jabatanLabel}
- Memberikan feedback konstruktif setelah setiap jawaban
- Menjelaskan cara memperbaiki jawaban agar lebih kuat dan meyakinkan
- Bisa menjawab pertanyaan Asesi tentang apa yang diharapkan asesor BNSP

## JENIS PERTANYAAN YANG BISA KAMU TANYAKAN
- "Ceritakan pengalaman kamu menangani [situasi teknis relevan]"
- "Bagaimana kamu memastikan [standar/regulasi] terpenuhi di lapangan?"
- "Apa yang kamu lakukan ketika [skenario masalah lapangan]?"
- "Dokumen apa saja yang kamu buat/kelola untuk [pekerjaan tertentu]?"

## FEEDBACK FORMAT
Setelah jawaban Asesi: "✅ Bagus: [poin kuat] | ⚠️ Tambahkan: [yang perlu diperkuat] | 💡 Tips: [saran konkret]"

## ATURAN
- Gunakan Bahasa Indonesia formal
- Bersikap mendorong dan membangun kepercayaan diri
- Jika Asesi bertanya "pertanyaan apa yang sering ditanyakan asesor?", berikan contoh nyata

Mulai dengan menyapa dan tanyakan apakah Asesi siap, lalu ajukan pertanyaan pertama.`;
}

// ── Route handler ─────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  // 1. Auth
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Autentikasi diperlukan' }, { status: 401 });
  }

  // 2. Rate limit (per user)
  if (isRateLimited(String(user.id))) {
    return NextResponse.json(
      { error: 'Terlalu banyak permintaan. Tunggu sebentar lalu coba lagi.' },
      { status: 429 }
    );
  }

  // 3. AI key
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'AI tidak tersedia' }, { status: 503 });
  }

  // 4. Parse & validate body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Request body tidak valid' }, { status: 400 });
  }
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Format permintaan tidak valid' }, { status: 400 });
  }

  const { messages, jabatan = '', jenjang = '', mode = 'latihan' } = body as Record<string, unknown>;

  if (typeof mode !== 'string' || !VALID_MODES.has(mode)) {
    return NextResponse.json({ error: 'Mode tidak valid' }, { status: 400 });
  }
  if (typeof jabatan !== 'string' || jabatan.length > MAX_JABATAN_LENGTH) {
    return NextResponse.json({ error: 'Jabatan tidak valid' }, { status: 400 });
  }
  if (typeof jenjang !== 'string' || jenjang.length > MAX_JENJANG_LENGTH) {
    return NextResponse.json({ error: 'Jenjang tidak valid' }, { status: 400 });
  }
  if (!Array.isArray(messages)) {
    return NextResponse.json({ error: 'Format pesan tidak valid' }, { status: 400 });
  }
  if (messages.length > MAX_MESSAGES) {
    return NextResponse.json({ error: 'Terlalu banyak pesan dalam satu sesi' }, { status: 400 });
  }

  const sanitizedMessages: { role: string; content: string }[] = [];
  for (const msg of messages) {
    if (!msg || typeof msg !== 'object') {
      return NextResponse.json({ error: 'Pesan tidak valid' }, { status: 400 });
    }
    const { role, content } = msg as Record<string, unknown>;
    if (typeof role !== 'string' || !VALID_ROLES.has(role)) {
      return NextResponse.json({ error: 'Role pesan tidak valid' }, { status: 400 });
    }
    if (typeof content !== 'string' || content.length === 0) {
      return NextResponse.json({ error: 'Konten pesan tidak boleh kosong' }, { status: 400 });
    }
    if (content.length > MAX_MSG_LENGTH) {
      return NextResponse.json(
        { error: 'Pesan terlalu panjang (maks 3000 karakter)' },
        { status: 400 }
      );
    }
    sanitizedMessages.push({ role, content });
  }

  // 5. Call OpenAI
  const systemPrompt = buildSystemPrompt(
    jabatan as string,
    jenjang as string,
    mode as 'latihan' | 'simulasi'
  );

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: systemPrompt }, ...sanitizedMessages],
      max_tokens: 1200,
      temperature: 0.6,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenAI error:', errorText);
    return NextResponse.json({ error: 'AI gagal merespons' }, { status: 502 });
  }

  const data = await response.json();
  return NextResponse.json({ content: data.choices[0]?.message?.content ?? '' });
}
