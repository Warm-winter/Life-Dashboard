/**
 * 持久化层。
 * 设计要点：
 * 1) 解析函数是纯函数，方便单测；localStorage 只是薄薄一层包装。
 * 2) localStorage 不可用（隐私模式 / 配额满）时不抛错、不白屏，降级到内存。
 */
import {
  DEFAULT_SETTINGS,
  FX_LEVELS,
  isMoodKey,
  isWeatherKey,
  type DiaryEntry,
  type FxLevel,
  type Settings,
} from './types'

export const ENTRIES_KEY = 'wmk.entries.v1'
export const SETTINGS_KEY = 'wmk.settings.v1'
export const STORAGE_VERSION = 1

export interface StoredEntries {
  version: number
  entries: DiaryEntry[]
}

function asString(v: unknown, fallback = ''): string {
  return typeof v === 'string' ? v : fallback
}

function asTimestamp(v: unknown, fallback: number): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : fallback
}

function asTags(v: unknown): string[] {
  if (!Array.isArray(v)) return []
  return [...new Set(v.filter((t): t is string => typeof t === 'string').map((t) => t.trim()).filter(Boolean))].slice(0, 8)
}

/** 单条日记的容错解析：坏字段就地修正，实在救不回来则丢弃。 */
export function sanitizeEntry(raw: unknown): DiaryEntry | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  const date = asString(r.date)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null
  const createdAt = asTimestamp(r.createdAt, Date.now())
  return {
    id: asString(r.id) || `e-${date}`,
    date,
    title: asString(r.title).slice(0, 80),
    body: asString(r.body).slice(0, 20_000),
    mood: isMoodKey(r.mood) ? r.mood : 'neutral',
    weather: isWeatherKey(r.weather) ? r.weather : 'sunny',
    tags: asTags(r.tags),
    createdAt,
    updatedAt: asTimestamp(r.updatedAt, createdAt),
  }
}

/** 解析存储里的日记列表；同一日期只保留最近更新的一条，按日期倒序。 */
export function parseEntries(raw: string | null): DiaryEntry[] {
  if (!raw) return []
  let data: unknown
  try {
    data = JSON.parse(raw)
  } catch {
    return []
  }
  const list = Array.isArray(data)
    ? data
    : data && typeof data === 'object' && Array.isArray((data as StoredEntries).entries)
      ? (data as StoredEntries).entries
      : []

  const byDate = new Map<string, DiaryEntry>()
  for (const item of list) {
    const entry = sanitizeEntry(item)
    if (!entry) continue
    const prev = byDate.get(entry.date)
    if (!prev || entry.updatedAt >= prev.updatedAt) byDate.set(entry.date, entry)
  }
  return [...byDate.values()].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
}

export function serializeEntries(entries: DiaryEntry[]): string {
  const payload: StoredEntries = { version: STORAGE_VERSION, entries }
  return JSON.stringify(payload)
}

export function parseSettings(raw: string | null): Settings {
  if (!raw) return { ...DEFAULT_SETTINGS }
  let data: unknown
  try {
    data = JSON.parse(raw)
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
  if (!data || typeof data !== 'object') return { ...DEFAULT_SETTINGS }
  const s = data as Record<string, unknown>
  const fx = typeof s.fx === 'number' && (FX_LEVELS as readonly number[]).includes(s.fx) ? (s.fx as FxLevel) : DEFAULT_SETTINGS.fx
  return {
    fx,
    sound: typeof s.sound === 'boolean' ? s.sound : DEFAULT_SETTINGS.sound,
    seeded: typeof s.seeded === 'boolean' ? s.seeded : DEFAULT_SETTINGS.seeded,
  }
}

/* ------------------------------ 运行时包装 ------------------------------ */

const memory = new Map<string, string>()
let storageAvailable = true

function probe(): Storage | null {
  if (!storageAvailable) return null
  try {
    const s = window.localStorage
    const k = '__wmk_probe__'
    s.setItem(k, '1')
    s.removeItem(k)
    return s
  } catch {
    storageAvailable = false
    return null
  }
}

export function storageMode(): 'local' | 'memory' {
  return probe() ? 'local' : 'memory'
}

export function readRaw(key: string): string | null {
  const store = probe()
  if (store) {
    try {
      return store.getItem(key)
    } catch {
      storageAvailable = false
    }
  }
  return memory.get(key) ?? null
}

export interface WriteResult {
  ok: boolean
  persisted: boolean
}

export function writeRaw(key: string, value: string): WriteResult {
  const store = probe()
  if (store) {
    try {
      store.setItem(key, value)
      return { ok: true, persisted: true }
    } catch {
      // 配额满或权限问题：降到内存，仍然让用户能继续用
      memory.set(key, value)
      return { ok: true, persisted: false }
    }
  }
  memory.set(key, value)
  return { ok: true, persisted: false }
}

export function loadEntries(): DiaryEntry[] {
  return parseEntries(readRaw(ENTRIES_KEY))
}

export function saveEntries(entries: DiaryEntry[]): WriteResult {
  return writeRaw(ENTRIES_KEY, serializeEntries(entries))
}

export function loadSettings(): Settings {
  return parseSettings(readRaw(SETTINGS_KEY))
}

export function saveSettings(settings: Settings): WriteResult {
  return writeRaw(SETTINGS_KEY, JSON.stringify(settings))
}

export function clearAll(): void {
  const store = probe()
  try {
    store?.removeItem(ENTRIES_KEY)
    store?.removeItem(SETTINGS_KEY)
  } catch {
    /* ignore */
  }
  memory.delete(ENTRIES_KEY)
  memory.delete(SETTINGS_KEY)
}
