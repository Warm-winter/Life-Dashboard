import { useMemo } from 'react'
import { useMeasure } from '../lib/useMeasure'
import { clamp } from '../lib/format'
import { estimateTextWidth } from './geometry'

export interface TagDatum {
  tag: string
  count: number
}

interface Bubble extends TagDatum {
  x: number
  y: number
  r: number
  color: string
  fontSize: number
  label: string
}

const PALETTE = ['#FFD54A', '#59E3FF', '#FF5B7F', '#7CFF6B', '#C084FC', '#FFA45B', '#FFFFFF']

/** 确定性气泡排布：黄金角螺旋 + 简单碰撞检测，刷新多少次都一样。 */
function pack(tags: TagDatum[], width: number, height: number): Bubble[] {
  if (tags.length === 0) return []
  const maxCount = Math.max(...tags.map((item) => item.count))
  const placed: Bubble[] = []
  const cx = width / 2
  const cy = height / 2

  tags.slice(0, 7).forEach((item, index) => {
    const ratio = item.count / maxCount
    const fontSize = Math.round(11 + ratio * 6)
    const textWidth = estimateTextWidth(item.tag, fontSize)
    const r = Math.min(54, Math.max(24, textWidth / 2 + 12, 18 + ratio * 18))

    let angle = index * 2.399963
    let radius = 0
    let x = cx
    let y = cy

    for (let step = 0; step < 300; step += 1) {
      const cxi = cx + Math.cos(angle) * radius
      const cyi = cy + Math.sin(angle) * radius * 0.6
      const inside = cxi - r >= 2 && cxi + r <= width - 2 && cyi - r >= 2 && cyi + r <= height - 2
      const free = inside && placed.every((other) => Math.hypot(other.x - cxi, other.y - cyi) >= other.r + r + 3)
      if (free) {
        x = cxi
        y = cyi
        break
      }
      radius += 1.6
      angle += 0.61
    }

    x = clamp(x, r + 2, width - r - 2)
    y = clamp(y, r + 2, height - r - 2)

    // 太长的标签裁到能放下的长度，避免文字压出气泡
    const chars = Array.from(item.tag)
    let label = item.tag
    while (chars.length > 2 && estimateTextWidth(label, fontSize) > (r - 4) * 2) {
      chars.pop()
      label = `${chars.join('')}…`
    }

    placed.push({
      tag: item.tag,
      count: item.count,
      x,
      y,
      r,
      color: PALETTE[index % PALETTE.length],
      fontSize,
      label,
    })
  })

  // 让整簇居中：算包围盒再平移，避免视觉重心偏在一侧
  if (placed.length > 0) {
    const minX = Math.min(...placed.map((item) => item.x - item.r))
    const maxX = Math.max(...placed.map((item) => item.x + item.r))
    const minY = Math.min(...placed.map((item) => item.y - item.r))
    const maxY = Math.max(...placed.map((item) => item.y + item.r))
    const dx = width / 2 - (minX + maxX) / 2
    const dy = height / 2 - (minY + maxY) / 2
    for (const item of placed) {
      item.x += dx
      item.y += dy
    }
  }

  return placed
}

interface Props {
  tags: TagDatum[]
  height?: number
}

/** 标签星图：气泡面积随出现次数增长，颜色只做区分不做排序。 */
export function TagOrbit({ tags, height = 268 }: Props) {
  const [ref, width] = useMeasure<HTMLDivElement>()
  const w = Math.max(240, width || 240)
  const bubbles = useMemo(() => pack(tags, w, height), [tags, w, height])

  return (
    <div className="chart-body" ref={ref}>
      <svg role="img" viewBox={`0 0 ${w} ${height}`} height={height} aria-labelledby="tagorbit-title">
        <title id="tagorbit-title">
          标签星图：
          {tags.length === 0
            ? '还没有标签'
            : tags.map((item) => `${item.tag} ${item.count} 次`).join('，')}
          。
        </title>
        {bubbles.map((bubble) => (
          <g key={bubble.tag}>
            <circle
              cx={bubble.x}
              cy={bubble.y}
              r={bubble.r}
              fill={bubble.color}
              fillOpacity={0.18}
              stroke={bubble.color}
              strokeWidth={1.4}
            />
            <text
              x={bubble.x}
              y={bubble.y - 1}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={bubble.fontSize}
              fontWeight={700}
              fill="var(--ink)"
            >
              {bubble.label}
            </text>
            <text
              x={bubble.x}
              y={bubble.y + bubble.fontSize + 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={8}
              fill="var(--ink-3)"
              fontFamily="var(--font-num)"
            >
              {bubble.count}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}
