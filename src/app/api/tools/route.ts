import { NextRequest, NextResponse } from 'next/server';

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

    const users = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, sessions[0].userId));
    return users[0] ?? null;
  } catch {
    return null;
  }
}

const prompts: Record<string, (body: any) => string> = {
  k3: ({ proyekTipe, fase, lingkup }) =>
    `Kamu adalah Ahli K3 Konstruksi bersertifikat (SKK-601). Buat checklist K3 untuk proyek konstruksi berikut:
- Tipe proyek: ${proyekTipe}
- Fase pekerjaan: ${fase}
- Lingkup pekerjaan: ${lingkup}

Berikan checklist K3 yang lengkap dan praktis berdasarkan Permen PUPR No. 10/2021, SNI K3, dan peraturan K3 konstruksi Indonesia.
Format JSON: { "kategori": [{ "nama": "...", "items": ["...", "..."] }], "risikoPrioritas": ["..."], "dokumenWajib": ["..."] }
Kembalikan HANYA JSON.`,

  metode: ({ namaItem, tipeStruktur, spesifikasi }) =>
    `Kamu adalah Site Manager berpengalaman. Buat draft Metode Pelaksanaan pekerjaan konstruksi:
- Nama pekerjaan: ${namaItem}
- Tipe struktur: ${tipeStruktur || 'umum'}
- Spesifikasi: ${spesifikasi || 'sesuai standar'}

Berdasarkan SNI, PUIL, dan standar konstruksi Indonesia. Format JSON:
{ "uraianPekerjaan": "...", "tenagaKerja": ["..."], "peralatan": ["..."], "material": ["..."], "langkahPelaksanaan": ["1. ...", "2. ..."], "qcPoints": ["..."], "k3Points": ["..."] }
Kembalikan HANYA JSON.`,

  risiko: ({ proyekTipe, nilai, durasi }) =>
    `Kamu adalah konsultan manajemen risiko konstruksi. Buat Risk Register untuk proyek:
- Tipe: ${proyekTipe}
- Nilai kontrak: ${nilai || 'tidak disebutkan'}
- Durasi: ${durasi || 'tidak disebutkan'}

Format JSON: { "risiko": [{ "id": "R01", "uraian": "...", "kategori": "...", "dampak": "tinggi/sedang/rendah", "probabilitas": "tinggi/sedang/rendah", "levelRisiko": "tinggi/sedang/rendah", "mitigasi": "...", "pemilik": "..." }] }
Buat 8-10 risiko yang realistis. Kembalikan HANYA JSON.`,

  progres: ({ namaProyek, periode, persen, catatan }) =>
    `Kamu adalah Site Manager yang membuat laporan progres singkat. Buat laporan progres proyek:
- Nama proyek: ${namaProyek}
- Periode laporan: ${periode}
- Progres fisik: ${persen}%
- Catatan lapangan: ${catatan || 'tidak ada catatan khusus'}

Buat laporan ringkas yang profesional untuk dikirim ke owner/manajemen. Format JSON:
{ "judulLaporan": "...", "ringkasanEksekutif": "...", "pencapaianPeriodeIni": ["..."], "kendalaDanSolusi": [{ "kendala": "...", "solusi": "..." }], "rencanaMingguDepan": ["..."], "catatanPenting": "..." }
Kembalikan HANYA JSON.`,
};

export async function POST(request: NextRequest) {
  const authUser = await getAuthenticatedUser(request);
  if (!authUser) {
    return NextResponse.json({ error: 'Autentikasi diperlukan' }, { status: 401 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'AI tidak tersedia' }, { status: 503 });

  const body = await request.json();
  const { action } = body;
  const promptFn = prompts[action];
  if (!promptFn) return NextResponse.json({ error: 'Action tidak dikenal' }, { status: 400 });

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: promptFn(body) }],
      max_tokens: 2000,
      temperature: 0.4,
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
