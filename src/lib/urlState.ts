/** URL 状态：?fx=3.5#/dashboard —— 让每一个界面状态都能被直接打开、收藏、截图。 */
import { DEFAULT_FX, FX_LEVELS, type FxLevel, type ViewKey, isViewKey } from './types'

/** 任意数字就近吸附到六个合法档位；非法输入回落到默认档。 */
export function nearestFx(n: number): FxLevel {
  if (!Number.isFinite(n)) return DEFAULT_FX
  let best: FxLevel = FX_LEVELS[0]
  let bestGap = Number.POSITIVE_INFINITY
  for (const level of FX_LEVELS) {
    const gap = Math.abs(level - n)
    if (gap < bestGap) {
      bestGap = gap
      best = level
    }
  }
  return best
}

export function parseFx(search: string): FxLevel {
  const raw = new URLSearchParams(search).get('fx')
  if (raw === null || raw.trim() === '') return DEFAULT_FX
  const n = Number(raw)
  return nearestFx(n)
}

export function parseView(hash: string): ViewKey {
  const raw = hash.replace(/^#\/?/, '').split('?')[0]
  return isViewKey(raw) ? raw : 'write'
}

export function buildHash(view: ViewKey): string {
  return `#/${view}`
}

export function buildSearch(fx: FxLevel): string {
  return `?fx=${fx}`
}

/** 完整可分享链接（相对当前 origin） */
export function buildUrl(view: ViewKey, fx: FxLevel, origin = ''): string {
  return `${origin}/${buildSearch(fx)}${buildHash(view)}`
}

export function fxLabel(fx: FxLevel): string {
  return `¥${fx.toFixed(2)}`
}
