import { formatShortCN } from '../lib/format'
import type { DailyPoint } from '../lib/stats'
import { useMeasure } from '../lib/useMeasure'

interface Props {
  weeks: DailyPoint[][]
  today: string
}

const WEEKDAY_LABELS: Record<number, string> = { 0: '一', 2: '三', 4: '五', 6: '日' }

function level(chars: number): number {
  if (chars <= 0) return 0
  if (chars < 60) return 1
  if (chars < 120) return 2
  if (chars < 220) return 3
  return 4
}

const OPACITY = [0, 0.42, 0.62, 0.82, 1]

/** 记录热力图：12 周 × 7 天，格子越亮写得越多。 */
export function HeatGrid({ weeks, today }: Props) {
  const [ref, width] = useMeasure<HTMLDivElement>()
  const w = Math.max(260, width || 260)
  const cols = weeks.length
  const labelWidth = 22
  const gap = 2.5
  const top = 16
  const cell = Math.max(8, Math.min(15, (w - labelWidth - gap * (cols - 1) - 2) / cols))
  const height = top + 7 * (cell + gap)

  const entries = weeks.flat().filter((point) => point.hasEntry).length

  return (
    <div className="chart-body" ref={ref}>
      <svg role="img" viewBox={`0 0 ${w} ${height}`} height={height} aria-labelledby="heatgrid-title">
        <title id="heatgrid-title">
          记录热力图：最近 {cols} 周共 {entries} 天有记录，今天 {formatShortCN(today)}。
        </title>

        {Object.entries(WEEKDAY_LABELS).map(([row, label]) => (
          <text
            key={row}
            x={0}
            y={top + Number(row) * (cell + gap) + cell / 2 + 3}
            fontSize={8}
            fill="var(--ink-3)"
            fontFamily="var(--font-num)"
          >
            {label}
          </text>
        ))}

        {weeks.map((week, colIndex) => {
          const firstOfWeek = week[0]?.date ?? ''
          const month = firstOfWeek.slice(5, 7)
          const prevMonth = colIndex > 0 ? weeks[colIndex - 1][0]?.date.slice(5, 7) : null
          const showMonth =
            colIndex === 0 || (month !== prevMonth && ['01', '04', '07', '10'].includes(month))
          return (
            <g key={`week-${colIndex}`}>
              {showMonth && (
                <text
                  x={labelWidth + colIndex * (cell + gap)}
                  y={10}
                  fontSize={8}
                  fill="var(--ink-3)"
                  fontFamily="var(--font-num)"
                >
                  {Number(month)}月
                </text>
              )}
              {week.map((point, rowIndex) => {
                const lv = level(point.chars)
                return (
                  <rect
                    key={point.date}
                    x={labelWidth + colIndex * (cell + gap)}
                    y={top + rowIndex * (cell + gap)}
                    width={cell}
                    height={cell}
                    rx={2}
                    fill={lv === 0 ? 'var(--ink)' : 'var(--accent)'}
                    fillOpacity={lv === 0 ? 0.05 : OPACITY[lv]}
                    stroke={point.date === today ? 'var(--ink)' : 'none'}
                    strokeWidth={point.date === today ? 1.2 : 0}
                  >
                    <title>
                      {point.date} · {point.chars} 字
                    </title>
                  </rect>
                )
              })}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
