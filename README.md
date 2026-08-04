# OpenCode Go HUD

A lightweight status line HUD for **OpenCode Go** subscribers — displays context usage, official rolling (5h) / weekly / monthly quota, and project info. Built with ❤️

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js 18+](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)

> Inspired by [jarrodwatts/claude-hud](https://github.com/jarrodwatts/claude-hud) · [minimax-hud](https://github.com/Fighting05/minimax-hud) · [opencode-go-usage-api](https://github.com/andywang425/opencode-go-usage-api)

[中文版](./README_zh.md)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📊 **Context Bar** | Visual progress bar with token count |
| 🕐 **Rolling 5h Quota** | Real-time 5-hour usage (official) |
| 📅 **Weekly Quota** | 7-day usage window |
| 📆 **Monthly Quota** | 30-day usage window |
| ⏰ **Reset Countdown** | Shows time until quota resets |
| 🔄 **Auto-Activation** | Activates only when routed to OpenCode Go — silently no-ops for MiniMax / official Claude |
| 📍 **Git Status** | Branch, dirty indicator, ahead/behind |
| 🎨 **Color Warnings** | Dynamic color based on usage |
| 🌍 **i18n** | English & Chinese supported |

## 📷 Screenshot

```
project/path
[deepseek-v4-flash] [ctx] ███░░░░░░░░░░░░ 19% (185k/1.0M) │ 用量 █░░░░░░░░░ 10% / 5小时 (1h31m) ░░░░░░░░░░ 4% / 周 (5d18h) ░░░░░░░░░░ 2% / 月 (30d20h)
───── separator ─────
main ⚡
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- An **OpenCode Go** subscription ([opencode.ai/go](https://opencode.ai/go))
- A browser logged in to OpenCode Zen (to grab your auth cookie)

### Installation

```bash
# 1. Clone this repo
git clone https://github.com/Fighting05/OpenCode-Go-hud.git
cd OpenCode-Go-hud

# 2. Install dependencies
npm install

# 3. Build
npm run build

# 4. Deploy the built output (copy dist to your Claude plugins dir)
cp -r dist "$HOME/.claude/plugins/marketplaces/opencode-go-hud/"
```

## ⚙️ Configuration

### 1. Fill in your credentials

Edit `~/.claude/plugins/marketplaces/opencode-go-hud/config.json`:

```json
{
  "opencode": {
    "authCookie": "Fe26.2**... (paste your auth cookie here)",
    "workspaceId": "wrk_01KZ56XPB4341T0Z7V2JC3A7TD"
  },
  "activation": {
    "envKey": "ANTHROPIC_DEFAULT_SONNET_MODEL_NAME",
    "modelNames": ["deepseek-v4-flash", "glm-5.2", "kimi-k3", "gpt-5.6-luna"]
  }
}
```

### 🔑 Getting your auth cookie

1. Open your OpenCode Go workspace page in a browser:
   `https://opencode.ai/workspace/{your_workspace_id}/go`
2. Press **F12** → **Application** → **Cookies** → select `opencode.ai`
3. Copy the value of the **`auth`** cookie — that's your `authCookie`
4. Your `workspaceId` is the `wrk_XXX` part of the URL

### 🔄 Updating a stale cookie

- When the cookie expires, the HUD stops showing quota (the API returns "登录凭证已失效" / "auth cookie expired").
- Just re-grab the `auth` cookie from the browser as above and update `config.json`. No rebuild needed.
- Cookies are typically valid for a long time (the FusionAuth token embeds a ~1-year expiry), so updates are rare.

### 2. Register the status line

Add to `~/.claude/settings.json`:

```json
{
  "statusLine": {
    "command": "bash -c '\"/path/to/node\" \"/path/to/opencode-go-hud/dist/index.js\"'",
    "type": "command"
  }
}
```

> **Using cc-switch?** Switching providers rewrites `settings.json` from cc-switch's stored provider config. If the OpenCode Go provider entry in cc-switch only has an `env` block, the `statusLine` block gets **dropped** on switch. Fix: add the same `statusLine` (plus any `hooks`) into the OpenCode Go provider's settings config inside cc-switch, so it's preserved every switch.

### 3. Restart Claude Code

## 🧠 How It Works

**Auto-activation**: The HUD checks the environment variable `ANTHROPIC_DEFAULT_SONNET_MODEL_NAME` (configurable via `activation.envKey`). If it matches one of the OpenCode Go model names (e.g. `deepseek-v4-flash`), the HUD renders. Otherwise it **outputs nothing at all** — so it never interferes with MiniMax or official Claude sessions.

**Official usage data**: The HUD fetches `https://opencode.ai/workspace/{workspaceId}/go` with your `auth` cookie, then parses the `rollingUsage` / `weeklyUsage` / `monthlyUsage` inline JSON (with DOM fallback) — the same official numbers you see in the OpenCode Go dashboard. Results are cached for 60s to avoid hammering the page on every status-line render.

## 🗂️ Project Structure

```
opencode-go-hud/
├── src/
│   ├── index.ts          # Entry point + activation gate
│   ├── api.ts            # OpenCode Go workspace fetcher & parser
│   ├── cache.ts          # Usage cache (60s TTL)
│   ├── config.ts         # Configuration
│   ├── git.ts            # Git status
│   ├── stdin.ts          # Claude Code stdin parsing
│   ├── transcript.ts     # Transcript parser
│   ├── types.ts          # TypeScript types
│   ├── i18n/             # Internationalization
│   └── render/           # Rendering
├── scripts/              # Helper scripts (probe, tests)
├── dist/                 # Compiled output
└── README.md
```

## 📋 Changelog

### v1.0.0 — Initial release

- Context window bar with token count
- Official OpenCode Go usage: rolling (5h), weekly, monthly windows with reset countdowns
- Auto-activation via environment detection (silent when not on OpenCode Go)
- Git status, project path, i18n (en/zh)

---

## 🤝 Friends

- **[Fighting05/minimax-hud](https://github.com/Fighting05/minimax-hud)** — The MiniMax HUD this project mirrors
- **[jarrodwatts/claude-hud](https://github.com/jarrodwatts/claude-hud)** — The original Claude HUD
- **[andywang425/opencode-go-usage-api](https://github.com/andywang425/opencode-go-usage-api)** — Reference for the official workspace page parsing

## 📄 License

MIT License · © 2024 [Fighting05](https://github.com/Fighting05)
