// Lightweight token estimation utilities
// Uses the ~4 chars/token heuristic which works well for English and mixed Indonesian/English text.

/**
 * Estimates the number of tokens in a string using the ~4 chars/token heuristic.
 * This is a conservative approximation — real tokenization (tiktoken) may differ,
 * but this avoids a large dependency and is accurate enough to prevent context-limit errors.
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Trims a conversation history array so that the total estimated token count fits
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
