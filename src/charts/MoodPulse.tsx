import { useMeasure } from '../lib/useMeasure'
import { formatShortCN } from '../lib/format'
import type { DailyPoint } from '../lib/stats'
import { scale, smoothPath } from './geometry'

interface Props {
  data: DailyPoint[]
  height?: number
}

/**
 * 情绪心电图：14 天的情绪分（0–100）。
 * 缺数据的地方断开而不是补零——补零会把「没写」画成「难过」。
 */
export function MoodPulse({ data, height = 220 }: Props) {
  const [ref, width] = useMeasure<HTMLDivElement>()
  const w = Math.max(280, width || 280)
  const h = height
  const padX = 14
  const padTop = 16
  const padBottom = 26

  const x = scale([0, Math.max(1, data.length - 1)], [padX, w - padX])
  const y = scale([0, 100], [h - padBottom, padTop])

  const segments: { x: number; y: number }[][] = []
  let run: { x: number; y: number }[] = []
  data.forEach((point, index) => {
    if (point.mood === null) {
      if (run.length) segments.push(run)
      run = []
      return
    }
    run.push({ x: x(index), y: y(point.mood) })
  })
  if (run.length) segments.push(run)

  const lastIndex = data.reduce((acc, point, index) => (point.hasEntry ? index : acc), -1)
  const lastPoint = lastIndex >= 0 && data[lastIndex].mood !== null ? { x: x(lastIndex), y: y(data[lastIndex].mood as number) } : null

  const labelEvery = w < 420 ? 4 : 2
  const average = averageMood(data)

  return (
    <div className="chart-body" ref={ref}>
      <svg role="img" viewBox={`0 0 ${w} ${h}`} height={h} aria-labelledby="moodpulse-title">
        <title id="moodpulse-title">
          情绪心电图：最近 {data.length} 天，有记录的 {data.filter((d) => d.hasEntry).length} 天，平均情绪{' '}
          {average === null ? '暂无' : Math.round(average)} 分。
        </title>
        <defs>
          <linearGradient id="mood-stroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--accent-2)" />
            <stop offset="55%" stopColor="var(--accent)" />
            <stop offset="100%" stopColor="var(--danger)" />
          </linearGradient>
          <linearGradient id="mood-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent-2)" stopOpacity="0.24" />
            <stop offset="100%" stopColor="var(--accent-2)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {[25, 50, 75].map((tick) => (
          <g key={tick}>
            <line
              x1={padX}
              x2={w - padX}
              y1={y(tick)}
              y2={y(tick)}
              stroke="var(--line)"
              strokeWidth={1}
              strokeDasharray="2 6"
            />
            <text x={4} y={y(tick) + 3} fontSize={9} fill="var(--ink-3)" fontFamily="var(--font-num)">
              {tick}
            </text>
          </g>
        ))}

        {data.map((point, index) =>
          index % labelEvery === 0 ? (
            <text
              key={point.date}
              x={x(index)}
              y={h - 8}
              fontSize={9}
              textAnchor="middle"
              fill="var(--ink-3)"
              fontFamily="var(--font-num)"
            >
              {formatShortCN(point.date)}
            </text>
          ) : null,
        )}

        {segments.map((segment, index) => {
          const line = smoothPath(segment)
          const area = `${line} L ${segment[segment.length - 1].x} ${h - padBottom} L ${segment[0].x} ${h - padBottom} Z`
          return (
            <g key={index}>
              {segment.length > 1 && <path d={area} fill="url(#mood-fill)" />}
              <path
                d={line}
                fill="none"
                stroke="url(#mood-stroke)"
                strokeWidth={2.6}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {segment.length === 1 && (
                <circle cx={segment[0].x} cy={segment[0].y} r={4} fill="var(--accent)" />
              )}
            </g>
          )
        })}

        {data.map((point, index) =>
          point.mood === null ? null : (
            <circle
              key={`dot-${point.date}`}
              cx={x(index)}
              cy={y(point.mood)}
              r={index === lastIndex ? 5 : 3}
              fill={index === lastIndex ? 'var(--accent)' : 'var(--bg-solid)'}
              stroke="var(--accent)"
              strokeWidth={index === lastIndex ? 3 : 1.6}
            />
          ),
        )}

        {lastPoint && (
          <text
            x={Math.min(lastPoint.x + 8, w - padX - 26)}
            y={Math.max(lastPoint.y - 10, 14)}
            fontSize={11}
            fill="var(--ink)"
            fontFamily="var(--font-num)"
            fontWeight={700}
          >
            {Math.round(data[lastIndex].mood as number)}
          </text>
        )}
      </svg>
    </div>
  )
}

function averageMood(data: DailyPoint[]): number | null {
  const values = data.map((point) => point.mood).filter((value): value is number => value !== null)
  if (values.length === 0) return null
  return values.reduce((a, b) => a + b, 0) / values.length
}
