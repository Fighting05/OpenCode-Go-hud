/**
 * Render utilities
 */

import { getUsageColor } from '../colors.js';

/**
 * Format token count for display
 */
export function formatTokens(n: number): string {
  if (!n) return '0';
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}k`;
  return n.toString();
}

/**
 * Render a quota bar
 */
export function quotaBar(percent: number, width: number = 10): string {
  const filled = Math.round((percent / 100) * width);
  const empty = width - filled;
  return `${getUsageColor(percent)}${'█'.repeat(filled)}${'\x1b[2m'}${'░'.repeat(empty)}${'\x1b[0m'}`;
}
