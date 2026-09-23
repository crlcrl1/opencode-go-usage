/** @jsxImportSource @opentui/solid */
import { Plugin } from "@opencode/plugin/tui"
import { bar, fetchUsage, formatReset, percent, remaining, type Usage, type UsageWindow } from "./usage.ts"

const POLL_MS = 3 * 60 * 1000

type Snapshot = { usage?: Usage; note: string }

export default Plugin.define({
  id: "go-usage",
  setup(context) {
    let snapshot: Snapshot = { note: "loading" }
    let slot: (() => void) | undefined

    const color = (value: number | undefined) => {
      if (value === undefined) return context.theme.text.muted
      if (value < 10) return context.theme.text.feedback.error.base
      if (value < 25) return context.theme.text.feedback.warning.base
      return context.theme.text.base
    }

    const line = (label: string, window: UsageWindow | undefined) => {
      const left = remaining(window)
      return (
        <text wrapMode="none">
          <span style={{ fg: context.theme.text.muted }}>{label.padEnd(8)}</span>
          <span style={{ fg: color(left) }}>{`${percent(left)} left`}</span>
          <span style={{ fg: context.theme.text.muted }}>{` · resets ${formatReset(window?.resetsAt)}`}</span>
        </text>
      )
    }

    const Sidebar = (props: { data: Snapshot }) => (
      <box id="sidebar.go-usage" flexDirection="column" paddingTop={1}>
        <text>
          <b>Go usage</b>
        </text>
        {props.data.usage ? (
          <>
            {line("5-hour", props.data.usage.rolling)}
            {line("Weekly", props.data.usage.weekly)}
            {line("Monthly", props.data.usage.monthly)}
          </>
        ) : (
          <text fg={context.theme.text.muted}>
            {props.data.note === "loading" ? "Loading…" : `Unavailable (${props.data.note})`}
          </text>
        )}
      </box>
    )

    // Re-register the slot on every update. OpenCode resolves plugin modules with the plugin's
    // own copies of @opentui/solid and solid-js, so store/signal updates from this module do not
    // propagate into components rendered by the host. Replacing the slot forces a fresh render.
    const mount = () => {
      const current = snapshot
      slot?.()
      slot = context.ui.slot({ append: "sidebar.content", render: () => <Sidebar data={current} /> })
    }
    mount()

    const apply = (result: { usage?: Usage; note: string }) => {
      snapshot = result
      mount()
    }

    const refresh = () => {
      void fetchUsage().then(apply)
    }
    refresh()
    const timer = setInterval(refresh, POLL_MS)
    const stop = context.data.on("session.execution.succeeded", refresh)

    const commandSlot = context.ui.slot({
      append: "app",
      render: () => {
        context.keymap.layer(() => ({
          mode: "global",
          commands: [
            {
              id: "go-usage.show",
              title: "Show OpenCode Go usage",
              group: "Go",
              palette: true,
              slash: { name: "go-usage" },
              run: async () => {
                const result = await fetchUsage()
                apply(result)
                if (!result.usage) {
                  await context.ui.toast.show({
                    message: `OpenCode Go usage unavailable (${result.note})`,
                    variant: "error",
                  })
                  return
                }
                const current = result.usage
                const detail = (label: string, window?: UsageWindow) => {
                  const left = remaining(window)
                  return `${label.padEnd(8)}${bar(left)} ${percent(left)} left · resets ${formatReset(window?.resetsAt)}`
                }
                await context.ui.dialog.alert({
                  title: "OpenCode Go usage",
                  message: [
                    detail("5-hour", current.rolling),
                    detail("Weekly", current.weekly),
                    detail("Monthly", current.monthly),
                  ].join("\n"),
                })
              },
            },
          ],
        }))
        return null
      },
    })

    return () => {
      clearInterval(timer)
      stop()
      slot?.()
      commandSlot()
    }
  },
})
