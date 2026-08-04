/**
 * OpenCode Go usage fetcher.
 *
 * Fetches the official workspace page (https://opencode.ai/workspace/{ws}/go)
 * authenticated with the browser `auth` cookie, then parses the three usage
 * windows (rolling 5h / weekly / monthly) from inline hydration JSON first,
 * falling back to rendered DOM. Logic mirrors opencode-go-usage-api.
 */

import type { OpenCodeConfig, Usage, UsageData } from './types.js';

// ============================================================================
// Page Structure
// ============================================================================

const USAGE_KEYS: Record<'rolling' | 'weekly' | 'monthly', string> = {
  rolling: 'rollingUsage',
  weekly: 'weeklyUsage',
  monthly: 'monthlyUsage',
};

const DOM_ORDER = ['rolling', 'weekly', 'monthly'] as const;

const LOGIN_TITLE_MARKER = '<title>OpenAuth</title>';

// ============================================================================
// Page Classification
// ============================================================================

function isLoginPage(finalUrl: string, html: string): boolean {
  let host = '';
  let path = '';
  try {
    const u = new URL(finalUrl);
    host = u.hostname;
    path = u.pathname;
  } catch {
    /* ignore malformed url */
  }
  if (host === 'auth.opencode.ai') return true;
  if (host === 'opencode.ai' && path.startsWith('/auth')) return true;
  return html.includes(LOGIN_TITLE_MARKER);
}

function isNoSubscription(html: string): boolean {
  if (!html.includes('data-slot="subscribe-button"')) return false;
  return /lite\s*:\s*null/.test(html) && /liteSubscriptionID\s*:\s*null/.test(html);
}

// ============================================================================
// Inline JSON parsing (primary)
// ============================================================================

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Locate `<key>:` followed by `{` (optionally via a `$R[n]=` hydration prefix)
 * and return the balanced `{...}` block.
 */
function extractUsageBlock(html: string, key: string): string | null {
  const re = new RegExp(escapeRegex(key) + '\\s*:\\s*(?:\\$R\\[\\d+\\]\\s*=\\s*)?\\{');
  const m = re.exec(html);
  if (!m) return null;
  const braceStart = m.index + m[0].length - 1;
  let depth = 0;
  for (let i = braceStart; i < html.length; i++) {
    const c = html[i];
    if (c === '{') {
      depth += 1;
    } else if (c === '}') {
      depth -= 1;
      if (depth === 0) return html.slice(braceStart, i + 1);
    }
  }
  return null;
}

function parseIntField(block: string, field: string): number | null {
  const m = new RegExp(escapeRegex(field) + '\\s*:\\s*(-?\\d+)').exec(block);
  return m ? parseInt(m[1], 10) : null;
}

function parseStrField(block: string, field: string): string | null {
  const m = new RegExp(escapeRegex(field) + '\\s*:\\s*"([^"]*)"').exec(block);
  return m ? m[1] : null;
}

function parseInline(html: string): Record<string, Usage> {
  const result: Record<string, Usage> = {};
  for (const [name, key] of Object.entries(USAGE_KEYS)) {
    const block = extractUsageBlock(html, key);
    if (!block) continue;
    const percent = parseIntField(block, 'usagePercent');
    if (percent === null) continue;
    result[name] = {
      percent,
      resetInSec: parseIntField(block, 'resetInSec'),
      status: parseStrField(block, 'status'),
    };
  }
  return result;
}

// ============================================================================
// DOM fallback parsing
// ============================================================================

function cleanResetText(raw: string): string | null {
  const noComments = raw.replace(/<!--[\s\S]*?-->/g, '');
  const cleaned = noComments.replace(/\s+/g, ' ').trim();
  return cleaned || null;
}

function parseDom(html: string): Record<string, Usage> {
  const result: Record<string, Usage> = {};
  const itemStarts: number[] = [];
  for (const m of html.matchAll(/data-slot="usage-item"/g)) itemStarts.push(m.index);

  for (let idx = 0; idx < DOM_ORDER.length; idx++) {
    if (idx >= itemStarts.length) break;
    const segStart = itemStarts[idx];
    const segEnd = idx + 1 < itemStarts.length ? itemStarts[idx + 1] : segStart + 800;
    const segment = html.slice(segStart, segEnd);

    let m = /data-slot="usage-value">\s*(?:<!--[\s\S]*?-->)?\s*(\d+)/s.exec(segment);
    if (!m) m = /width:\s*(\d+)%/.exec(segment);
    if (!m) continue;

    const rt = /data-slot="reset-time">\s*([\s\S]*?)<\/span>/.exec(segment);
    result[DOM_ORDER[idx]] = {
      percent: parseInt(m[1], 10),
      resetInSec: null,
      status: null,
      resetText: rt ? cleanResetText(rt[1]) : null,
    };
  }
  return result;
}

export function parseUsage(html: string): Record<string, Usage> {
  const inline = parseInline(html);
  if (Object.keys(inline).length === 3) return inline;
  const dom = parseDom(html);
  return { ...dom, ...inline };
}

// ============================================================================
// Fetch
// ============================================================================

export function fetchOpenCodeUsage(opencode: OpenCodeConfig): Promise<UsageData> {
  if (!opencode.workspaceId) {
    return Promise.resolve({
      rolling: null, weekly: null, monthly: null,
      apiUnavailable: true, apiError: 'workspace_id 未配置',
    });
  }
  if (!opencode.authCookie) {
    return Promise.resolve({
      rolling: null, weekly: null, monthly: null,
      apiUnavailable: true, apiError: 'auth cookie 未配置',
    });
  }

  const workspaceUrl = `https://opencode.ai/workspace/${encodeURIComponent(opencode.workspaceId)}/go`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opencode.timeout);

  return fetch(workspaceUrl, {
    redirect: 'follow',
    signal: controller.signal,
    headers: {
      'Cookie': `auth=${opencode.authCookie}; oc_locale=${opencode.locale}`,
      'User-Agent': opencode.userAgent,
      'Accept': 'text/html,application/xhtml+xml',
    },
  })
    .then(async (resp) => {
      const html = await resp.text();
      return { finalUrl: resp.url, status: resp.status, html };
    })
    .then(({ finalUrl, status, html }) => {
      if (isLoginPage(finalUrl, html)) {
        return {
          rolling: null, weekly: null, monthly: null,
          apiUnavailable: true, apiError: '登录凭证已失效，请重新获取 auth cookie',
        } satisfies UsageData;
      }
      if (status !== 200) {
        return {
          rolling: null, weekly: null, monthly: null,
          apiUnavailable: true, apiError: `上游返回 HTTP ${status}`,
        } satisfies UsageData;
      }

      const usages = parseUsage(html);
      if (Object.keys(usages).length === 0) {
        if (isNoSubscription(html)) {
          return {
            rolling: null, weekly: null, monthly: null,
            apiUnavailable: true, apiError: '当前账号无 OpenCode Go 订阅',
          } satisfies UsageData;
        }
        return {
          rolling: null, weekly: null, monthly: null,
          apiUnavailable: true, apiError: '未能从页面解析出用量数据（页面结构可能已变更）',
        } satisfies UsageData;
      }

      return {
        rolling: usages.rolling ?? null,
        weekly: usages.weekly ?? null,
        monthly: usages.monthly ?? null,
      } satisfies UsageData;
    })
    .catch((err: unknown) => {
      const message = err instanceof Error && err.name === 'AbortError'
        ? '请求超时'
        : (err instanceof Error ? err.message : String(err));
      return {
        rolling: null, weekly: null, monthly: null,
        apiUnavailable: true, apiError: `抓取失败：${message}`,
      } satisfies UsageData;
    })
    .finally(() => clearTimeout(timer));
}
