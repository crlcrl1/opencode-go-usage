# opencode-go-usage

OpenCode Go（`opencode-go` provider）剩余配额显示插件。

- **TUI 侧边栏**：在会话右侧边栏追加 `Go usage` 区块，显示滚动 5 小时 / 自然周 / 月度三个窗口的剩余百分比和重置时间。
- **`/go-usage` 命令**：弹窗展示三个窗口的进度条（也可在 Ctrl+P 命令面板中搜索 “OpenCode Go usage”）。
- 数据来自 OpenCode Go 的用量接口：`GET https://opencode.ai/zen/go/v1/usage`（每 3 分钟以及每次会话成功执行后刷新）。
- API key 优先取环境变量 `OPENCODE_GO_API_KEY`，否则读取 `~/.local/share/opencode/auth.json` 中的 `opencode-go` 条目。

## 文件

| 文件 | 说明 |
| --- | --- |
| `index.ts` | 服务端插件入口（空实现，仅用于注册） |
| `tui.tsx` | TUI 插件入口：侧边栏区块 + `/go-usage` 命令 |
| `tui.ts` | 入口转发，兼容按 `tui.ts` 解析的加载方式 |
| `usage.ts` | 用量接口、百分比/重置时间/进度条等公共逻辑 |

## 安装

OpenCode 的插件安装只接受 **npm registry 包**或 **Git spec**（目录路径、tarball 会被拒绝），因此本插件以本地 Git 仓库的形式安装：

```bash
# 1. 初始化并提交（本目录已是 git 仓库）
git add -A && git commit -m "..."

# 2. 安装到 OpenCode
opencode plugin add git+file:///home/crl/code/typescript/opencode-go-usage
```

等价的手动配置（`~/.config/opencode/opencode.jsonc`）：

```jsonc
{
  "plugins": ["git+file:///home/crl/code/typescript/opencode-go-usage"]
}
```

安装后 OpenCode 会把仓库克隆到自己的缓存目录（`~/.cache/opencode/npm/git-*/`）再加载，不依赖项目里的 `node_modules`。

更新：提交新版本后执行 `opencode plugin update`（或重新 `opencode plugin add`）。

卸载：`opencode plugin remove git+file:///home/crl/code/typescript/opencode-go-usage`。

> 注意：npm 上的 `opencode-go-usage` 是另一个作者的包，与本项目无关；不要用包名安装。

## 依赖

`@opencode/plugin/tui`、`@opentui/solid`、`solid-js` 由 OpenCode 在运行时解析；`@opencode/plugin` 仅服务端入口使用（`Plugin.define` 是恒等函数），本地 `npm install` 只用于开发时的类型解析。
