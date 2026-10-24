/** 图表用的纯几何工具：无依赖、确定性，方便在各种宽度下复现。 */

export interface Point {
  x: number
  y: number
}

export function scale(domain: [number, number], range: [number, number]) {
  const [d0, d1] = domain
  const [r0, r1] = range
  const span = d1 - d0
  return (value: number): number => (span === 0 ? r0 : r0 + ((value - d0) / span) * (r1 - r0))
}

/** 把最大值抬到好看的刻度（1/2/5 × 10^n） */
export function niceMax(value: number, steps = 4): number {
  if (!Number.isFinite(value) || value <= 0) return steps
  const rough = value / steps
  const magnitude = 10 ** Math.floor(Math.log10(rough))
  const normalized = rough / magnitude
  const step = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10
  return step * magnitude * steps
}

export function polar(cx: number, cy: number, radius: number, angleDeg: number): Point {
  const rad = (angleDeg * Math.PI) / 180
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) }
}

export function arcPath(cx: number, cy: number, radius: number, startDeg: number, endDeg: number): string {
  const start = polar(cx, cy, radius, startDeg)
  const end = polar(cx, cy, radius, endDeg)
  const large = Math.abs(endDeg - startDeg) > 180 ? 1 : 0
  const sweep = endDeg > startDeg ? 1 : 0
  return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${radius} ${radius} 0 ${large} ${sweep} ${end.x.toFixed(
    2,
  )} ${end.y.toFixed(2)}`
}

/** Catmull-Rom 转三次贝塞尔，让折线有手绘般的圆润感 */
export function smoothPath(points: Point[], tension = 0.18): string {
  if (points.length === 0) return ''
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`
  let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] ?? points[i]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2] ?? p2
    const c1x = p1.x + (p2.x - p0.x) * tension
    const c1y = p1.y + (p2.y - p0.y) * tension
    const c2x = p2.x - (p3.x - p1.x) * tension
    const c2y = p2.y - (p3.y - p1.y) * tension
    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2.x.toFixed(
      2,
    )} ${p2.y.toFixed(2)}`
  }
  return d
}

/** 估算中日韩文字宽度，用于占位与气泡半径 */
export function estimateTextWidth(text: string, fontSize: number): number {
  let width = 0
  for (const ch of text) {
    width += /[\u4e00-\u9fa5]/.test(ch) ? fontSize : fontSize * 0.56
  }
  return width
}
