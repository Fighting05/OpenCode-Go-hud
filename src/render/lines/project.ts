/**
 * Project path renderer
 */

import type { RenderContext } from '../../types.js';
import { RESET, YELLOW, DIM } from '../../colors.js';
import { t } from '../../i18n/index.js';

export function renderProjectLine(ctx: RenderContext): string | null {
  const { stdin, config } = ctx;
  if (!config.display.showProject) return null;

  const tr = t(config.language);

  // Get project path from cwd
  let projectPath: string | null = null;
  if (stdin.cwd) {
    // Normalize Windows paths
    let cwd = stdin.cwd.replace(/\\/g, '/').replace(/^\/([A-Z])\//i, '$1:/');
    const dirs = cwd.split(/[/]/).filter(Boolean);
    const levels = config.pathLevels || 1;
    projectPath = dirs.slice(-levels).join('/');
  }

  // Filter out plugin directories
  if (projectPath &&
      !projectPath.includes('minimax-hud') &&
      !projectPath.includes('claude-hud') &&
      !projectPath.includes('marketplaces')) {
    return `${YELLOW}${projectPath}${RESET}`;
  }

  return null;
}
