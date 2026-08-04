/**
 * Agents line renderer
 */

import type { RenderContext } from '../types.js';
import { RESET, DIM, MAGENTA, CYAN } from '../colors.js';
import { t } from '../i18n/index.js';

export function renderAgentsLine(ctx: RenderContext): string | null {
  const { transcript, config } = ctx;
  if (!config.display.showAgents) return null;

  const tr = t(config.language);

  // Get running agents
  const runningAgents = transcript.agents.filter(a => a.status === 'running');

  if (runningAgents.length === 0) return null;

  const agentDescs = runningAgents.map(a => {
    const desc = a.description ? `: ${a.description}` : '';
    const model = a.model ? ` (${a.model})` : '';
    return `${MAGENTA}${a.type}${model}${desc}${RESET}`;
  });

  return `${tr.agents}: ${agentDescs.join(', ')}`;
}
