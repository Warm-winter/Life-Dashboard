/**
 * 统计引擎：纯函数、无副作用、可单测。
 * 看板上的每一个数字都必须来自这里，图不能是装饰。
 */
import { MOOD_MAP, type DiaryEntry, type MoodKey } from './types'
import { addDays, clamp, countChars, round1, todayKey } from './format'

export interface DailyPoint {
  date: string
  chars: number
  /** 当天情绪分（0-100），无记录为 null */
  mood: number | null
  hasEntry: boolean
}

export interface Rarity {
  score: number
  rank: string
  /** 0-5，用于段位配色 */
  tier: number
}

export interface Summary {
  totalEntries: number
  totalChars: number
  avgChars: number
  activeDays: number
  currentStreak: number
  longestStreak: number
  /** 0-100 的情绪指数 */
  moodIndex: number
  moodCounts: Record<MoodKey, number>
  topTags: { tag: string; count: number }[]
  longestEntry: DiaryEntry | null
  /** 最近一次记录距离今天几天；无记录为 null */
  daysSinceLast: number | null
  power: Rarity
  /** 单调递增的「人生总字数」序列，用于跑马灯/批注 */
  firstDate: string | null
}

export function uniqueDates(entries: DiaryEntry[]): string[] {
  return [...new Set(entries.map((e) => e.date))].sort()
}

/** 连续记录天数：必须延续到今天或昨天，否则归零（不把断更算成战绩）。 */
export function currentStreak(entries: DiaryEntry[], today: string = todayKey()): number {
  const days = new Set(uniqueDates(entries))
  let cursor = days.has(today) ? today : addDays(today, -1)
  if (!days.has(cursor)) return 0
  let streak = 0
  while (days.has(cursor)) {
    streak += 1
    cursor = addDays(cursor, -1)
  }
  return streak
}

export function longestStreak(entries: DiaryEntry[]): number {
  const days = uniqueDates(entries)
  let best = 0
  let run = 0
  let prev: string | null = null
  for (const day of days) {
    run = prev !== null && addDays(prev, 1) === day ? run + 1 : 1
    best = Math.max(best, run)
    prev = day
  }
  return best
}

export function moodCounts(entries: DiaryEntry[]): Record<MoodKey, number> {
  const counts = { joy: 0, calm: 0, neutral: 0, sad: 0, angry: 0, anxious: 0 } as Record<MoodKey, number>
  for (const e of entries) counts[e.mood] += 1
  return counts
}

export function topTags(entries: DiaryEntry[], limit = 8): { tag: string; count: number }[] {
  const map = new Map<string, number>()
  for (const e of entries) for (const t of e.tags) map.set(t, (map.get(t) ?? 0) + 1)
  return [...map.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag, 'zh-Hans-CN'))
    .slice(0, limit)
}

function stdDev(values: number[]): number {
  if (values.length < 2) return 0
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const variance = values.reduce((acc, v) => acc + (v - mean) ** 2, 0) / values.length
  return Math.sqrt(variance)
}

/**
 * 人生战斗力：0-100。权重刻意做成「篇数/连续/字数/稳定/标签」五块拼盘，
 * 这样任何一项拉满都不会爆表，也不会因为只写一天就 99 分。
 */
export function calcPower(entries: DiaryEntry[], streak: number): Rarity {
  if (entries.length === 0) return { score: 0, rank: '还没开机', tier: 0 }

  const totalChars = entries.reduce((acc, e) => acc + countChars(e.body), 0)
  const tags = new Set(entries.flatMap((e) => e.tags))
  const moods = entries.map((e) => MOOD_MAP[e.mood].score)

  const entriesScore = Math.min(30, entries.length * 1.5)
  const streakScore = Math.min(25, streak * 3)
  const charsScore = Math.min(25, totalChars / 400)
  const stability = Math.max(0, 1 - stdDev(moods) / 40) * 10
  const tagScore = Math.min(10, tags.size * 1.5)

  const score = round1(clamp(entriesScore + streakScore + charsScore + stability + tagScore, 0, 100))
  const ranks: [number, string][] = [
    [20, '青铜五毛'],
    [40, '白银五毛'],
    [60, '黄金五毛'],
    [80, '铂金五毛'],
    [95, '王者五毛'],
  ]
  const hit = ranks.find(([line]) => score < line)
  return { score, rank: hit ? hit[1] : '宇宙五毛', tier: hit ? ranks.indexOf(hit) + 1 : 6 }
}

export function summarize(entries: DiaryEntry[], today: string = todayKey()): Summary {
  const totalChars = entries.reduce((acc, e) => acc + countChars(e.body), 0)
  const dates = uniqueDates(entries)
  const streak = currentStreak(entries, today)
  const moods = entries.map((e) => MOOD_MAP[e.mood].score)
  const moodIndex = moods.length ? Math.round(moods.reduce((a, b) => a + b, 0) / moods.length) : 0

  let longestEntry: DiaryEntry | null = null
  for (const e of entries) {
    if (!longestEntry || countChars(e.body) > countChars(longestEntry.body)) longestEntry = e
  }

  const latest = dates[dates.length - 1]
  const daysSinceLast = latest
    ? Math.round((new Date(`${today}T00:00:00`).getTime() - new Date(`${latest}T00:00:00`).getTime()) / 86_400_000)
    : null

  return {
    totalEntries: entries.length,
    totalChars,
    avgChars: entries.length ? Math.round(totalChars / entries.length) : 0,
    activeDays: dates.length,
    currentStreak: streak,
    longestStreak: longestStreak(entries),
    moodIndex,
    moodCounts: moodCounts(entries),
    topTags: topTags(entries, 8),
    longestEntry,
    daysSinceLast,
    power: calcPower(entries, streak),
    firstDate: dates[0] ?? null,
  }
}

/** 最近 N 天（含今天）的每日字数 / 情绪序列，缺数据补 0 / null。 */
export function dailySeries(entries: DiaryEntry[], days: number, today: string = todayKey()): DailyPoint[] {
  const byDate = new Map<string, DiaryEntry>()
  for (const e of entries) byDate.set(e.date, e)
  const out: DailyPoint[] = []
  for (let i = days - 1; i >= 0; i -= 1) {
    const date = addDays(today, -i)
    const entry = byDate.get(date)
    out.push({
      date,
      chars: entry ? countChars(entry.body) : 0,
      mood: entry ? MOOD_MAP[entry.mood].score : null,
      hasEntry: Boolean(entry),
    })
  }
  return out
}

/** 写作时段分布：24 个小时桶，按 createdAt 落点。 */
export function hourHistogram(entries: DiaryEntry[]): number[] {
  const buckets = new Array<number>(24).fill(0)
  for (const e of entries) {
    const h = new Date(e.createdAt).getHours()
    if (Number.isFinite(h) && h >= 0 && h < 24) buckets[h] += 1
  }
  return buckets
}

/** 心情构成（用于甜甜圈），按分值从高到低排序，跳过 0。 */
export function moodSegments(entries: DiaryEntry[]): { key: MoodKey; label: string; count: number; color: string; glyph: string }[] {
  const counts = moodCounts(entries)
  return (Object.keys(counts) as MoodKey[])
    .map((key) => ({
      key,
      label: MOOD_MAP[key].label,
      count: counts[key],
      color: MOOD_MAP[key].color,
      glyph: MOOD_MAP[key].glyph,
    }))
    .filter((s) => s.count > 0)
    .sort((a, b) => MOOD_MAP[b.key].score - MOOD_MAP[a.key].score)
}

/** 热力图：最近 weeks*7 天，返回按周分列、周一在上的网格。 */
export function heatWeeks(entries: DiaryEntry[], weeks = 12, today: string = todayKey()): DailyPoint[][] {
  const map = new Map<string, DiaryEntry>()
  for (const e of entries) map.set(e.date, e)
  const end = new Date(`${today}T00:00:00`)
  const dayOfWeek = (end.getDay() + 6) % 7 // 周一=0
  const gridEnd = addDays(today, 6 - dayOfWeek)
  const start = addDays(gridEnd, -(weeks * 7 - 1))

  const columns: DailyPoint[][] = []
  for (let w = 0; w < weeks; w += 1) {
    const col: DailyPoint[] = []
    for (let d = 0; d < 7; d += 1) {
      const date = addDays(start, w * 7 + d)
      const entry = map.get(date)
      col.push({
        date,
        chars: entry ? countChars(entry.body) : 0,
        mood: entry ? MOOD_MAP[entry.mood].score : null,
        hasEntry: Boolean(entry),
      })
    }
    columns.push(col)
  }
  return columns
}

/** 单日数值的自我百分位：今天超过了历史多少比例的日子（自嘲式炫耀）。 */
export function selfPercentile(entries: DiaryEntry[], value: number): number {
  if (entries.length < 3) return 50
  const values = entries.map((e) => countChars(e.body)).sort((a, b) => a - b)
  const below = values.filter((v) => v < value).length
  return Math.round((below / values.length) * 100)
}
