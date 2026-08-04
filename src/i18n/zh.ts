/**
 * Chinese translations
 */

import type { Translations } from './en.js';

export const zh: Translations = {
  // Init
  init: '[opencode-go-hud] 初始化...',

  // No data
  noApiKey: '[opencode-go-hud] 未配置凭据',
  noUsageData: '[opencode-go-hud] 无用量数据',
  fetchFailed: '[opencode-go-hud] 获取失败',

  // Labels
  usage: '用量',
  usageWarning: '⚠ 用量',
  perRolling: '/ 5小时',
  perWeekly: '/ 周',
  perMonthly: '/ 月',

  // Context
  context: '上下文',
  tokens: '令牌',
  inputTokens: '输入',
  cacheTokens: '缓存',

  // Git
  gitBranch: 'Git',
  dirty: '⚡',
  ahead: '↑',
  behind: '↓',

  // Tools
  tools: '工具',
  running: '运行中',
  completed: '完成',
  errorLabel: '错误',

  // Agents
  agents: '代理',

  // Todos
  todos: '待办',
  pending: '待处理',
  inProgress: '进行中',
  completedLabel: '已完成',

  // Session
  session: '会话',
  duration: '时长',
  speed: '速度',
  tokensPerSec: '令牌/秒',

  // Memory
  memory: '内存',
  used: '已用',

  // Config
  claudeMdFiles: '.claude.md',
  rules: '规则',
  mcpServers: 'MCP',
  hooks: '钩子',

  // Errors
  error: '错误',
};
