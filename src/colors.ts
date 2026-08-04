/**
 * ANSI Colors for MiniMax HUD
 */

export const RESET = '\x1b[0m';
export const DIM = '\x1b[2m';
export const BRIGHT = '\x1b[1m';
export const CYAN = '\x1b[36m';
export const YELLOW = '\x1b[33m';
export const GREEN = '\x1b[32m';
export const MAGENTA = '\x1b[35m';
export const RED = '\x1b[31m';
export const BLUE = '\x1b[34m';

export function getUsageColor(percent: number): string {
  if (percent >= 90) return RED;
  if (percent >= 75) return MAGENTA;
  if (percent >= 50) return YELLOW;
  return GREEN;
}

export function getContextColor(percent: number): string {
  if (percent >= 85) return RED;
  if (percent >= 70) return MAGENTA;
  if (percent >= 50) return YELLOW;
  return GREEN;
}

export function dim(text: string): string {
  return `${DIM}${text}${RESET}`;
}

export function cyan(text: string): string {
  return `${CYAN}${text}${RESET}`;
}

export function yellow(text: string): string {
  return `${YELLOW}${text}${RESET}`;
}

export function green(text: string): string {
  return `${GREEN}${text}${RESET}`;
}

export function red(text: string): string {
  return `${RED}${text}${RESET}`;
}

export function magenta(text: string): string {
  return `${MAGENTA}${text}${RESET}`;
}

export function blue(text: string): string {
  return `${BLUE}${text}${RESET}`;
}
