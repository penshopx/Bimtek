import { afterAll, afterEach, beforeAll, expect, mock, test } from 'bun:test';
import { NextRequest } from 'next/server';
import * as route from './route';

const originalFetch = globalThis.fetch;
const originalApiKey = process.env.OPENAI_API_KEY;

function request(body: string, contentType = 'application/json') {
  return new NextRequest('http://localhost/api/mock-asesmen', {
    method: 'POST',
    headers: { 'content-type': contentType },
    body,
  });
}

function validQuestions() {
  return {
    questions: [
      ...Array.from({ length: 3 }, (_, index) => ({
        type: 'knowledge',
        question: `Pertanyaan pengetahuan ${index + 1}`,
        options: { A: 'Pilihan A', B: 'Pilihan B', C: 'Pilihan C', D: 'Pilihan D' },
        correct: 'A',
        explanation: 'Penjelasan yang cukup.',
      })),
      ...Array.from({ length: 2 }, (_, index) => ({
        type: 'scenario',
        question: `Pertanyaan skenario ${index + 1}`,
        options: { A: 'Pilihan A', B: 'Pilihan B', C: 'Pilihan C', D: 'Pilihan D' },
        correct: 'B',
        explanation: 'Penjelasan yang cukup.',
      })),
    ],
  };
}

function providerResponse(status: number, content: string) {
  return new Response(JSON.stringify({
    choices: [{ message: { content } }],
  }), { status, headers: { 'content-type': 'application/json' } });
}

function stubFetch(response: Response | Promise<Response>) {
  const fetchMock = mock(() => Promise.resolve(response));
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

test('mock asesmen menolak JSON dan parameter yang tidak valid', async () => {
  expect((await route.POST(request('{'))).status).toBe(400);
  expect((await route.POST(request(JSON.stringify({ domain: 'Sipil' })))).status).toBe(400);
  expect((await route.POST(request(JSON.stringify({
    domain: 'Bidang yang tidak dikenal', level: 'Ahli Muda',
  })))).status).toBe(400);
  expect(globalThis.fetch).toBe(originalFetch);
});

test('mock asesmen hanya mengembalikan lima soal dengan struktur yang benar', async () => {
  stubFetch(providerResponse(200, JSON.stringify(validQuestions())));
  const result = await route.POST(request(JSON.stringify({
    domain: 'Teknik Bangunan Gedung',
    level: 'Ahli Muda',
    unit: 'Mengendalikan pekerjaan',
  })));
  const data = await result.json();
  expect(result.status).toBe(200);
  expect(data.questions).toHaveLength(5);
  expect(data.questions.map((question: { type: string }) => question.type))
    .toEqual(['knowledge', 'knowledge', 'knowledge', 'scenario', 'scenario']);
  expect(data.questions.map((question: { id: number }) => question.id)).toEqual([1, 2, 3, 4, 5]);
});

test('mock asesmen menolak respons model yang tidak lengkap atau tidak sesuai kuota tipe', async () => {
  const invalid = validQuestions();
  invalid.questions[4].type = 'knowledge';
  stubFetch(providerResponse(200, JSON.stringify(invalid)));
  const result = await route.POST(request(JSON.stringify({
    domain: 'Geoteknik', level: 'Ahli Muda',
  })));
  expect(result.status).toBe(502);
});

test('mock asesmen meneruskan kuota AI sebagai respons yang bisa dicoba ulang', async () => {
  stubFetch(new Response(JSON.stringify({ error: 'rate limited' }), { status: 429 }));
  const result = await route.POST(request(JSON.stringify({
    domain: 'Geoteknik', level: 'Ahli Muda',
  })));
  expect(result.status).toBe(429);
  expect((await result.json()).error).toContain('batas penggunaan');
});
