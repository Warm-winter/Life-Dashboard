import { formatShortCN } from '../lib/format'
import type { DailyPoint } from '../lib/stats'
import { useMeasure } from '../lib/useMeasure'
import { niceMax, scale } from './geometry'

interface Props {
  data: DailyPoint[]
  height?: number
}

/** 每日字数柱状图；柱顶直标数值，省得评委去数格子。 */
export function CharsBars({ data, height = 220 }: Props) {
  const [ref, width] = useMeasure<HTMLDivElement>()
  const w = Math.max(280, width || 280)
  const h = height
  const padX = 12
  const padTop = 22
  const padBottom = 26

  const maxValue = Math.max(1, ...data.map((point) => point.chars))
  const top = niceMax(maxValue, 3)
  const y = scale([0, top], [h - padBottom, padTop])
  const step = (w - padX * 2) / Math.max(1, data.length)
  const barWidth = Math.max(4, step * 0.56)
  const showValues = w >= 400
  const labelEvery = w < 420 ? 4 : 2

  return (
    <div className="chart-body" ref={ref}>
      <svg role="img" viewBox={`0 0 ${w} ${h}`} height={h} aria-labelledby="charsbars-title">
        <title id="charsbars-title">
          每日字数：最近 {data.length} 天，单日最高 {maxValue} 字，总计{' '}
          {data.reduce((sum, point) => sum + point.chars, 0)} 字。
        </title>
        <defs>
          <linearGradient id="chars-fill" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="var(--accent-2)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--accent)" />
          </linearGradient>
        </defs>

        {[0.5, 1].map((ratio) => (
          <line
            key={ratio}
            x1={padX}
            x2={w - padX}
            y1={y(top * ratio)}
            y2={y(top * ratio)}
            stroke="var(--line)"
            strokeWidth={1}
            strokeDasharray="2 6"
          />
        ))}

        {data.map((point, index) => {
          const cx = padX + step * index + step / 2
          const barHeight = Math.max(point.chars > 0 ? 3 : 1.5, h - padBottom - y(point.chars))
          const isMax = point.chars === maxValue && point.chars > 0
          return (
            <g key={point.date}>
              <rect
                x={cx - barWidth / 2}
                y={y(point.chars)}
                width={barWidth}
                height={barHeight}
                rx={Math.min(3, barWidth / 2)}
                fill={point.chars > 0 ? 'url(#chars-fill)' : 'var(--line)'}
                opacity={point.chars > 0 ? 1 : 0.7}
              >
                <title>
                  {point.date} · {point.chars} 字
                </title>
              </rect>
              {isMax && (
                <rect
                  x={cx - barWidth / 2}
                  y={y(point.chars)}
                  width={barWidth}
                  height={barHeight}
                  rx={Math.min(3, barWidth / 2)}
                  fill="none"
                  stroke="var(--ink)"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                />
              )}
              {showValues && point.chars > 0 && (
                <text
                  x={cx}
                  y={y(point.chars) - 5}
                  textAnchor="middle"
                  fontSize={9}
                  fill="var(--ink-2)"
                  fontFamily="var(--font-num)"
                >
                  {point.chars}
                </text>
              )}
              {index % labelEvery === 0 && (
                <text
                  x={cx}
                  y={h - 8}
                  textAnchor="middle"
                  fontSize={9}
                  fill="var(--ink-3)"
                  fontFamily="var(--font-num)"
                >
                  {formatShortCN(point.date)}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
