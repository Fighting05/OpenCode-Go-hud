/**
 * Main render orchestrator
 */

import type { RenderContext } from '../types.js';
import { RESET, DIM } from '../colors.js';
import { renderIdentityLine, renderProjectLine, renderUsageLine, renderGitLine } from './lines/index.js';
import { renderToolsLine } from './tools-line.js';
import { renderAgentsLine } from './agents-line.js';
import { renderTodosLine } from './todos-line.js';

// ANSI escape pattern for parsing
const ANSI_ESCAPE_PATTERN = /^\x1b\[[0-9;]*m/;

function getTerminalWidth(): number | null {
  const stdoutColumns = process.stdout?.columns;
  if (typeof stdoutColumns === 'number' && Number.isFinite(stdoutColumns) && stdoutColumns > 0) {
    return Math.floor(stdoutColumns);
  }
  const envColumns = Number.parseInt(process.env.COLUMNS ?? '', 10);
  if (Number.isFinite(envColumns) && envColumns > 0) {
    return envColumns;
  }
  return null;
}

function visualLength(str: string): number {
  let width = 0;
  let inAnsi = false;

  for (const char of str) {
    if (char === '\x1b') {
      inAnsi = true;
    } else if (inAnsi && char === 'm') {
      inAnsi = false;
    } else if (!inAnsi) {
      width += 1;
    }
  }

  return width;
}

function truncateToWidth(str: string, maxWidth: number): string {
  if (maxWidth <= 0 || visualLength(str) <= maxWidth) {
    return str;
  }

  let width = 0;
  let result = '';
  let inAnsi = false;
  let ansiBuffer = '';

  for (const char of str) {
    if (char === '\x1b') {
      inAnsi = true;
      ansiBuffer = char;
    } else if (inAnsi && char === 'm') {
      inAnsi = false;
      ansiBuffer += char;
      result += ansiBuffer;
      ansiBuffer = '';
    } else if (inAnsi) {
      ansiBuffer += char;
    } else {
      if (width + 1 > maxWidth - 3) {
        result += '...' + RESET;
        break;
      }
      result += char;
      width += 1;
    }
  }

  return result;
}

function collectActivityLines(ctx: RenderContext): string[] {
  const activityLines: string[] = [];
  const display = ctx.config?.display;

  if (display?.showTools !== false) {
    const toolsLine = renderToolsLine(ctx);
    if (toolsLine) activityLines.push(toolsLine);
  }

  if (display?.showAgents !== false) {
    const agentsLine = renderAgentsLine(ctx);
    if (agentsLine) activityLines.push(agentsLine);
  }

  if (display?.showTodos !== false) {
    const todosLine = renderTodosLine(ctx);
    if (todosLine) activityLines.push(todosLine);
  }

  return activityLines;
}

function renderExpanded(ctx: RenderContext): string[] {
  const lines: string[] = [];

  const projectLine = renderProjectLine(ctx);
  if (projectLine) lines.push(projectLine);

  const identityLine = renderIdentityLine(ctx);
  const usageLine = renderUsageLine(ctx);

  if (identityLine && usageLine) {
    lines.push(`${identityLine} \u2502 ${usageLine}`);
  } else if (identityLine) {
    lines.push(identityLine);
  }

  const gitLine = renderGitLine(ctx);
  if (gitLine) lines.push(gitLine);

  return lines;
}

function renderCompact(_ctx: RenderContext): string[] {
  // Compact mode - just identity
  return [];
}

export function render(ctx: RenderContext): void {
  const lineLayout = ctx.config?.lineLayout ?? 'expanded';
  const terminalWidth = getTerminalWidth();

  const headerLines = lineLayout === 'expanded'
    ? renderExpanded(ctx)
    : renderCompact(ctx);

  const activityLines = collectActivityLines(ctx);

  const lines: string[] = [...headerLines, ...activityLines];

  const physicalLines = lines.flatMap(line => line.split('\n'));
  const visibleLines = terminalWidth
    ? physicalLines.map(line => truncateToWidth(line, terminalWidth))
    : physicalLines;

  for (const line of visibleLines) {
    if (line.trim()) {
      console.log(`${RESET}${line}`);
    }
  }
}
