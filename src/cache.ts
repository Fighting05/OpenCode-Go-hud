/**
 * Cache management for OpenCode Go HUD
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import type { Usage, UsageCache } from './types.js';

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

/**
 * Normalize one cached window entry. Old caches stored bare percentages
 * (numbers); current format stores the full Usage object.
 */
function normalizeWindow(value: unknown): Usage | null {
  if (value == null) return null;
  if (typeof value === 'number') {
    return { percent: value, resetInSec: null, status: null };
  }
  if (typeof value === 'object' && typeof (value as Partial<Usage>).percent === 'number') {
    const v = value as Partial<Usage>;
    return {
      percent: v.percent as number,
      resetInSec: v.resetInSec ?? null,
      status: v.status ?? null,
      resetText: v.resetText ?? null,
    };
  }
  return null;
}

export function readCache(): UsageCache | null {
  try {
    const cachePath = getCachePath();
    if (!fs.existsSync(cachePath)) return null;

    const content = fs.readFileSync(cachePath, 'utf8');
    const cache = JSON.parse(content);

    const ageMs = Date.now() - cache.timestamp;
    if (ageMs > CACHE_TTL_MS) return null;

    // Keep the reset countdown roughly live within the TTL window.
    const elapsedSec = Math.max(0, Math.floor(ageMs / 1000));
    const rawUsage = cache.usage ?? {};
    const adjust = (value: unknown): Usage | null => {
      const u = normalizeWindow(value);
      if (u && u.resetInSec != null) u.resetInSec = Math.max(0, u.resetInSec - elapsedSec);
      return u;
    };

    return {
      rolling: adjust(rawUsage.rolling),
      weekly: adjust(rawUsage.weekly),
      monthly: adjust(rawUsage.monthly),
    };
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
