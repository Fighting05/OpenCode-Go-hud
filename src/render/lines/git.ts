/**
 * Git status renderer
 */

import type { RenderContext } from '../../types.js';
import { RESET, DIM, GREEN, RED, YELLOW } from '../../colors.js';
import { t } from '../../i18n/index.js';

export function renderGitLine(ctx: RenderContext): string | null {
  const { gitStatus, config } = ctx;
  if (!config.gitStatus.enabled || !gitStatus) return null;

  const tr = t(config.language);
  const parts: string[] = [];

  // Branch name
  parts.push(`${GREEN}${gitStatus.branch}${RESET}`);

  // Dirty indicator
  if (config.gitStatus.showDirty && gitStatus.isDirty) {
    parts.push(`${RED}${tr.dirty}${RESET}`);
  }

  // Ahead/behind
  if (config.gitStatus.showAheadBehind) {
    if (gitStatus.ahead > 0) {
      parts.push(`${YELLOW}${tr.ahead}${gitStatus.ahead}${RESET}`);
    }
    if (gitStatus.behind > 0) {
      parts.push(`${YELLOW}${tr.behind}${gitStatus.behind}${RESET}`);
    }
  }

  // File stats
  if (config.gitStatus.showFileStats && gitStatus.fileStats) {
    const { modified, added, deleted, untracked } = gitStatus.fileStats;
    const stats: string[] = [];
    if (modified > 0) stats.push(`~${modified}`);
    if (added > 0) stats.push(`+${added}`);
    if (deleted > 0) stats.push(`-${deleted}`);
    if (untracked > 0) stats.push(`?${untracked}`);
    if (stats.length > 0) {
      parts.push(`${DIM}${stats.join(' ')}${RESET}`);
    }
  }

  return parts.length > 0 ? parts.join(' ') : null;
}
