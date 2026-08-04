/**
 * Tools line renderer
 */

import type { RenderContext } from '../types.js';
import { RESET, DIM, GREEN, RED, MAGENTA, CYAN } from '../colors.js';
import { t } from '../i18n/index.js';

export function renderToolsLine(ctx: RenderContext): string | null {
  const { transcript, config } = ctx;
  if (!config.display.showTools) return null;

  const tr = t(config.language);

  // Get running tools
  const runningTools = transcript.tools.filter(t => t.status === 'running');
  const recentTools = transcript.tools.slice(-5);

  if (runningTools.length === 0 && recentTools.length === 0) return null;

  const parts: string[] = [];

  // Running tools
  if (runningTools.length > 0) {
    const toolNames = runningTools.map(t => {
      const target = t.target ? ` ${t.target}` : '';
      return `${CYAN}${t.name}${target}${RESET}`;
    });
    parts.push(`${tr.tools}: ${toolNames.join(', ')}`);
  }

  // Recent completed tools (show last one briefly)
  const lastTool = recentTools[recentTools.length - 1];
  if (lastTool && lastTool.status === 'completed') {
    const target = lastTool.target ? ` ${lastTool.target}` : '';
    parts.push(`${DIM}${lastTool.name}${target} ${tr.completed}${RESET}`);
  }

  return parts.join(' | ');
}
