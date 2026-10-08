import { Client } from '@replit/object-storage';

// File bytes stay in private App Storage, never in the database or public/.
export async function evidenceStorage() {
  const client = new Client();
  const result = await client.list({ maxResults: 1, prefix: 'participant-evidence/' });
  if (!result.ok) throw new Error('Storage unavailable');
  return client;
}
