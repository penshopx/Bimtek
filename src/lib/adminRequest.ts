'use client';

export function adminHeaders(): Record<string, string> {
  const session = typeof window !== 'undefined' ? window.localStorage.getItem('sessionId') : null;
  return session ? { 'x-session-id': session } : {};
}

export async function adminFetch(url: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers);
  for (const [key, value] of Object.entries(adminHeaders())) headers.set(key, value);
  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || body.error || 'Permintaan admin gagal.');
  }
  return response;
}
