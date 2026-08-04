/**
 * Git status for MiniMax HUD
 */

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import type { GitStatus, FileStats } from './types.js';

const execFileAsync = promisify(execFile);

// ============================================================================
// Git Status
// ============================================================================

export async function getGitStatus(cwd?: string): Promise<GitStatus | null> {
  if (!cwd) return null;

  try {
    // Get branch name
    const { stdout: branchOut } = await execFileAsync(
      'git',
      ['rev-parse', '--abbrev-ref', 'HEAD'],
      { cwd, timeout: 1000, encoding: 'utf8' }
    );
    const branch = branchOut.trim();
    if (!branch) return null;

    // Check for dirty state and parse file stats
    let isDirty = false;
    let fileStats: FileStats | undefined;
    try {
      const { stdout: statusOut } = await execFileAsync(
        'git',
        ['--no-optional-locks', 'status', '--porcelain'],
        { cwd, timeout: 1000, encoding: 'utf8' }
      );
      const trimmed = statusOut.trim();
      isDirty = trimmed.length > 0;
      if (isDirty) {
        fileStats = parseFileStats(trimmed);
      }
    } catch {
      // Ignore errors, assume clean
    }

    // Get ahead/behind counts
    let ahead = 0;
    let behind = 0;
    try {
      const { stdout: revOut } = await execFileAsync(
        'git',
        ['rev-list', '--left-right', '--count', '@{upstream}...HEAD'],
        { cwd, timeout: 1000, encoding: 'utf8' }
      );
      const parts = revOut.trim().split(/\s+/);
      if (parts.length === 2) {
        behind = parseInt(parts[0], 10) || 0;
        ahead = parseInt(parts[1], 10) || 0;
      }
    } catch {
      // No upstream or error, keep 0/0
    }

    return { branch, isDirty, ahead, behind, fileStats };
  } catch {
    return null;
  }
}

// ============================================================================
// Parse File Stats
// ============================================================================

/**
 * Parse git status --porcelain output and count file stats
 * Status codes: M=modified, A=added, D=deleted, ??=untracked
 */
function parseFileStats(porcelainOutput: string): FileStats {
  const stats: FileStats = { modified: 0, added: 0, deleted: 0, untracked: 0 };
  const lines = porcelainOutput.split('\n').filter(Boolean);

  for (const line of lines) {
    if (line.length < 2) continue;

    const index = line[0];    // staged status
    const worktree = line[1]; // unstaged status

    if (line.startsWith('??')) {
      stats.untracked++;
    } else if (index === 'A') {
      stats.added++;
    } else if (index === 'D' || worktree === 'D') {
      stats.deleted++;
    } else if (index === 'M' || worktree === 'M' || index === 'R' || index === 'C') {
      stats.modified++;
    }
  }

  return stats;
}
