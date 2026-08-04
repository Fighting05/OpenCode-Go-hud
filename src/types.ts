/**
 * Types for OpenCode Go HUD
 */

// ============================================================================
// Stdin Types (from Claude Code)
// ============================================================================

export interface StdinData {
  transcript_path?: string;
  cwd?: string;
  model?: {
    id?: string;
    display_name?: string;
  };
  context_window?: {
    context_window_size?: number;
    current_usage?: {
      input_tokens?: number;
      output_tokens?: number;
      cache_creation_input_tokens?: number;
      cache_read_input_tokens?: number;
    } | null;
    used_percentage?: number | null;
    remaining_percentage?: number | null;
  };
}

// ============================================================================
// Transcript Types (from transcript JSONL)
// ============================================================================

export interface ToolEntry {
  id: string;
  name: string;
  target?: string;
  status: 'running' | 'completed' | 'error';
  startTime: Date;
  endTime?: Date;
}

export interface AgentEntry {
  id: string;
  type: string;
  model?: string;
  description?: string;
  status: 'running' | 'completed';
  startTime: Date;
  endTime?: Date;
}

export interface TodoItem {
  content: string;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface TranscriptData {
  tools: ToolEntry[];
  agents: AgentEntry[];
  todos: TodoItem[];
  sessionStart?: Date;
  sessionName?: string;
}

// ============================================================================
// Usage Types (from OpenCode Go workspace page)
// ============================================================================

export interface Usage {
  percent: number;          // 0-100, used percentage
  resetInSec: number | null; // seconds until next reset
  status: string | null;
  resetText?: string | null; // DOM fallback: raw "重置于 X 天 Y 小时" text
}

export interface UsageData {
  rolling: Usage | null;  // 5-hour window
  weekly: Usage | null;   // 7-day window
  monthly: Usage | null;  // 30-day window
  apiUnavailable?: boolean;
  apiError?: string;
}

export interface UsageCache {
  rolling: number | null;
  weekly: number | null;
  monthly: number | null;
}

// ============================================================================
// Git Types
// ============================================================================

export interface FileStats {
  modified: number;
  added: number;
  deleted: number;
  untracked: number;
}

export interface GitStatus {
  branch: string;
  isDirty: boolean;
  ahead: number;
  behind: number;
  fileStats?: FileStats;
}

// ============================================================================
// Render Context
// ============================================================================

export interface RenderContext {
  stdin: StdinData;
  transcript: TranscriptData;
  gitStatus: GitStatus | null;
  usageData: UsageData | null;
  config: HudConfig;
  extraLabel: string | null;
}

// ============================================================================
// Config Types
// ============================================================================

export type LineLayoutType = 'compact' | 'expanded';
export type AutocompactBufferMode = 'enabled' | 'disabled';
export type ContextValueMode = 'percent' | 'tokens' | 'remaining';
export type Language = 'en' | 'zh';

export interface GitStatusConfig {
  enabled: boolean;
  showDirty: boolean;
  showAheadBehind: boolean;
  showFileStats: boolean;
}

export interface DisplayConfig {
  showModel: boolean;
  showProject: boolean;
  showContextBar: boolean;
  contextValue: ContextValueMode;
  showConfigCounts: boolean;
  showDuration: boolean;
  showSpeed: boolean;
  showTokenBreakdown: boolean;
  showUsage: boolean;
  usageBarEnabled: boolean;
  showTools: boolean;
  showAgents: boolean;
  showTodos: boolean;
  autocompactBuffer: AutocompactBufferMode;
  usageThreshold: number;
  sevenDayThreshold: number;
  environmentThreshold: number;
}

export interface OpenCodeConfig {
  authCookie: string;
  workspaceId: string;
  locale: string;
  timeout: number;
  userAgent: string;
}

export interface ActivationConfig {
  envKey: string;
  modelNames: string[];
}

export interface HudConfig {
  language: Language;
  lineLayout: LineLayoutType;
  showSeparators: boolean;
  pathLevels: 1 | 2 | 3;
  gitStatus: GitStatusConfig;
  display: DisplayConfig;
  opencode: OpenCodeConfig;
  activation: ActivationConfig;
}
