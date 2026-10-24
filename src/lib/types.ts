/**
 * 全局类型与常量。
 * 所有枚举值都同时承担「展示文案」与「数据键」两个身份，避免中文文案散落各处。
 */

export type MoodKey = 'joy' | 'calm' | 'neutral' | 'sad' | 'angry' | 'anxious'
export type WeatherKey = 'sunny' | 'cloudy' | 'rain' | 'snow' | 'wind'

/** 一天只记一篇：date 即业务主键。 */
export interface DiaryEntry {
  id: string
  /** 本地时区 YYYY-MM-DD */
  date: string
  title: string
  body: string
  mood: MoodKey
  weather: WeatherKey
  tags: string[]
  createdAt: number
  updatedAt: number
}

/** 特效预算档位（就是价格，讲的是同一个笑话） */
export const FX_LEVELS = [0, 0.5, 1, 2, 3.5, 5] as const
export type FxLevel = (typeof FX_LEVELS)[number]
export const DEFAULT_FX: FxLevel = 3.5

export interface Settings {
  fx: FxLevel
  sound: boolean
  seeded: boolean
}

export const DEFAULT_SETTINGS: Settings = { fx: DEFAULT_FX, sound: false, seeded: false }

export interface MoodMeta {
  key: MoodKey
  label: string
  /** 0-100，用于情绪指数 */
  score: number
  glyph: string
  color: string
  /** 数据看板用的短评 */
  quip: string
}

export const MOODS: MoodMeta[] = [
  { key: 'joy', label: '开心', score: 100, glyph: '😆', color: '#FFB400', quip: '今日状态：电量满格' },
  { key: 'calm', label: '平静', score: 82, glyph: '🙂', color: '#2FA36B', quip: '今日状态：低功耗运行' },
  { key: 'neutral', label: '一般', score: 62, glyph: '😐', color: '#8A8F98', quip: '今日状态：待机中' },
  { key: 'anxious', label: '焦虑', score: 34, glyph: '😰', color: '#5B8DEF', quip: '今日状态：后台进程过多' },
  { key: 'sad', label: '难过', score: 24, glyph: '😢', color: '#7C6BD6', quip: '今日状态：电量不足' },
  { key: 'angry', label: '生气', score: 16, glyph: '😤', color: '#E23B3B', quip: '今日状态：风扇狂转' },
]

export const MOOD_MAP = Object.fromEntries(MOODS.map((m) => [m.key, m])) as Record<MoodKey, MoodMeta>

export interface WeatherMeta {
  key: WeatherKey
  label: string
  glyph: string
}

export const WEATHERS: WeatherMeta[] = [
  { key: 'sunny', label: '晴', glyph: '☀️' },
  { key: 'cloudy', label: '多云', glyph: '☁️' },
  { key: 'rain', label: '下雨', glyph: '🌧️' },
  { key: 'snow', label: '下雪', glyph: '❄️' },
  { key: 'wind', label: '起风', glyph: '🌬️' },
]

export const WEATHER_MAP = Object.fromEntries(WEATHERS.map((w) => [w.key, w])) as Record<WeatherKey, WeatherMeta>

export const VIEWS = ['write', 'dashboard', 'entries'] as const
export type ViewKey = (typeof VIEWS)[number]

export const VIEW_LABELS: Record<ViewKey, string> = {
  write: '写日记',
  dashboard: '数据看板',
  entries: '日记本',
}

export function isMoodKey(v: unknown): v is MoodKey {
  return typeof v === 'string' && MOODS.some((m) => m.key === v)
}

export function isWeatherKey(v: unknown): v is WeatherKey {
  return typeof v === 'string' && WEATHERS.some((w) => w.key === v)
}

export function isViewKey(v: unknown): v is ViewKey {
  return typeof v === 'string' && (VIEWS as readonly string[]).includes(v)
}
