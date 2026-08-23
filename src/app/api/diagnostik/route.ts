import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'AI tidak tersedia' }, { status: 503 });
  }

  const { jenjang, bidang, pengalamanTahun, pengalamanBidang, pengalamanDeskripsi, target } = await request.json();

  const prompt = `Kamu adalah konsultan sertifikasi SKK berpengalaman yang memahami SKKNI, KKNI, dan regulasi BNSP.

Analisis profil kompetensi kandidat berikut:

PENDIDIKAN:
- Jenjang: ${jenjang}
- Bidang studi: ${bidang}

PENGALAMAN KERJA:
- Lama pengalaman: ${pengalamanTahun} tahun
- Bidang pekerjaan: ${pengalamanBidang}
- Deskripsi singkat: ${pengalamanDeskripsi || '(tidak diisi)'}

TARGET: ${target || 'Rekomendasikan jabatan SKK yang paling optimal'}

Berdasarkan Permen PU No. 6/2025, KM PUPR No. 713/KPTS/M/2022, dan standar BNSP, lakukan analisis dan kembalikan HANYA JSON berikut:

{
  "kkniLevel": 6,
  "kkniLabel": "Ahli Muda",
  "jabatanEligible": [
    { "nama": "...", "kode": "...", "alasan": "...", "match": 90 }
  ],
  "jabatanTarget1Tahun": [
    { "nama": "...", "kode": "...", "syaratTambahan": "..." }
  ],
  "gaps": [
    { "aspek": "...", "kondisiSekarang": "...", "yangDibutuhkan": "...", "prioritas": "tinggi" }
  ],
  "rekomendasiLangkah": [
    "Langkah 1: ...",
    "Langkah 2: ...",
    "Langkah 3: ..."
  ],
  "estimasiBiayaSKK": "Rp 2.500.000 – Rp 4.000.000",
  "catatanPenting": "..."
}

Pastikan jabatanEligible berisi 2-4 jabatan, gaps berisi 2-3 item, rekomendasiLangkah berisi 4-5 langkah konkret.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
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

  if (!response.ok) {
    return NextResponse.json({ error: 'AI gagal melakukan analisis' }, { status: 502 });
  }

  const data = await response.json();
  const raw = data.choices[0]?.message?.content ?? '{}';

  try {
    const result = JSON.parse(raw);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Format analisis tidak valid' }, { status: 500 });
  }
}
