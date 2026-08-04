/**
 * Todos line renderer
 */

import type { RenderContext } from '../types.js';
import { RESET, DIM, YELLOW, GREEN } from '../colors.js';
import { t } from '../i18n/index.js';

export function renderTodosLine(ctx: RenderContext): string | null {
  const { transcript, config } = ctx;
  if (!config.display.showTodos) return null;

  const tr = t(config.language);

  const todos = transcript.todos;
  if (todos.length === 0) return null;

  // Count by status
  const completed = todos.filter(t => t.status === 'completed').length;
  const inProgress = todos.filter(t => t.status === 'in_progress').length;
  const pending = todos.filter(t => t.status === 'pending').length;

  const parts: string[] = [];

  // Show progress
  parts.push(`${tr.todos}: ${completed}/${todos.length}`);

  // Show in-progress items
  const inProgressItems = todos.filter(t => t.status === 'in_progress');
  if (inProgressItems.length > 0) {
    const itemText = inProgressItems[0].content.slice(0, 30);
    parts.push(`${YELLOW}${itemText}${RESET}`);
  }

  return parts.join(' | ');
}
