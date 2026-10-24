/**
 * 启动引导：首次进入灌入示例数据。
 * 放在 React 之外执行一次，避免 StrictMode 双调用导致重复播种。
 */
import { buildSeedEntries } from './seed'
import { loadEntries, loadSettings, saveEntries, saveSettings } from './storage'
import type { DiaryEntry, Settings } from './types'

export interface Bootstrap {
  entries: DiaryEntry[]
  settings: Settings
  seededNow: boolean
}

export function bootstrap(): Bootstrap {
  const settings = loadSettings()
  const existing = loadEntries()

  if (existing.length === 0 && !settings.seeded) {
    const entries = buildSeedEntries()
    const next: Settings = { ...settings, seeded: true }
    saveEntries(entries)
    saveSettings(next)
    return { entries, settings: next, seededNow: true }
  }

  return { entries: existing, settings, seededNow: false }
}
