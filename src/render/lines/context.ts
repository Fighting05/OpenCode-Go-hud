/**
 * Context bar renderer
 */

import type { RenderContext } from '../../types.js';
import { RESET, DIM, CYAN, getContextColor } from '../../colors.js';
import { formatTokens } from '../utils.js';

export function renderContextLine(ctx: RenderContext): string | null {
  const { stdin, config } = ctx;
  if (!config.display.showContextBar) return null;

  let contextPct = 0;
  let inputTokens = 0;
  let cacheTokens = 0;
  let contextSize = 0;

  if (stdin.context_window) {
    if (stdin.context_window.used_percentage != null) {
      contextPct = Math.round(stdin.context_window.used_percentage);
    }
    if (stdin.context_window.context_window_size) {
      contextSize = stdin.context_window.context_window_size;
    }
    if (stdin.context_window.current_usage) {
      inputTokens = stdin.context_window.current_usage.input_tokens || 0;
      cacheTokens = (stdin.context_window.current_usage.cache_creation_input_tokens || 0) +
                    (stdin.context_window.current_usage.cache_read_input_tokens || 0);
    }
  }

  // Build context bar
  const barWidth = 15;
  const filled = Math.round((contextPct / 100) * barWidth);
  const empty = barWidth - filled;
  const bar = `${getContextColor(contextPct)}${'█'.repeat(filled)}${DIM}${'░'.repeat(empty)}${RESET}`;

  // Build context text
  let contextText = `${getContextColor(contextPct)}${contextPct}%${RESET}`;

  if (config.display.contextValue === 'tokens' && contextSize > 0) {
    contextText = `${getContextColor(contextPct)}${contextPct}%${RESET} ${DIM}(${formatTokens(inputTokens + cacheTokens)}/${formatTokens(contextSize)})${RESET}`;
  } else if (config.display.contextValue === 'remaining' && contextSize > 0) {
    const remaining = contextSize - inputTokens - cacheTokens;
    contextText = `${getContextColor(contextPct)}${contextPct}%${RESET} ${DIM}(${formatTokens(remaining)} remaining)${RESET}`;
  }

  return `${CYAN}[ctx]${RESET} ${bar} ${contextText}`;
}
