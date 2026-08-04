/**
 * Cache management for OpenCode Go HUD
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import type { UsageCache } from './types.js';

// ============================================================================
// Constants
// ============================================================================

const CACHE_DIR_NAME = '.claude';
const PLUGIN_DIR_NAME = 'plugins';
const HUD_DIR_NAME = 'opencode-go-hud';
const CACHE_FILE_NAME = '.usage-cache.json';
const CACHE_TTL_MS = 60_000; // 60 seconds

// ============================================================================
// Path Helpers
// ============================================================================

function getCachePath(): string {
  const homeDir = os.homedir();
  return path.join(homeDir, CACHE_DIR_NAME, PLUGIN_DIR_NAME, HUD_DIR_NAME, CACHE_FILE_NAME);
}

// ============================================================================
// Cache Operations
// ============================================================================

export function readCache(): UsageCache | null {
  try {
    const cachePath = getCachePath();
    if (!fs.existsSync(cachePath)) return null;

    const content = fs.readFileSync(cachePath, 'utf8');
    const cache = JSON.parse(content);

    if (Date.now() - cache.timestamp > CACHE_TTL_MS) return null;

    return cache.usage as UsageCache;
  } catch {
    return null;
  }
}

export function writeCache(usage: UsageCache): void {
  try {
    const cachePath = getCachePath();
    const cacheDir = path.dirname(cachePath);

    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    fs.writeFileSync(cachePath, JSON.stringify({
      timestamp: Date.now(),
      usage
    }), 'utf8');
  } catch {
    // Ignore cache write failures
  }
}
