import type { JourneyProgress } from './learning-journey';
import { parseJourneyProgress, type JourneySyncOperation } from './learning-journey-storage';

export type AccountJourneyResponse = {
  progress: JourneyProgress;
  hasServerProgress: boolean;
};

function sessionHeaders(): Record<string, string> {
  const sessionId = window.localStorage.getItem('sessionId');
  return sessionId ? { 'x-session-id': sessionId } : {};
}

async function decodeResponse(response: Response): Promise<AccountJourneyResponse> {
  if (!response.ok) {
    if (response.status === 401) throw new Error('Sesi berakhir. Masuk kembali untuk menyinkronkan progres.');
    if (response.status === 403) throw new Error('Permintaan sinkronisasi ditolak.');
    throw new Error('Progres akun belum tersinkron. Data browser tetap tersedia; coba lagi.');
  }
  const body: unknown = await response.json();
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new Error('Respons progres akun tidak dikenali.');
  }
  const value = body as { progress?: unknown; hasServerProgress?: unknown };
  if (typeof value.hasServerProgress !== 'boolean') {
    throw new Error('Respons progres akun tidak lengkap.');
  }
  return {
    progress: parseJourneyProgress(value.progress),
    hasServerProgress: value.hasServerProgress,
  };
}

export async function readAccountJourneyProgress(): Promise<AccountJourneyResponse> {
  const response = await fetch('/api/learning-journey', {
    method: 'GET',
    headers: sessionHeaders(),
    cache: 'no-store',
  });
  return decodeResponse(response);
}

export async function writeAccountJourneyProgress(
  progress: JourneyProgress,
): Promise<AccountJourneyResponse> {
  const response = await fetch('/api/learning-journey', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...sessionHeaders() },
    body: JSON.stringify({ progress }),
    cache: 'no-store',
  });
  return decodeResponse(response);
}

export async function writeAccountJourneyOperation(
  operation: JourneySyncOperation,
): Promise<AccountJourneyResponse> {
  const response = await fetch('/api/learning-journey', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...sessionHeaders() },
    body: JSON.stringify({ operation }),
    cache: 'no-store',
  });
  return decodeResponse(response);
}
