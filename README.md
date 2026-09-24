# opencode-go-usage

Show your **OpenCode Go** (Zen) remaining quota inside the OpenCode TUI.

[中文说明](README.zh-CN.md)

- **Sidebar block** — appends a `Go usage` section to the right sidebar with the remaining percentage and reset time for the rolling 5-hour, weekly, and monthly windows.
- **`/go-usage`** — dialog with progress bars for all three windows (used / left percentages and reset times).
- **`/go-refresh`** — refresh the numbers on demand and show a summary toast (also available as `/go-usage-refresh`).

Data comes from `GET https://opencode.ai/zen/go/v1/usage` and is refreshed every 3 minutes and after every successful session execution.

The API key is resolved from the `OPENCODE_GO_API_KEY` environment variable first, and otherwise from the `opencode-go` entry in `~/.local/share/opencode/auth.json`.

> Requires OpenCode V2 with the terminal UI. The desktop/web UI has no plugin UI surface yet, so this plugin only renders in the TUI.

## Install

```bash
opencode plugin add github:crlcrl1/opencode-go-usage
```

Any equivalent Git specifier works as well, for example:

```bash
opencode plugin add git+https://github.com/crlcrl1/opencode-go-usage
```

Or add it to `~/.config/opencode/opencode.jsonc` manually:

```jsonc
{
  "plugins": ["github:crlcrl1/opencode-go-usage"]
}
```

OpenCode clones the repository into its own cache (`~/.cache/opencode/npm/git-…`) and loads it from there, so you do not need to keep a local checkout.

### Update

```bash
opencode plugin update github:crlcrl1/opencode-go-usage
```

### Uninstall

```bash
opencode plugin remove github:crlcrl1/opencode-go-usage
```

## Commands

| Command | Description |
| --- | --- |
| `/go-usage` | Show a dialog with progress bars for the 5-hour, weekly, and monthly quota windows. |
| `/go-refresh` (alias `/go-usage-refresh`) | Fetch the latest numbers, refresh the sidebar, and show a summary toast. |

Both commands are also available from the command palette (`Ctrl+P`).

## How it works

| File | Purpose |
| --- | --- |
| `index.ts` | Server plugin entry (no-op, registers the plugin). |
| `tui.tsx` | TUI plugin entry: sidebar block and the two commands. |
| `tui.ts` | Re-export so the TUI entry can also be resolved as `tui.ts`. |
| `usage.ts` | Shared logic: usage API, percentage / reset-time / progress-bar helpers. |

The sidebar shows the percentage **left** for each window, colored by remaining amount (yellow below 25%, red below 10%).

## Development

```bash
git clone https://github.com/crlcrl1/opencode-go-usage.git
cd opencode-go-usage
npm install
```

To test local changes without reinstalling, point OpenCode at the checkout directory:

```jsonc
{
  "plugins": ["/absolute/path/to/opencode-go-usage"]
}
```

Then restart the TUI. When you are done, install from Git again (see above) to load the released version.

## License

[Apache-2.0](LICENSE)
