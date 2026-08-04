/**
 * English translations
 */

export const en = {
  // Init
  init: '[opencode-go-hud] Init...',

  // No data
  noApiKey: '[opencode-go-hud] No credentials',
  noUsageData: '[opencode-go-hud] No usage data',
  fetchFailed: '[opencode-go-hud] Failed to fetch',

  // Labels
  usage: 'Usage',
  usageWarning: '⚠ Usage',
  perRolling: '/ 5h',
  perWeekly: '/ week',
  perMonthly: '/ month',

  // Context
  context: 'Context',
  tokens: 'tokens',
  inputTokens: 'in',
  cacheTokens: 'cache',

  // Git
  gitBranch: 'Git',
  dirty: '⚡',
  ahead: '↑',
  behind: '↓',

  // Tools
  tools: 'Tools',
  running: 'running',
  completed: 'done',
  errorLabel: 'error',

  // Agents
  agents: 'Agents',

  // Todos
  todos: 'Todos',
  pending: 'pending',
  inProgress: 'in progress',
  completedLabel: 'completed',

  // Session
  session: 'Session',
  duration: 'Duration',
  speed: 'Speed',
  tokensPerSec: 'tok/s',

  // Memory
  memory: 'Memory',
  used: 'used',

  // Config
  claudeMdFiles: '.claude.md',
  rules: 'rules',
  mcpServers: 'MCP',
  hooks: 'hooks',

  // Errors
  error: 'Error',
};

export type Translations = typeof en;
