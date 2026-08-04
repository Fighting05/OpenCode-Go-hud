/**
 * Usage line renderer - rolling (5h) / weekly / monthly windows
 */

import type { RenderContext, Usage } from '../../types.js';
import { RESET, DIM, getUsageColor, RED } from '../../colors.js';
import { t } from '../../i18n/index.js';
import { quotaBar } from '../utils.js';

/**
 * Format reset countdown like `3d16h` / `5h12m` / `42m`; falls back to the
 * raw DOM reset text when seconds are unavailable.
 */
function fmtReset(u: Usage): string {
  if (u.resetInSec == null) {
    return u.resetText ?? '?';
  }
  let sec = u.resetInSec;
  if (sec < 0) sec = 0;
  const days = Math.floor(sec / 86400);
  sec %= 86400;
  const hours = Math.floor(sec / 3600);
  sec %= 3600;
  const minutes = Math.floor(sec / 60);
  if (days > 0) return `${days}d${hours}h`;
  if (hours > 0) return minutes ? `${hours}h${minutes}m` : `${hours}h`;
  return `${minutes}m`;
}

export function renderUsageLine(ctx: RenderContext): string | null {
  const { usageData, config } = ctx;
  if (!config.display.showUsage || !usageData) return null;

  const { rolling, weekly, monthly } = usageData;
  if (!rolling && !weekly && !monthly) return null;

  const tr = t(config.language);
  const parts: string[] = [];

  const renderWindow = (usage: Usage | null, label: string, showBar: boolean): void => {
    if (!usage) return;
    const pct = usage.percent;
    const reset = fmtReset(usage);
    const resetPart = reset !== '?' ? `${DIM} (${reset})${RESET}` : '';
    if (showBar) {
      parts.push(`${quotaBar(pct)} ${getUsageColor(pct)}${pct}%${RESET}${DIM} ${label}${RESET}${resetPart}`);
    } else {
      parts.push(`${getUsageColor(pct)}${pct}%${RESET}${DIM} ${label}${RESET}${resetPart}`);
    }
  };

  const rollingPct = rolling?.percent ?? 0;
  const usageLabel = rollingPct >= 90
    ? `${RED}${tr.usageWarning}${RESET}`
    : `${DIM}${tr.usage}${RESET}`;
  parts.push(usageLabel);

  const barEnabled = config.display.usageBarEnabled;
  renderWindow(rolling, tr.perRolling, barEnabled);
  renderWindow(weekly, tr.perWeekly, barEnabled);
  renderWindow(monthly, tr.perMonthly, barEnabled);

  return parts.join(' ');
}
