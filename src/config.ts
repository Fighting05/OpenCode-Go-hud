/**
 * Configuration system for OpenCode Go HUD
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import type { ActivationConfig, HudConfig, LineLayoutType, Language, AutocompactBufferMode, ContextValueMode, OpenCodeConfig } from './types.js';

// ============================================================================
// Constants
// ============================================================================

const PLUGIN_DIR = '.claude';
const PLUGIN_NAME = 'plugins';
const HUD_DIR = 'marketplaces/opencode-go-hud';

const DEFAULT_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36';

// Models offered by the OpenCode Go subscription plan
export const DEFAULT_OPENCODE_MODELS = [
  'deepseek-v4-flash',
  'deepseek-v4-pro',
  'glm-5.2',
  'glm-5.1',
  'glm-5',
  'kimi-k3',
  'kimi-k2.6',
  'kimi-k2.5',
  'qwen3.6-plus',
  'qwen3.5-plus',
  'mimo-v2.5-pro',
  'mimo-v2.5',
  'mimo-v2-pro',
  'mimo-v2-omni',
  'minimax-m2.7',
  'minimax-m2.5',
  'gpt-5.6-luna',
];

export const DEFAULT_CONFIG: HudConfig = {
  language: 'zh',
  lineLayout: 'expanded',
  showSeparators: false,
  pathLevels: 1,
  gitStatus: {
    enabled: true,
    showDirty: true,
    showAheadBehind: false,
    showFileStats: false,
  },
  display: {
    showModel: true,
    showProject: true,
    showContextBar: true,
    contextValue: 'percent',
    showConfigCounts: false,
    showDuration: false,
    showSpeed: false,
    showTokenBreakdown: true,
    showUsage: true,
    usageBarEnabled: true,
    showTools: false,
    showAgents: false,
    showTodos: false,
    autocompactBuffer: 'enabled',
    usageThreshold: 0,
    sevenDayThreshold: 5,
    environmentThreshold: 0,
  },
  opencode: {
    authCookie: '',
    workspaceId: '',
    locale: 'zh',
    timeout: 10000,
    userAgent: DEFAULT_USER_AGENT,
  },
  activation: {
    envKey: 'ANTHROPIC_DEFAULT_SONNET_MODEL_NAME',
    modelNames: DEFAULT_OPENCODE_MODELS,
  },
};

// ============================================================================
// Path Helpers
// ============================================================================

function getHudPluginDir(homeDir: string): string {
  return path.join(homeDir, PLUGIN_DIR, PLUGIN_NAME, HUD_DIR);
}

export function getConfigPath(): string {
  const homeDir = os.homedir();
  return path.join(getHudPluginDir(homeDir), 'config.json');
}

// ============================================================================
// Validation
// ============================================================================

function validatePathLevels(value: unknown): value is 1 | 2 | 3 {
  return value === 1 || value === 2 || value === 3;
}

function validateLineLayout(value: unknown): value is LineLayoutType {
  return value === 'compact' || value === 'expanded';
}

function validateLanguage(value: unknown): value is Language {
  return value === 'en' || value === 'zh';
}

function validateAutocompactBuffer(value: unknown): value is AutocompactBufferMode {
  return value === 'enabled' || value === 'disabled';
}

function validateContextValue(value: unknown): value is ContextValueMode {
  return value === 'percent' || value === 'tokens' || value === 'remaining';
}

function validateThreshold(value: unknown, max = 100): number {
  if (typeof value !== 'number') return 0;
  return Math.max(0, Math.min(max, value));
}

function asString(value: unknown, fallback: string): string {
  return typeof value === 'string' ? value : fallback;
}

function asPositiveNumber(value: unknown, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.max(1, value);
}

// ============================================================================
// Config Merge
// ============================================================================

export function mergeConfig(userConfig: Partial<HudConfig>): HudConfig {
  const language = validateLanguage(userConfig.language)
    ? userConfig.language
    : DEFAULT_CONFIG.language;

  const lineLayout = validateLineLayout(userConfig.lineLayout)
    ? userConfig.lineLayout
    : DEFAULT_CONFIG.lineLayout;

  const showSeparators = typeof userConfig.showSeparators === 'boolean'
    ? userConfig.showSeparators
    : DEFAULT_CONFIG.showSeparators;

  const pathLevels = validatePathLevels(userConfig.pathLevels)
    ? userConfig.pathLevels
    : DEFAULT_CONFIG.pathLevels;

  const gitStatus = {
    enabled: typeof userConfig.gitStatus?.enabled === 'boolean'
      ? userConfig.gitStatus.enabled
      : DEFAULT_CONFIG.gitStatus.enabled,
    showDirty: typeof userConfig.gitStatus?.showDirty === 'boolean'
      ? userConfig.gitStatus.showDirty
      : DEFAULT_CONFIG.gitStatus.showDirty,
    showAheadBehind: typeof userConfig.gitStatus?.showAheadBehind === 'boolean'
      ? userConfig.gitStatus.showAheadBehind
      : DEFAULT_CONFIG.gitStatus.showAheadBehind,
    showFileStats: typeof userConfig.gitStatus?.showFileStats === 'boolean'
      ? userConfig.gitStatus.showFileStats
      : DEFAULT_CONFIG.gitStatus.showFileStats,
  };

  const display = {
    showModel: typeof userConfig.display?.showModel === 'boolean'
      ? userConfig.display.showModel
      : DEFAULT_CONFIG.display.showModel,
    showProject: typeof userConfig.display?.showProject === 'boolean'
      ? userConfig.display.showProject
      : DEFAULT_CONFIG.display.showProject,
    showContextBar: typeof userConfig.display?.showContextBar === 'boolean'
      ? userConfig.display.showContextBar
      : DEFAULT_CONFIG.display.showContextBar,
    contextValue: validateContextValue(userConfig.display?.contextValue)
      ? userConfig.display.contextValue
      : DEFAULT_CONFIG.display.contextValue,
    showConfigCounts: typeof userConfig.display?.showConfigCounts === 'boolean'
      ? userConfig.display.showConfigCounts
      : DEFAULT_CONFIG.display.showConfigCounts,
    showDuration: typeof userConfig.display?.showDuration === 'boolean'
      ? userConfig.display.showDuration
      : DEFAULT_CONFIG.display.showDuration,
    showSpeed: typeof userConfig.display?.showSpeed === 'boolean'
      ? userConfig.display.showSpeed
      : DEFAULT_CONFIG.display.showSpeed,
    showTokenBreakdown: typeof userConfig.display?.showTokenBreakdown === 'boolean'
      ? userConfig.display.showTokenBreakdown
      : DEFAULT_CONFIG.display.showTokenBreakdown,
    showUsage: typeof userConfig.display?.showUsage === 'boolean'
      ? userConfig.display.showUsage
      : DEFAULT_CONFIG.display.showUsage,
    usageBarEnabled: typeof userConfig.display?.usageBarEnabled === 'boolean'
      ? userConfig.display.usageBarEnabled
      : DEFAULT_CONFIG.display.usageBarEnabled,
    showTools: typeof userConfig.display?.showTools === 'boolean'
      ? userConfig.display.showTools
      : DEFAULT_CONFIG.display.showTools,
    showAgents: typeof userConfig.display?.showAgents === 'boolean'
      ? userConfig.display.showAgents
      : DEFAULT_CONFIG.display.showAgents,
    showTodos: typeof userConfig.display?.showTodos === 'boolean'
      ? userConfig.display.showTodos
      : DEFAULT_CONFIG.display.showTodos,
    autocompactBuffer: validateAutocompactBuffer(userConfig.display?.autocompactBuffer)
      ? userConfig.display.autocompactBuffer
      : DEFAULT_CONFIG.display.autocompactBuffer,
    usageThreshold: validateThreshold(userConfig.display?.usageThreshold, 100),
    sevenDayThreshold: validateThreshold(userConfig.display?.sevenDayThreshold, 100),
    environmentThreshold: validateThreshold(userConfig.display?.environmentThreshold, 100),
  };

  const opencode: OpenCodeConfig = {
    authCookie: asString(userConfig.opencode?.authCookie, DEFAULT_CONFIG.opencode.authCookie),
    workspaceId: asString(userConfig.opencode?.workspaceId, DEFAULT_CONFIG.opencode.workspaceId),
    locale: asString(userConfig.opencode?.locale, DEFAULT_CONFIG.opencode.locale),
    timeout: asPositiveNumber(userConfig.opencode?.timeout, DEFAULT_CONFIG.opencode.timeout),
    userAgent: asString(userConfig.opencode?.userAgent, DEFAULT_CONFIG.opencode.userAgent),
  };

  const activation: ActivationConfig = {
    envKey: asString(userConfig.activation?.envKey, DEFAULT_CONFIG.activation.envKey),
    modelNames: Array.isArray(userConfig.activation?.modelNames)
      ? userConfig.activation.modelNames.filter((m): m is string => typeof m === 'string')
      : DEFAULT_CONFIG.activation.modelNames,
  };

  return { language, lineLayout, showSeparators, pathLevels, gitStatus, display, opencode, activation };
}

// ============================================================================
// Config Load
// ============================================================================

export function loadConfig(): HudConfig {
  const configPath = getConfigPath();

  try {
    if (!fs.existsSync(configPath)) {
      return DEFAULT_CONFIG;
    }

    const content = fs.readFileSync(configPath, 'utf-8');
    const userConfig = JSON.parse(content) as Partial<HudConfig>;
    return mergeConfig(userConfig);
  } catch {
    return DEFAULT_CONFIG;
  }
}
