#!/usr/bin/env node

/**
 * Probe OpenCode Go usage with real credentials.
 *
 * Reads authCookie / workspaceId from the HUD config
 * (~/.claude/plugins/marketplaces/opencode-go-hud/config.json).
 *
 * Usage: node scripts/probe.js
 */

import { loadConfig, getConfigPath } from '../dist/config.js';
import { fetchOpenCodeUsage } from '../dist/api.js';

const config = loadConfig();

console.log(`config: ${getConfigPath()}`);
console.log(`workspaceId: ${config.opencode.workspaceId ? '✓ configured' : '✗ EMPTY'}`);
console.log(`authCookie: ${config.opencode.authCookie ? `✓ set (${config.opencode.authCookie.slice(0, 6)}...)` : '✗ EMPTY'}`);

const result = await fetchOpenCodeUsage(config.opencode);
console.log('\nResult:');
console.log(JSON.stringify(result, null, 2));

if (result.apiUnavailable) {
  console.log('\n[probe] FAILED:', result.apiError);
  process.exit(1);
}
console.log('\n[probe] OK');
