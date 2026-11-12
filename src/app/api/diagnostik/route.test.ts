import { afterAll, afterEach, beforeAll, expect, mock, test } from 'bun:test';
import { NextRequest } from 'next/server';
import * as route from './route';

const originalFetch = globalThis.fetch;
const originalApiKey = process.env.OPENAI_API_KEY;

function request(body: string) {
  return new NextRequest('http://localhost/api/diagnostik', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body,
  });
}

function validResult() {
  return {
    kkniLevel: 7,
    kkniLabel: 'Ahli Muda',
    jabatanEligible: [
      { nama: 'Ahli Teknik Gedung', kode: '', alasan: 'Perlu verifikasi skema LSP.', match: 65 },
      { nama: 'Ahli Pelaksana', kode: 'KODE-1', alasan: 'Pengalaman relevan sebagai indikasi awal.', match: 55 },
    ],
    jabatanTarget1Tahun: [
      { nama: 'Target bidang gedung', kode: '', syaratTambahan: 'Konfirmasi persyaratan kepada LSP.' },
    ],
    gaps: [
      { aspek: 'Portofolio', kondisiSekarang: 'Belum dinilai.', yangDibutuhkan: 'Tinjau bukti kerja.', prioritas: 'tinggi' },
      { aspek: 'Skema', kondisiSekarang: 'Belum dikonfirmasi.', yangDibutuhkan: 'Hubungi LSP.', prioritas: 'sedang' },
    ],
    rekomendasiLangkah: ['Langkah satu', 'Langkah dua', 'Langkah tiga', 'Langkah empat'],
    estimasiBiayaSKK: 'Konfirmasi kepada LSP.',
    catatanPenting: 'Saran awal, bukan keputusan resmi.',
  };
}

function stubFetch(response: Response) {
  const fetchMock = mock(async () => response);
  globalThis.fetch = fetchMock as unknown as typeof fetch;
}

beforeAll(() => {
  process.env.OPENAI_API_KEY = 'test-key';
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

afterAll(() => {
  globalThis.fetch = originalFetch;
  if (originalApiKey === undefined) delete process.env.OPENAI_API_KEY;
  else process.env.OPENAI_API_KEY = originalApiKey;
});

test('diagnostik menolak JSON rusak dan nilai tahun pengalaman di luar batas', async () => {
  expect((await route.POST(request('{'))).status).toBe(400);
  expect((await route.POST(request(JSON.stringify({
    jenjang: 'S1', bidang: 'Sipil', pengalamanTahun: 81,
    pengalamanBidang: 'Gedung',
  })))).status).toBe(400);
  expect(globalThis.fetch).toBe(originalFetch);
});

test('diagnostik mengembalikan hanya hasil yang sesuai kontrak', async () => {
  stubFetch(new Response(JSON.stringify({
    choices: [{ message: { content: JSON.stringify(validResult()) } }],
  }), { status: 200, headers: { 'content-type': 'application/json' } }));
  const result = await route.POST(request(JSON.stringify({
    jenjang: 'S1 (Sarjana)',
    bidang: 'Teknik Sipil',
    pengalamanTahun: '5',
    pengalamanBidang: 'Konstruksi Gedung',
    pengalamanDeskripsi: 'Mengawasi pekerjaan gedung.',
    target: null,
  })));
  const data = await result.json();
  expect(result.status).toBe(200);
  expect(data.kkniLevel).toBe(7);
  expect(data.jabatanEligible).toHaveLength(2);
  expect(data.jabatanEligible[0].kode).toBe('');
  expect(data.gaps).toHaveLength(2);
});

test('diagnostik menolak jawaban model yang tidak sesuai skema', async () => {
  const invalid = validResult();
  invalid.jabatanEligible[0].match = 120;
  stubFetch(new Response(JSON.stringify({
    choices: [{ message: { content: JSON.stringify(invalid) } }],
  }), { status: 200 }));
  const result = await route.POST(request(JSON.stringify({
    jenjang: 'S1', bidang: 'Sipil', pengalamanTahun: 5, pengalamanBidang: 'Gedung',
  })));
  expect(result.status).toBe(502);
});

test('diagnostik memberi status yang jelas ketika penyedia membatasi permintaan', async () => {
  stubFetch(new Response('rate limited', { status: 429 }));
  const result = await route.POST(request(JSON.stringify({
    jenjang: 'S1', bidang: 'Sipil', pengalamanTahun: 5, pengalamanBidang: 'Gedung',
  })));
  expect(result.status).toBe(429);
  expect((await result.json()).error).toContain('batas penggunaan');
});
