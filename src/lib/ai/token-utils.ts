// Accurate token counting using js-tiktoken with the o200k_base encoding,
// which is what gpt-4o and gpt-4o-mini use.
// Falls back to the ~4 chars/token heuristic only if the tokenizer cannot be loaded.

import type { Tiktoken } from 'js-tiktoken';

// ---------------------------------------------------------------------------
// Synchronous initialisation — runs once when the module is first imported.
// getEncoding is synchronous in Node.js / Bun (WASM is bundled as a buffer),
// so there is no async race: every call to estimateTokens is accurate from the
// very first invocation.
// ---------------------------------------------------------------------------
let _encoder: Tiktoken | null = null;

try {
  const { getEncoding } = require('js-tiktoken') as typeof import('js-tiktoken');
  _encoder = getEncoding('o200k_base');
} catch (err) {
  // Wasm unavailable or package not bundled — silently fall back to heuristic.
  console.warn('[token-utils] tiktoken unavailable, using heuristic fallback:', err);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Counts tokens in a string using OpenAI's o200k_base encoding
 * (the encoding used by gpt-4o and gpt-4o-mini).
 *
 * Falls back to the ~4 chars/token heuristic when the tokenizer is unavailable.
 * This is accurate for English, Indonesian, code blocks, and emoji-heavy text.
 */
export function estimateTokens(text: string): number {
  if (_encoder) {
    return _encoder.encode(text).length;
  }
  // Heuristic fallback: ~4 chars per token.
  return Math.ceil(text.length / 4);
}

/**
 * Returns true when the real tokenizer is loaded and active.
 * Primarily useful for diagnostics and tests.
 */
export function isTokenizerLoaded(): boolean {
  return _encoder !== null;
}

/**
 * Trims a conversation history array so that the total token count fits
 * within the available budget. The oldest messages are dropped first.
 *
 * @param history     Full message history (oldest first).
 * @param systemPrompt The system prompt that will be prepended to the request.
 * @param maxContextTokens  The model's total context-window budget (e.g. 8000).
 * @param reserveForResponse Tokens to reserve for the model's reply (e.g. 1000).
 * @param reserveForUserMessage Tokens to reserve for the current user message that
 *                              will be appended after the history (default 300).
 * @returns A (possibly shorter) copy of history that fits in the remaining budget.
 */
export function trimHistoryByTokenBudget<T extends { role: string; content: string }>(
  history: T[],
  systemPrompt: string,
  maxContextTokens: number,
  reserveForResponse: number,
  reserveForUserMessage = 300,
): T[] {
  const systemTokens = estimateTokens(systemPrompt);
  // Per-message overhead: role label + structural JSON tokens (~10 tokens each)
  const perMessageOverhead = 10;
  const availableTokens =
    maxContextTokens - systemTokens - reserveForResponse - reserveForUserMessage;

  if (availableTokens <= 0) return [];

  // Walk backwards from the most recent message; keep messages that still fit.
  let usedTokens = 0;
  const kept: T[] = [];

  for (let i = history.length - 1; i >= 0; i--) {
    const msgTokens = estimateTokens(history[i].content) + perMessageOverhead;
    if (usedTokens + msgTokens > availableTokens) break;
    usedTokens += msgTokens;
    kept.unshift(history[i]);
  }

  return kept;
}

/**
 * Returns true when a single message is too large to fit inside the context window
 * even if the full budget were dedicated to it alone (i.e. no history at all).
 *
 * Use this to detect the "silent context loss" situation: trimHistoryByTokenBudget
 * would return an empty array AND the user message itself still wouldn't fit.
 *
 * @param message            The candidate message text to check.
 * @param systemPrompt       The system prompt that occupies part of the window.
 * @param maxContextTokens   The model's total context-window size (e.g. 8000).
 * @param reserveForResponse Tokens reserved for the model's reply (e.g. 1000).
 * @returns true if the message alone exceeds the remaining budget.
 */
export function isMessageTooLargeForBudget(
  message: string,
  systemPrompt: string,
  maxContextTokens: number,
  reserveForResponse: number,
): boolean {
  const systemTokens = estimateTokens(systemPrompt);
  const perMessageOverhead = 10;
  // Tokens available for the message itself after system prompt + reserved response
  const availableForMessage =
    maxContextTokens - systemTokens - reserveForResponse - perMessageOverhead;
  return availableForMessage <= 0 || estimateTokens(message) > availableForMessage;
}
