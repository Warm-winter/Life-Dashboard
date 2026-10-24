import type { MoodKey } from '../lib/types'
import { useMeasure } from '../lib/useMeasure'
import { arcPath } from './geometry'

export interface MoodSegment {
  key: MoodKey
  label: string
  count: number
  color: string
  glyph: string
}

interface Props {
  segments: MoodSegment[]
  total: number
  height?: number
}

/** 心情构成甜甜圈：段数 ≤6，直接用弧长表达占比，中心放总数。 */
export function MoodDonut({ segments, total, height = 220 }: Props) {
  const [ref, width] = useMeasure<HTMLDivElement>()
  const w = Math.max(220, width || 220)
  const size = Math.min(w, height - 8)
  const cx = w / 2
  const cy = size / 2 + 2
  const thickness = Math.max(14, size * 0.12)
  const radius = size / 2 - thickness / 2 - 6

  let cursor = 180
  const arcs = segments.map((segment) => {
    const share = total > 0 ? segment.count / total : 0
    const sweep = share * 360
    const start = cursor
    const end = cursor + Math.max(0.6, sweep)
    cursor = end
    return { ...segment, start, end, share }
  })

  return (
    <div className="chart-body" ref={ref}>
      <svg role="img" viewBox={`0 0 ${w} ${size + 8}`} height={size + 8} aria-labelledby="mooddonut-title">
        <title id="mooddonut-title">
          心情构成：共 {total} 条，
          {segments.map((segment) => `${segment.label} ${segment.count} 条`).join('，')}。
        </title>

        <circle cx={cx} cy={cy} r={radius} fill="none" stroke="var(--line)" strokeWidth={thickness} opacity={0.5} />

        {arcs.map((arc) => (
          <path
            key={arc.key}
            d={arcPath(cx, cy, radius, arc.start, arc.end)}
            fill="none"
            stroke={arc.color}
            strokeWidth={thickness}
            strokeLinecap="butt"
            opacity={0.95}
          >
            <title>
              {arc.label} · {arc.count} 条 · {Math.round(arc.share * 100)}%
            </title>
          </path>
        ))}

        <text
          x={cx}
          y={cy - 2}
          textAnchor="middle"
          fontSize={Math.max(20, size * 0.15)}
          fontWeight={800}
          fill="var(--ink)"
          fontFamily="var(--font-num)"
        >
          {total}
        </text>
        <text
          x={cx}
          y={cy + Math.max(14, size * 0.12)}
          textAnchor="middle"
          fontSize={9}
          fill="var(--ink-3)"
          letterSpacing={2}
          fontFamily="var(--font-num)"
        >
          条记录
        </text>
      </svg>
    </div>
  )
}
