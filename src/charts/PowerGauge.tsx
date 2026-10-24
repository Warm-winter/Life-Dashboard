import { useMeasure } from '../lib/useMeasure'
import { polar } from './geometry'

interface Props {
  score: number
}

/** 人生战斗力仪表：半圆刻度 + 指针。0 分时指针老实停在左边。 */
export function PowerGauge({ score }: Props) {
  const [ref, width] = useMeasure<HTMLDivElement>()
  const w = Math.max(160, width || 240)
  const height = Math.round(w * 0.62)
  const cx = w / 2
  const cy = height - 8
  const radius = Math.min(cx - 14, height - 30)
  const value = Math.max(0, Math.min(100, score))
  const angle = 180 + (value / 100) * 180

  const arc = (start: number, end: number, r: number): string => {
    const from = polar(cx, cy, r, start)
    const to = polar(cx, cy, r, end)
    const large = Math.abs(end - start) > 180 ? 1 : 0
    return `M ${from.x} ${from.y} A ${r} ${r} 0 ${large} 1 ${to.x} ${to.y}`
  }

  const ticks = Array.from({ length: 11 }, (_, index) => 180 + index * 18)
  const needleTip = polar(cx, cy, radius - 20, angle)

  return (
    <div ref={ref}>
      <svg role="img" viewBox={`0 0 ${w} ${height}`} height={height} aria-label={`人生战斗力 ${value} 分，满分 100 分`}>
        <path d={arc(180, 360, radius)} fill="none" stroke="var(--ink-3)" strokeWidth={12} strokeLinecap="round" opacity={0.35} />
        <path
          d={arc(180, Math.max(180.5, angle), radius)}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={12}
          strokeLinecap="round"
        />

        {ticks.map((tickAngle, index) => {
          const outer = polar(cx, cy, radius + 9, tickAngle)
          const inner = polar(cx, cy, radius + (index % 5 === 0 ? 2 : 5), tickAngle)
          return (
            <line
              key={tickAngle}
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              stroke="var(--ink-3)"
              strokeWidth={index % 5 === 0 ? 1.4 : 0.8}
              opacity={0.75}
            />
          )
        })}

        <text x={cx - radius} y={cy + 16} fontSize={9} fill="var(--ink-3)" textAnchor="middle" fontFamily="var(--font-num)">
          0
        </text>
        <text x={cx} y={cy - radius - 12} fontSize={9} fill="var(--ink-3)" textAnchor="middle" fontFamily="var(--font-num)">
          50
        </text>
        <text x={cx + radius} y={cy + 16} fontSize={9} fill="var(--ink-3)" textAnchor="middle" fontFamily="var(--font-num)">
          100
        </text>

        <line
          x1={cx}
          y1={cy}
          x2={needleTip.x}
          y2={needleTip.y}
          stroke="var(--ink)"
          strokeWidth={2.6}
          strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r={4.5} fill="var(--ink)" />
      </svg>
    </div>
  )
}
