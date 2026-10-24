/** 日期工具：全部走本地时区，避免 UTC 偏移把「今天」算错一天。 */

const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'] as const

/** 把 Date 转成本地 YYYY-MM-DD */
export function toDateKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function todayKey(now: Date = new Date()): string {
  return toDateKey(now)
}

/** 解析 YYYY-MM-DD 为本地日期（不经过 UTC） */
export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  if (!y || !m || !d) return new Date(NaN)
  return new Date(y, m - 1, d)
}

export function addDays(key: string, delta: number): string {
  const d = parseDateKey(key)
  d.setDate(d.getDate() + delta)
  return toDateKey(d)
}

export function weekdayCN(key: string): string {
  const d = parseDateKey(key)
  return Number.isNaN(d.getTime()) ? '—' : WEEKDAYS[d.getDay()]
}

/** 2026年10月24日 周六 */
export function formatDateCN(key: string): string {
  const d = parseDateKey(key)
  if (Number.isNaN(d.getTime())) return key
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${WEEKDAYS[d.getDay()]}`
}

/** 10-24 */
export function formatShortCN(key: string): string {
  const d = parseDateKey(key)
  if (Number.isNaN(d.getTime())) return key
  return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** a - b 的相差天数（自然日） */
export function daysBetween(a: string, b: string): number {
  const ta = parseDateKey(a).getTime()
  const tb = parseDateKey(b).getTime()
  if (Number.isNaN(ta) || Number.isNaN(tb)) return NaN
  return Math.round((ta - tb) / 86_400_000)
}

/** 相对今天：今天 / 昨天 / 3 天前 */
export function relativeDayCN(key: string, today = todayKey()): string {
  const diff = daysBetween(today, key)
  if (Number.isNaN(diff)) return key
  if (diff === 0) return '今天'
  if (diff === 1) return '昨天'
  if (diff === 2) return '前天'
  if (diff > 0 && diff < 8) return `${diff} 天前`
  return formatShortCN(key)
}

/** 字数：中文按字算，空白不计；英文按单词粗算不合日记口吻，这里统一按非空白字符数 */
export function countChars(text: string): number {
  return text.replace(/\s+/g, '').length
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

export function round1(n: number): number {
  return Math.round(n * 10) / 10
}

/** 千分位 */
export function thousands(n: number): string {
  return n.toLocaleString('zh-CN')
}
