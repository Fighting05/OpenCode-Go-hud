# OpenCode Go HUD

为 **OpenCode Go** 订阅用户打造的轻量级状态栏 HUD，用 ❤️ 构建 — 显示上下文用量、官方滚动(5小时)/每周/每月配额与项目信息。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js 18+](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)

> 灵感来自 [jarrodwatts/claude-hud](https://github.com/jarrodwatts/claude-hud) · [minimax-hud](https://github.com/Fighting05/minimax-hud) · [opencode-go-usage-api](https://github.com/andywang425/opencode-go-usage-api)

[English](./README.md)

---

## ✨ 功能特点

| 功能 | 说明 |
|------|------|
| 📊 **上下文进度条** | 可视化进度条 + 令牌数量 |
| 🕐 **5小时配额** | 实时 5 小时用量（官方数据） |
| 📅 **每周配额** | 7 天用量窗口 |
| 📆 **每月配额** | 30 天用量窗口 |
| ⏰ **重置倒计时** | 显示配额下次重置的时间 |
| 🔄 **自动激活** | 仅当路由到 OpenCode Go 时才激活，否则完全静默（不干扰 MiniMax / 官方 Claude） |
| 📍 **Git 状态** | 分支、dirty 指示器、ahead/behind |
| 🎨 **颜色警告** | 用量动态颜色提示 |
| 🌍 **国际化** | 中文 & 英文 |

## 📷 效果截图

```
项目路径
[deepseek-v4-flash] [ctx] ███░░░░░░░░░░░░ 19% (185k/1.0M) │ 用量 █░░░░░░░░░ 10% / 5小时 (1h31m) ░░░░░░░░░░ 4% / 周 (5d18h) ░░░░░░░░░░ 2% / 月 (30d20h)
───── 分隔线 ─────
main ⚡
```

## 🚀 快速开始

### 前置要求

- Node.js 18+
- 已订阅 **OpenCode Go**（[opencode.ai/go](https://opencode.ai/go)）
- 浏览器已登录 OpenCode Zen（用于获取 auth cookie）

### 安装步骤

```bash
# 1. 克隆仓库
git clone https://github.com/Fighting05/OpenCode-Go-hud.git
cd OpenCode-Go-hud

# 2. 安装依赖
npm install

# 3. 编译
npm run build

# 4. 部署编译产物（复制 dist 到你的 Claude 插件目录）
cp -r dist "$HOME/.claude/plugins/marketplaces/opencode-go-hud/"
```

## ⚙️ 配置

### 1. 填写凭据

编辑 `~/.claude/plugins/marketplaces/opencode-go-hud/config.json`:

```json
{
  "opencode": {
    "authCookie": "Fe26.2**... (粘贴你的 auth cookie)",
    "workspaceId": "wrk_01KZ56XPB4341T0Z7V2JC3A7TD"
  },
  "activation": {
    "envKey": "ANTHROPIC_DEFAULT_SONNET_MODEL_NAME",
    "modelNames": ["deepseek-v4-flash", "glm-5.2", "kimi-k3", "gpt-5.6-luna"]
  }
}
```

### 🔑 获取 auth cookie

1. 浏览器打开你的 OpenCode Go 工作区页面：
   `https://opencode.ai/workspace/{你的_workspace_id}/go`
2. 按 **F12** → **Application** → **Cookies** → 选择 `opencode.ai`
3. 复制 **`auth`** cookie 的值，即为 `authCookie`
4. `workspaceId` 就是 URL 里的 `wrk_XXX` 部分

### 🔄 更新过期的 cookie

- cookie 失效时，HUD 停止显示用量（API 返回"登录凭证已失效"）。
- 按上面的方法从浏览器重新复制 `auth` cookie 并更新 `config.json` 即可，**无需重新编译**。
- cookie 有效期通常很长（FusionAuth token 内嵌约 1 年有效期），更新频率很低。

### 2. 注册状态栏

在 `~/.claude/settings.json` 中添加：

```json
{
  "statusLine": {
    "command": "bash -c '\"/path/to/node\" \"/path/to/opencode-go-hud/dist/index.js\"'",
    "type": "command"
  }
}
```

> **使用 cc-switch？** 切换 provider 会用 cc-switch 里存储的 provider 配置重写 `settings.json`。如果 cc-switch 里 OpenCode Go provider 的配置只有 `env` 段，切换后 `statusLine` 段会被**丢弃**。解决：把相同的 `statusLine`（以及需要的 `hooks`）一并加进 cc-switch 中 OpenCode Go provider 的 settings 配置里，这样每次切换都会保留。

### 3. 重启 Claude Code

## 🧠 工作原理

**自动激活**：HUD 检查环境变量 `ANTHROPIC_DEFAULT_SONNET_MODEL_NAME`（可通过 `activation.envKey` 配置）。如果命中 OpenCode Go 的模型名（如 `deepseek-v4-flash`），HUD 才渲染；否则**完全静默零输出**，绝不干扰 MiniMax 或官方 Claude 会话。

**官方用量数据**：HUD 携带你的 `auth` cookie 请求 `https://opencode.ai/workspace/{workspaceId}/go`，解析内联的 `rollingUsage` / `weeklyUsage` / `monthlyUsage` JSON（带 DOM 兜底）——与 OpenCode Go 控制台显示的数字一致。结果缓存 60 秒，避免状态栏每次渲染都请求页面。

## 🗂️ 项目结构

```
opencode-go-hud/
├── src/
│   ├── index.ts          # 入口 + 激活门
│   ├── api.ts            # OpenCode Go 工作区抓取与解析
│   ├── cache.ts          # 用量缓存（60s TTL）
│   ├── config.ts         # 配置管理
│   ├── git.ts            # Git 状态
│   ├── stdin.ts          # Claude Code stdin 解析
│   ├── transcript.ts     # Transcript 解析
│   ├── types.ts          # TypeScript 类型
│   ├── i18n/             # 国际化
│   └── render/           # 渲染模块
├── scripts/              # 辅助脚本（探测、测试）
├── dist/                 # 编译输出
└── README.md
```

## 📋 更新日志

### v1.0.0 — 首次发布

- 上下文进度条 + 令牌数量
- 官方 OpenCode Go 用量：滚动(5小时)、每周、每月窗口，带重置倒计时
- 环境检测自动激活（不在 OpenCode Go 时完全静默）
- Git 状态、项目路径、国际化（en/zh）

---

## 🤝 友链

- **[Fighting05/minimax-hud](https://github.com/Fighting05/minimax-hud)** — 本项目的姊妹版 MiniMax HUD
- **[jarrodwatts/claude-hud](https://github.com/jarrodwatts/claude-hud)** — 灵感来源，原版 Claude HUD
- **[andywang425/opencode-go-usage-api](https://github.com/andywang425/opencode-go-usage-api)** — 官方工作区页面解析的参考实现

## 📄 开源协议

MIT License · © 2024 [Fighting05](https://github.com/Fighting05)
