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

## 依赖与实现说明

- `@opencode/plugin/tui`、`@opentui/solid`、`solid-js` 由 OpenCode 在运行时解析；`@opencode/plugin` 仅服务端入口使用（`Plugin.define` 是恒等函数），本地 `npm install` 只用于开发时的类型解析。

从 git/npm 安装成包插件时（OpenCode 会克隆到 `~/.cache/opencode/npm/…` 再加载），有两点必须注意：

1. **JSX 运行时依赖要自带**：OpenCode 不会把 `@opentui/solid` / `solid-js` 映射到宿主副本，所以 `package.json` 必须声明 `peerDependencies`（`@opentui/core`、`@opentui/solid`、`solid-js`，包管理器会自动安装），并且 `tui.tsx` 顶部必须保留 `/** @jsxImportSource @opentui/solid */`，否则会按 React JSX 处理并报 `Cannot find package 'react'`。
2. **不要依赖 Solid 响应式更新**：插件模块与宿主各自持有 solid-js 副本，`createSignal` 或 `context.storage.memory` 的更新不会触发宿主渲染的组件重绘。因此侧边栏在每次数据刷新后重新注册 `sidebar.content` 插槽（`tui.tsx` 里的 `mount()`），用重建代替响应式更新。

## 更新

修改源码后提交，然后重新安装：

```bash
git commit -am "..."
opencode plugin update git+file:///home/crl/code/typescript/opencode-go-usage
```

## 卸载

```bash
opencode plugin remove git+file:///home/crl/code/typescript/opencode-go-usage
```
