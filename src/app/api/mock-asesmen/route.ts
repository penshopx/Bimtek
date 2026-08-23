import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'AI tidak tersedia' }, { status: 503 });
  }

  const { domain, level, domainCode } = await request.json();

  const prompt = `Kamu adalah asesor BNSP untuk uji kompetensi SKK bidang konstruksi Indonesia.

Buat TEPAT 5 soal pilihan ganda untuk simulasi ujian kompetensi SKK:
- Domain: ${domain}
- Level: ${level} (${domainCode})
- 3 soal pengetahuan teknis (type: "knowledge")  
- 2 soal skenario lapangan (type: "scenario") — deskripsi situasi nyata di proyek

Setiap soal harus:
- Relevan dengan SKKNI bidang ${domain}
- Berbasis regulasi Indonesia (SNI, Permen PU, BNSP)
- Opsi A/B/C/D yang masuk akal (bukan terlalu mudah/terlalu jelas)
- Penjelasan singkat kenapa jawaban benar

Kembalikan HANYA JSON array berikut (tanpa teks lain):
[
  {
    "id": 1,
    "type": "knowledge",
    "question": "...",
    "options": { "A": "...", "B": "...", "C": "...", "D": "..." },
    "correct": "A",
    "explanation": "..."
  }
]`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2500,
      temperature: 0.7,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    return NextResponse.json({ error: 'AI gagal menghasilkan soal' }, { status: 502 });
  }

  const data = await response.json();
  const raw = data.choices[0]?.message?.content ?? '[]';

  try {
    // AI might return { questions: [...] } or directly an array
    const parsed = JSON.parse(raw);
    const questions = Array.isArray(parsed) ? parsed : (parsed.questions ?? Object.values(parsed)[0]);
    return NextResponse.json({ questions });
  } catch {
    return NextResponse.json({ error: 'Format soal tidak valid' }, { status: 500 });
  }
}
