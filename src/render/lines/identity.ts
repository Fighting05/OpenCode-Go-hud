/**
 * Identity (model) line renderer
 */

import type { RenderContext } from '../../types.js';
import { RESET, DIM, CYAN, getUsageColor, RED, MAGENTA, BLUE } from '../../colors.js';
import { formatTokens } from '../utils.js';

export function renderIdentityLine(ctx: RenderContext): string | null {
  const { stdin, config, usageData } = ctx;
  if (!config.display.showModel) return null;

  // Model name: prefer what Claude Code reports on stdin — when the *_NAME
  // env mapping is set, stdin.model.display_name reflects the real backend
  // model (e.g. "glm-5.2" after switching to the Opus slot). If stdin only
  // carries a Claude shell name (e.g. "Opus 4.8"), map it to the real model
  // via the matching tier env var.
  const envForTier: Record<string, string> = {
    sonnet: 'ANTHROPIC_DEFAULT_SONNET_MODEL_NAME',
    opus: 'ANTHROPIC_DEFAULT_OPUS_MODEL_NAME',
    haiku: 'ANTHROPIC_DEFAULT_HAIKU_MODEL_NAME',
    fable: 'ANTHROPIC_DEFAULT_FABLE_MODEL_NAME',
  };
  let modelName = stdin.model?.display_name
    ?? stdin.model?.id
    ?? process.env[config.activation.envKey]
    ?? process.env.CLAUDE_CODE_SUBAGENT_MODEL
    ?? 'OpenCode Go';
  const tierMatch = /^(sonnet|opus|haiku|fable)\b/i.exec(modelName);
  if (tierMatch) {
    const real = process.env[envForTier[tierMatch[1].toLowerCase()]];
    if (real) modelName = real;
  }

  // Color based on rolling usage
  const rollingPct = usageData?.rolling?.percent ?? 0;
  let modelColor = CYAN;
  if (rollingPct >= 90) {
    modelColor = RED;
  } else if (rollingPct >= 75) {
    modelColor = MAGENTA;
  } else if (rollingPct >= 50) {
    modelColor = BLUE;
  }

  // Build model badge
  let badge = `${modelColor}[${modelName}]${RESET}`;

  // Add context info if enabled
  if (config.display.showContextBar && stdin.context_window) {
    let contextPct = 0;
    let inputTokens = 0;
    let cacheTokens = 0;
    let contextSize = 0;

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

    // Context bar
    const barWidth = 15;
    const filled = Math.round((contextPct / 100) * barWidth);
    const empty = barWidth - filled;
    const bar = `${getUsageColor(contextPct)}${'█'.repeat(filled)}${DIM}${'░'.repeat(empty)}${RESET}`;

    // Context text
    let contextText = `${getUsageColor(contextPct)}${contextPct}%${RESET}`;
    if (contextSize > 0) {
      contextText = `${getUsageColor(contextPct)}${contextPct}%${RESET} ${DIM}(${formatTokens(inputTokens + cacheTokens)}/${formatTokens(contextSize)})${RESET}`;
    }

    badge = `${badge} ${DIM}[ctx]${RESET} ${bar} ${contextText}`;

    // Token breakdown at high context
    if (config.display.showTokenBreakdown &&
        contextPct >= 85 &&
        (inputTokens > 0 || cacheTokens > 0)) {
      badge += ` ${DIM}(in: ${formatTokens(inputTokens)}, cache: ${formatTokens(cacheTokens)})${RESET}`;
    }
  }

  return badge;
}
