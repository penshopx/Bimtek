/**
 * Tests for trimHistoryByTokenBudget in token-utils.ts.
 *
 * Verifies that:
 *  - Short conversations pass through untouched.
 *  - Long conversations are trimmed so the history fits within the available budget.
 *  - The most recent messages are always preserved when trimming.
 *  - The full API payload (system + history + user) stays within the context window,
 *    with non-empty retained history so we validate the near-budget boundary.
 *  - An exhausted budget (reserve > window) returns an empty history array.
 */

import { describe, it, expect } from 'bun:test';
import { trimHistoryByTokenBudget, estimateTokens } from './token-utils';

// ---------------------------------------------------------------------------
// Constants mirroring src/app/chat/page.tsx generateResponse.
// ---------------------------------------------------------------------------
const MAX_CONTEXT_TOKENS = 8000;
const RESERVE_FOR_RESPONSE = 1000;
// Per-message framing overhead that trimHistoryByTokenBudget applies to every
// message slot, INCLUDING the system message.
const PER_MESSAGE_OVERHEAD = 10;

// System prompts taken directly from src/app/chat/page.tsx.
const SYSTEM_PROMPT_NO_EXPERT =
  'Anda adalah AI Assistant SiapSKK, membantu profesional konstruksi Indonesia. Jawab dalam Bahasa Indonesia.';

// Expert Chat (sipil expert) — the flow this task specifically targets.
const SYSTEM_PROMPT_EXPERT =
  'Anda adalah Ahli Teknik Sipil, expert dalam Fondasi, struktur, beton, baja. Jawab dalam Bahasa Indonesia.';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Builds a history array with `pairCount` user+assistant pairs. */
function buildHistory(pairCount: number, content: string) {
  const history: { role: string; content: string }[] = [];
  for (let i = 0; i < pairCount; i++) {
    history.push({ role: 'user', content });
    history.push({ role: 'assistant', content });
  }
  return history;
}

/** Sums the token cost of a history array (content + per-message overhead). */
function historyTokenCount(msgs: { role: string; content: string }[]) {
  return msgs.reduce(
    (sum, m) => sum + estimateTokens(m.content) + PER_MESSAGE_OVERHEAD,
    0,
  );
}

/**
 * Returns the available-history token budget for a given configuration.
 * Mirrors the fixed trimHistoryByTokenBudget accounting: system prompt
 * gets the same PER_MESSAGE_OVERHEAD framing as every history message.
 */
function availableBudget(
  systemPrompt: string,
  reserveForUserMessage: number,
  maxContext = MAX_CONTEXT_TOKENS,
  reserveResponse = RESERVE_FOR_RESPONSE,
): number {
  const systemTokens = estimateTokens(systemPrompt) + PER_MESSAGE_OVERHEAD;
  return maxContext - systemTokens - reserveResponse - reserveForUserMessage;
}

/**
 * Builds message content with approximately `targetTokens` tokens.
 * Uses varied Indonesian construction terms so BPE tokenisation does not
 * collapse long runs of the same byte into near-zero tokens.
 * Repetition count is rounded (not doubled) to keep content near the target.
 */
function contentWithApproxTokens(targetTokens: number): string {
  const seed = 'konstruksi teknik sipil fondasi beton baja struktur ';
  const seedTokens = Math.max(1, estimateTokens(seed));
  const repetitions = Math.max(1, Math.round(targetTokens / seedTokens));
  return seed.repeat(repetitions);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('trimHistoryByTokenBudget', () => {
  it('returns a short conversation completely untouched', () => {
    const history = [
      { role: 'user', content: 'Apa itu SKK?' },
      {
        role: 'assistant',
        content: 'SKK adalah Sertifikat Kompetensi Kerja yang diakui secara nasional.',
      },
      { role: 'user', content: 'Bagaimana cara mendaftarnya?' },
      {
        role: 'assistant',
        content:
          'Anda dapat mendaftar melalui LSP resmi yang terakreditasi oleh BNSP.',
      },
    ];

    const userInput = 'Dimana saya bisa mendapatkan sertifikat?';
    const reserveForUserMessage = estimateTokens(userInput) + PER_MESSAGE_OVERHEAD;

    const result = trimHistoryByTokenBudget(
      history,
      SYSTEM_PROMPT_NO_EXPERT,
      MAX_CONTEXT_TOKENS,
      RESERVE_FOR_RESPONSE,
      reserveForUserMessage,
    );

    // Short history: nothing should be dropped.
    expect(result).toEqual(history);
  });

  it('trims a long conversation so the history fits within the available budget', () => {
    const userInput = 'Pertanyaan baru saya tentang sertifikasi SKK.';
    const reserveForUserMessage = estimateTokens(userInput) + PER_MESSAGE_OVERHEAD;
    const budget = availableBudget(SYSTEM_PROMPT_NO_EXPERT, reserveForUserMessage);

    // Each message uses ~1/12 of the available budget; build 3× as many messages as
    // fit to force trimming while still leaving several messages in the trimmed result.
    const approxPerMsg = Math.floor(budget / 12);
    const messageContent = contentWithApproxTokens(approxPerMsg);
    const actualPerMsg = estimateTokens(messageContent) + PER_MESSAGE_OVERHEAD;
    const pairsToFit = Math.ceil(budget / (actualPerMsg * 2));
    const history = buildHistory(pairsToFit * 3, messageContent);

    const result = trimHistoryByTokenBudget(
      history,
      SYSTEM_PROMPT_NO_EXPERT,
      MAX_CONTEXT_TOKENS,
      RESERVE_FOR_RESPONSE,
      reserveForUserMessage,
    );

    // Some messages must have been dropped and some kept.
    expect(result.length).toBeGreaterThan(0);
    expect(result.length).toBeLessThan(history.length);

    // The trimmed history must fit inside the remaining token budget.
    expect(historyTokenCount(result)).toBeLessThanOrEqual(budget);
  });

  it('preserves the most recent messages when trimming older ones', () => {
    const userInput = 'Lanjutkan diskusi tentang proyek ini.';
    const reserveForUserMessage = estimateTokens(userInput) + PER_MESSAGE_OVERHEAD;
    const budget = availableBudget(SYSTEM_PROMPT_NO_EXPERT, reserveForUserMessage);

    const approxPerMsg = Math.floor(budget / 12);
    const messageContent = contentWithApproxTokens(approxPerMsg);
    const actualPerMsg = estimateTokens(messageContent) + PER_MESSAGE_OVERHEAD;
    const pairsToFit = Math.ceil(budget / (actualPerMsg * 2));
    const history = buildHistory(pairsToFit * 3, messageContent);

    // Append a pair of short, distinctive recent messages certain to fit in the budget.
    const recentUser = {
      role: 'user',
      content: 'Pertanyaan terbaru yang sangat spesifik tentang HVAC.',
    };
    const recentAssistant = {
      role: 'assistant',
      content: 'Jawaban terbaru tentang sistem HVAC di gedung bertingkat.',
    };
    history.push(recentUser, recentAssistant);

    const result = trimHistoryByTokenBudget(
      history,
      SYSTEM_PROMPT_NO_EXPERT,
      MAX_CONTEXT_TOKENS,
      RESERVE_FOR_RESPONSE,
      reserveForUserMessage,
    );

    // Some messages from the front must have been dropped.
    expect(result.length).toBeLessThan(history.length);

    // The two most recent messages must survive.
    expect(result[result.length - 1]).toEqual(recentAssistant);
    expect(result[result.length - 2]).toEqual(recentUser);

    // The kept slice must be the tail of the original history.
    expect(result).toEqual(history.slice(history.length - result.length));
  });

  it('returns an empty array when the budget is exhausted by system + reserves', () => {
    // Use a tiny context window that is fully consumed by the response reserve alone,
    // so availableTokens ≤ 0 and the function must return [].
    const tinyMax = 50;
    const bigReserve = 100; // intentionally larger than tinyMax
    const history = [
      { role: 'user', content: 'Halo' },
      { role: 'assistant', content: 'Halo! Ada yang bisa dibantu?' },
    ];

    const result = trimHistoryByTokenBudget(
      history,
      SYSTEM_PROMPT_NO_EXPERT,
      tinyMax,
      bigReserve,
    );

    expect(result).toEqual([]);
  });

  it('Expert Chat: API payload stays within MAX_CONTEXT_TOKENS − RESERVE_FOR_RESPONSE with history retained', () => {
    // Use the actual Expert Chat system prompt (sipil expert) as used by generateResponse
    // when an expert is selected. This directly exercises the target flow's budget boundary.
    const systemPrompt = SYSTEM_PROMPT_EXPERT;
    const userInput = 'Apa rekomendasi Anda untuk pondasi gedung bertingkat di tanah lunak?';
    const reserveForUserMessage = estimateTokens(userInput) + PER_MESSAGE_OVERHEAD;
    const budget = availableBudget(systemPrompt, reserveForUserMessage);

    // Size messages so ~10 pairs fit in the budget; build 3× as many pairs to force
    // trimming while guaranteeing a non-empty result (near-budget boundary check).
    const approxPerMsg = Math.floor(budget / 20);
    const messageContent = contentWithApproxTokens(approxPerMsg);
    const actualPerMsg = estimateTokens(messageContent) + PER_MESSAGE_OVERHEAD;
    const pairsToFit = Math.ceil(budget / (actualPerMsg * 2));
    const history = buildHistory(pairsToFit * 3, messageContent);

    const trimmed = trimHistoryByTokenBudget(
      history,
      systemPrompt,
      MAX_CONTEXT_TOKENS,
      RESERVE_FOR_RESPONSE,
      reserveForUserMessage,
    );

    // Non-empty result: we are validating the near-budget boundary, not the empty case.
    expect(trimmed.length).toBeGreaterThan(0);
    // Some history must have been dropped too.
    expect(trimmed.length).toBeLessThan(history.length);

    // Reconstruct the full token cost of the payload generateResponse sends to /api/ai/chat.
    // The fixed trimHistoryByTokenBudget now adds PER_MESSAGE_OVERHEAD for the system
    // message, so this accounting must do the same to be consistent.
    const apiSystemTokens = estimateTokens(systemPrompt) + PER_MESSAGE_OVERHEAD;
    const apiHistoryTokens = historyTokenCount(trimmed);
    const apiUserTokens = estimateTokens(userInput) + PER_MESSAGE_OVERHEAD;
    const totalApiTokens = apiSystemTokens + apiHistoryTokens + apiUserTokens;

    // The full serialized payload must fit within the allowed context window.
    expect(totalApiTokens).toBeLessThanOrEqual(MAX_CONTEXT_TOKENS - RESERVE_FOR_RESPONSE);
  });
});
