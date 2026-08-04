#!/usr/bin/env node

/**
 * OpenCode Go HUD - A lightweight status line for OpenCode Go subscribers
 *
 * Activates ONLY when the environment signals the OpenCode Go subscription
 * (see activation config). Otherwise it stays completely silent so it never
 * interferes with MiniMax or official Claude sessions.
 *
 * Features:
 * - Context window usage bar with token count
 * - Official OpenCode Go usage: rolling (5h), weekly, monthly windows
 * - Git status (branch, dirty, ahead/behind)
 * - Project path display
 * - i18n support (English/Chinese)
 *
 * Install:
 * 1. Build: npm run build
 * 2. Add to ~/.claude/settings.json:
 *    {
 *      "statusLine": {
 *        "command": "bash -c '\"/path/to/node\" \"/path/to/index.js\"'",
 *        "type": "command"
 *      }
 *    }
 */

import { parseStdin } from './stdin.js';
import { parseTranscript } from './transcript.js';
import { getGitStatus } from './git.js';
import { loadConfig } from './config.js';
import { readCache, writeCache } from './cache.js';
import { fetchOpenCodeUsage } from './api.js';
import { render } from './render/index.js';
import { t } from './i18n/index.js';
import type { HudConfig, UsageCache, UsageData, RenderContext } from './types.js';

// ============================================================================
// Activation detection
// ============================================================================

function normalizeModelName(name: string): string {
  return name.toLowerCase().split('[')[0].trim();
}

/**
 * Detect whether the current Claude Code session is routed to the OpenCode Go
 * plan (via cc-switch). When not active, the HUD outputs nothing at all.
 */
function isOpenCodeGo(config: HudConfig): boolean {
  const key = config.activation.envKey;
  const raw = process.env[key];
  if (!raw) return false;
  const normalized = normalizeModelName(raw);
  return config.activation.modelNames.some((m) => normalized === m.toLowerCase());
}

// ============================================================================
// Main
// ============================================================================

async function main(): Promise<void> {
  const config = loadConfig();

  // Activation gate: stay silent unless routed to OpenCode Go.
  if (!isOpenCodeGo(config)) {
    return;
  }

  try {
    const tr = t(config.language);

    // Parse stdin
    const stdin = await parseStdin();

    // Check if initialized (empty stdin)
    if (!stdin.cwd && !stdin.model && !stdin.context_window) {
      console.log(`${tr.init}`);
      return;
    }

    // Fetch usage (with cache)
    let usage: UsageData | null = null;
    const cached = readCache();

    if (cached) {
      usage = {
        rolling: cached.rolling != null ? { percent: cached.rolling, resetInSec: null, status: null } : null,
        weekly: cached.weekly != null ? { percent: cached.weekly, resetInSec: null, status: null } : null,
        monthly: cached.monthly != null ? { percent: cached.monthly, resetInSec: null, status: null } : null,
      };
    } else {
      const fetched = await fetchOpenCodeUsage(config.opencode);

      if (fetched.apiUnavailable) {
        // Still render context/git rather than bail out; usage line will be empty.
        usage = fetched;
      } else {
        const cacheEntry: UsageCache = {
          rolling: fetched.rolling?.percent ?? null,
          weekly: fetched.weekly?.percent ?? null,
          monthly: fetched.monthly?.percent ?? null,
        };
        writeCache(cacheEntry);
        usage = fetched;
      }
    }

    // Parse transcript for tools, agents, todos
    const transcriptPath = stdin.transcript_path;
    const transcript = transcriptPath
      ? await parseTranscript(transcriptPath)
      : { tools: [], agents: [], todos: [] };

    // Get git status
    let gitStatus = null;
    if (stdin.cwd && config.gitStatus.enabled) {
      gitStatus = await getGitStatus(stdin.cwd);
    }

    // Build render context
    const ctx: RenderContext = {
      stdin,
      transcript,
      gitStatus,
      usageData: usage,
      config,
      extraLabel: null,
    };

    // Render
    render(ctx);

  } catch (error) {
    console.log(`[opencode-go-hud] Error: ${(error as Error).message}`);
  }
}

main();
