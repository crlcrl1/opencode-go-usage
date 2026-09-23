import { readFileSync } from "node:fs"
import { homedir } from "node:os"
import { join } from "node:path"

export const USAGE_URL = "https://opencode.ai/zen/go/v1/usage"

export type UsageWindow = { status?: string; percent?: number; resetsAt?: string }
export type Usage = { rolling?: UsageWindow; weekly?: UsageWindow; monthly?: UsageWindow }

export function apiKey(): string | undefined {
  if (process.env.OPENCODE_GO_API_KEY) return process.env.OPENCODE_GO_API_KEY
  const dataHome = process.env.XDG_DATA_HOME ?? join(homedir(), ".local", "share")
  try {
    const auth = JSON.parse(readFileSync(join(dataHome, "opencode", "auth.json"), "utf8")) as Record<
      string,
      { type?: string; key?: string }
    >
    const entry = auth["opencode-go"]
    if (entry?.type === "api" && entry.key) return entry.key
  } catch {}
  return undefined
}

export async function fetchUsage(): Promise<{ usage?: Usage; note: string }> {
  const key = apiKey()
  if (!key) return { note: "no API key" }
  try {
    const response = await fetch(USAGE_URL, {
      headers: { Authorization: `Bearer ${key}`, Accept: "application/json" },
    })
    if (!response.ok) return { note: `HTTP ${response.status}` }
    const body = (await response.json()) as { usage?: Usage }
    return { usage: body.usage, note: body.usage ? "ok" : "empty body" }
  } catch (error) {
    return { note: `error: ${error instanceof Error ? error.message : String(error)}` }
  }
}

export function remaining(window: UsageWindow | undefined): number | undefined {
  if (window?.percent === undefined) return undefined
  return Math.max(0, Math.round(100 - window.percent))
}

export function percent(value: number | undefined): string {
  return value === undefined ? "?" : `${value}%`
}

export function formatReset(value: string | undefined): string {
  if (!value) return "unknown"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  const pad = (part: number) => String(part).padStart(2, "0")
  return `${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function bar(value: number | undefined, width = 16): string {
  if (value === undefined) return "░".repeat(width)
  const filled = Math.max(0, Math.min(width, Math.round((value / 100) * width)))
  return "█".repeat(filled) + "░".repeat(width - filled)
}
