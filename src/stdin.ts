/**
 * Parse stdin from Claude Code
 */

import type { StdinData } from './types.js';

/**
 * Read and parse stdin from Claude Code
 * Claude Code sends JSON data through stdin for status line plugins
 */
export async function parseStdin(): Promise<StdinData> {
  // Check if initialized (empty stdin)
  if (process.stdin.isTTY) {
    return {};
  }

  let stdinData = '';
  for await (const chunk of process.stdin) {
    stdinData += chunk;
  }

  if (!stdinData.trim()) {
    return {};
  }

  try {
    return JSON.parse(stdinData) as StdinData;
  } catch {
    return {};
  }
}
