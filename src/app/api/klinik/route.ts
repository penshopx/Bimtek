import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'AI tidak tersedia' }, { status: 503 });
  }

  const body = await request.json();
  const { action } = body;

  if (action === 'blueprint') {
    const { jabatan, jenjang, pendidikan, pengalaman, ceritaProyek, materiSulit, kendala } = body;

    const prompt = `Kamu adalah konsultan kesiapan uji kompetensi SKK yang berpengalaman.

Kandidat memberikan informasi berikut:
- Jabatan SKK yang dituju: ${jabatan}
- Jenjang KKNI yang dituju: ${jenjang || 'belum ditentukan'}
- Pendidikan terakhir: ${pendidikan}
- Lama pengalaman relevan: ${pengalaman}
- Cerita pengalaman/proyek: ${ceritaProyek || '(tidak diisi)'}
- Materi yang dirasa sulit: ${materiSulit || '(tidak disebutkan)'}
- Kendala/kekhawatiran: ${kendala || '(tidak disebutkan)'}

Buat Blueprint Kesiapan Asesmen dalam format JSON berikut:
{
  "skorKesiapan": 72,
  "label": "Cukup Siap",
  "ringkasan": "...",
  "kekuatan": ["...", "..."],
  "gap": [
    { "area": "...", "deskripsi": "...", "prioritas": "tinggi" }
  ],
  "unitKompetensiPrioritas": [
    { "kode": "...", "nama": "...", "catatan": "..." }
  ],
  "rencanaBelajar": [
    { "minggu": "Minggu 1-2", "fokus": "...", "aktivitas": "..." }
  ],
  "rekomendasiDokumen": ["...", "..."],
  "pesanMotivasi": "..."
}

skorKesiapan antara 0-100. label: "Belum Siap" (<50), "Perlu Persiapan" (50-70), "Cukup Siap" (71-85), "Siap Asesmen" (>85).
Kembalikan HANYA JSON.`;

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2000,
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
    });

    const data = await res.json();
    const result = JSON.parse(data.choices[0]?.message?.content ?? '{}');
    return NextResponse.json(result);
  }

  if (action === 'chat') {
    const { messages, blueprint, jabatan } = body;
    const systemPrompt = `Kamu adalah teman belajar (study companion) yang membantu kandidat mempersiapkan uji kompetensi SKK untuk jabatan ${jabatan}.

Blueprint kesiapan kandidat:
- Skor kesiapan: ${blueprint?.skorKesiapan}/100 (${blueprint?.label})
- Gap utama: ${blueprint?.gap?.map((g: any) => g.area).join(', ') || 'belum teridentifikasi'}
- Unit kompetensi prioritas: ${blueprint?.unitKompetensiPrioritas?.map((u: any) => u.nama).join(', ') || 'umum'}

Tugasmu:
- Jelaskan konsep yang ditanyakan dengan bahasa mudah dipahami
- Berikan contoh nyata dari lapangan
- Latih kandidat dengan pertanyaan kecil jika relevan
- Fokus pada area gap yang teridentifikasi
- Selalu supportif dan motivatif

Jawab dalam Bahasa Indonesia, ringkas namun informatif.`;

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        max_tokens: 1000,
        temperature: 0.6,
      }),
    });

    const data = await res.json();
    return NextResponse.json({ content: data.choices[0]?.message?.content ?? '' });
  }

  if (action === 'ujian') {
    const { jabatan, jenjang, gaps } = body;
    const gapArea = gaps?.map((g: any) => g.area).join(', ') || 'umum';

    const prompt = `Buat 5 soal ujian kompetensi SKK untuk jabatan "${jabatan}" (${jenjang}), fokus pada area lemah: ${gapArea}.

Format JSON (kembalikan HANYA JSON):
{
  "questions": [
    {
      "id": 1,
      "type": "knowledge",
      "question": "...",
      "options": { "A": "...", "B": "...", "C": "...", "D": "..." },
      "correct": "A",
      "explanation": "...",
      "unitKompetensi": "..."
    }
  ]
}

Gunakan 3 soal pengetahuan + 2 soal skenario lapangan. Berbasis SKKNI dan regulasi Indonesia.`;

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
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

    const data = await res.json();
    const result = JSON.parse(data.choices[0]?.message?.content ?? '{}');
    return NextResponse.json(result);
  }

  return NextResponse.json({ error: 'Action tidak dikenal' }, { status: 400 });
}
