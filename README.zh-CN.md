# opencode-go-usage

在 OpenCode TUI 中显示 **OpenCode Go**（Zen）剩余配额。

[English](README.md)

- **侧边栏区块** — 在右侧边栏追加 `Go usage` 区块，显示滚动 5 小时 / 自然周 / 月度三个窗口的剩余百分比和重置时间。
- **`/go-usage`** — 弹窗展示三个窗口的进度条（已用 / 剩余百分比与重置时间）。
- **`/go-refresh`** — 手动刷新用量并弹出摘要提示（别名 `/go-usage-refresh`）。

数据来自 `GET https://opencode.ai/zen/go/v1/usage`，每 3 分钟以及每次会话成功执行后自动刷新。

API key 优先取环境变量 `OPENCODE_GO_API_KEY`，否则读取 `~/.local/share/opencode/auth.json` 中的 `opencode-go` 条目。

> 需要 OpenCode V2 的终端界面；桌面 / 网页端目前没有插件 UI 扩展点，本插件只在 TUI 中渲染。

## 安装

```bash
opencode plugin add github:crlcrl1/opencode-go-usage
```

等效的 Git spec 也可以：

```bash
opencode plugin add git+https://github.com/crlcrl1/opencode-go-usage
```

或手动写入 `~/.config/opencode/opencode.jsonc`：

```jsonc
{
  "plugins": ["github:crlcrl1/opencode-go-usage"]
}
```

OpenCode 会把仓库克隆到自己的缓存目录（`~/.cache/opencode/npm/git-…`）再加载，无需保留本地 checkout。

### 更新

```bash
opencode plugin update github:crlcrl1/opencode-go-usage
```

### 卸载

```bash
opencode plugin remove github:crlcrl1/opencode-go-usage
```

## 命令

| 命令 | 说明 |
| --- | --- |
| `/go-usage` | 弹出三个配额窗口的进度条详情。 |
| `/go-refresh`（别名 `/go-usage-refresh`） | 立即拉取最新用量、刷新侧边栏，并弹出摘要提示。 |

两个命令都可以在命令面板（`Ctrl+P`）中找到。

## 文件

| 文件 | 说明 |
| --- | --- |
| `index.ts` | 服务端插件入口（空实现，仅用于注册）。 |
| `tui.tsx` | TUI 插件入口：侧边栏区块与两个命令。 |
| `tui.ts` | 入口转发，兼容按 `tui.ts` 解析的加载方式。 |
| `usage.ts` | 公共逻辑：用量接口、百分比 / 重置时间 / 进度条辅助函数。 |

侧边栏显示的是每个窗口的**剩余**百分比，并按剩余量着色（低于 25% 变黄，低于 10% 变红）。

## 开发

```bash
git clone https://github.com/crlcrl1/opencode-go-usage.git
cd opencode-go-usage
npm install
```

想在不重新安装的情况下测试本地改动，可以把 OpenCode 指向 checkout 目录：

```jsonc
{
  "plugins": ["/absolute/path/to/opencode-go-usage"]
}
```

然后重启 TUI。测试完成后按上面的方式从 Git 安装正式版本。

### 插件作者的注意事项

把 TUI 插件作为 Git/npm 包安装时有两个坑，本项目都已显式处理：

1. **自带 JSX 运行时**：OpenCode 不会把 `@opentui/solid` / `solid-js` 映射到宿主副本，因此包必须把这两个依赖声明为 `peerDependencies`（随包一同安装），并且 `tui.tsx` 顶部必须保留 `/** @jsxImportSource @opentui/solid */`。缺少该 pragma 时会按 React JSX 转译并报 `Cannot find package 'react'`。
2. **不要依赖 Solid 响应式更新**：插件模块与宿主各持一份 `solid-js`，更新 signal 或 `context.storage.memory` 不会触发宿主拥有的组件重绘。因此侧边栏在每次刷新后重新注册 `sidebar.content` 插槽，用重建代替响应式更新。

## 许可证

[Apache-2.0](LICENSE)
