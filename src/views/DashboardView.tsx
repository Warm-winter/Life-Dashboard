import { type ReactNode, useMemo } from 'react'
import { CharsBars } from '../charts/CharsBars'
import { HeatGrid } from '../charts/HeatGrid'
import { MoodDonut } from '../charts/MoodDonut'
import { MoodPulse } from '../charts/MoodPulse'
import { PowerGauge } from '../charts/PowerGauge'
import { TagOrbit } from '../charts/TagOrbit'
import { formatShortCN, thousands, todayKey } from '../lib/format'
import {
  dailySeries,
  heatWeeks,
  moodSegments,
  summarize,
} from '../lib/stats'
import { MOOD_MAP, type DiaryEntry, type FxLevel } from '../lib/types'
import { fxLabel } from '../lib/urlState'
import { SparkIcon } from '../components/icons'

interface Props {
  entries: DiaryEntry[]
  fx: FxLevel
  onGoWrite: () => void
}

function ChartCard({
  title,
  hint,
  span,
  children,
}: {
  title: string
  hint: string
  span: string
  children: ReactNode
}) {
  return (
    <section className={`card chart-card ${span}`}>
      <div className="card-head" style={{ marginBottom: 4 }}>
        <h2 className="card-title">{title}</h2>
        <span className="card-hint">{hint}</span>
      </div>
      {children}
    </section>
  )
}

function Empty({ text, onGoWrite }: { text: string; onGoWrite: () => void }) {
  return (
    <div className="chart-empty">
      <p>{text}</p>
      <button type="button" className="btn btn--sm btn--primary" onClick={onGoWrite}>
        去写一篇
      </button>
    </div>
  )
}

export function DashboardView({ entries, fx, onGoWrite }: Props) {
  const today = todayKey()
  const summary = useMemo(() => summarize(entries, today), [entries, today])
  const series = useMemo(() => dailySeries(entries, 14, today), [entries, today])
  const segments = useMemo(() => moodSegments(entries), [entries])
  const weeks = useMemo(() => heatWeeks(entries, 52, today), [entries, today])

  const hasData = entries.length > 0
  const topTag = summary.topTags[0]
  const latestMood = entries[0] ? MOOD_MAP[entries[0].mood] : null

  const tickerItems = [
    `情绪指数 ${summary.moodIndex}/100`,
    `累计 ${thousands(summary.totalChars)} 字`,
    `连续记录 ${summary.currentStreak} 天`,
    `一年里写满了 ${summary.activeDays} 天`,
    topTag ? `高频标签「${topTag.tag}」${topTag.count} 次` : '还没有标签',
    summary.longestEntry
      ? `最长一篇 ${summary.longestEntry.title || '无题'} · ${summary.longestEntry.body.replace(/\s+/g, '').length} 字`
      : '最长一篇：待定',
    latestMood ? latestMood.quip : '今日状态：待录入',
    `当前特效预算 ${fxLabel(fx)}`,
    '数据仅存本机 · 断网也能跑',
    '本特效由 ¥0.50 预算倾情赞助',
  ]

  return (
    <div>
      <div className="view-head">
        <div className="view-title">
          <span className="view-kicker">LIFE COCKPIT / {formatShortCN(today)}</span>
          <h1 className="wordart wordart--xl">数据看板</h1>
        </div>
        <span className="badge badge--live">
          <SparkIcon size={12} /> LIVE
        </span>
      </div>

      <div className="dash-grid">
        <section className="card span-12 hero">
          <div className="hero-copy">
            <p className="eyebrow">
              人生驾驶舱 · 数据源 {summary.firstDate ? formatShortCN(summary.firstDate) : '—'} 至今
            </p>
            <h2 className="hero-title wordart wordart--xl" style={{ fontSize: 'clamp(20px,2.2vw,26px)' }}>
              人生战斗力
            </h2>
            <div className="hero-score num">
              {Math.round(summary.power.score)}
              <small>/ 100</small>
            </div>
            <p className="hero-rank">{summary.power.rank}</p>
            <p className="hero-note">
              连续记录 <strong className="num">{summary.currentStreak}</strong> 天 · 累计{' '}
              <strong className="num">{thousands(summary.totalChars)}</strong> 字 · 最近一次记录{' '}
              {summary.daysSinceLast === null
                ? '还没有'
                : summary.daysSinceLast === 0
                  ? '就在今天'
                  : `${summary.daysSinceLast} 天前`}
            </p>
          </div>
          <div className="hero-gauge">
            <PowerGauge score={summary.power.score} />
          </div>
        </section>

        <section className="card kpi span-3">
          <span className="kpi-label">累计日记</span>
          <span className="kpi-value num">
            {summary.totalEntries}
            <small>篇</small>
          </span>
          <span className="kpi-note">覆盖 {summary.activeDays} 个日子</span>
        </section>
        <section className="card kpi span-3">
          <span className="kpi-label">累计字数</span>
          <span className="kpi-value num">
            {thousands(summary.totalChars)}
            <small>字</small>
          </span>
          <span className="kpi-note">平均每篇 {summary.avgChars} 字</span>
        </section>
        <section className="card kpi span-3">
          <span className="kpi-label">连续记录</span>
          <span className="kpi-value num">
            {summary.currentStreak}
            <small>天</small>
          </span>
          <span className="kpi-note">历史最长 {summary.longestStreak} 天</span>
        </section>
        <section className="card kpi span-3">
          <span className="kpi-label">情绪指数</span>
          <span className="kpi-value num">
            {summary.moodIndex}
            <small>/100</small>
          </span>
          <span className="kpi-note">{latestMood ? `最近一次：${latestMood.label}` : '暂无情绪数据'}</span>
        </section>

        <ChartCard title="情绪心电图" hint="最近 14 天 · 缺记断线不补零" span="span-8">
          {hasData ? <MoodPulse data={series} /> : <Empty text="还没有任何记录，图上没东西可画。" onGoWrite={onGoWrite} />}
        </ChartCard>

        <ChartCard title="心情构成" hint="按篇数占比" span="span-4">
          {hasData ? (
            <>
              <MoodDonut segments={segments} total={summary.totalEntries} />
              <div className="legend">
                {segments.map((segment) => (
                  <span className="legend-item" key={segment.key}>
                    <span className="legend-dot" style={{ background: segment.color }} />
                    {segment.label} {segment.count}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <Empty text="没有心情数据。" onGoWrite={onGoWrite} />
          )}
        </ChartCard>

        <ChartCard title="每日字数" hint="柱顶直标数值" span="span-5">
          {hasData ? <CharsBars data={series} /> : <Empty text="还没有字数。" onGoWrite={onGoWrite} />}
        </ChartCard>

        <ChartCard title="标签星图" hint="气泡越大出现越多" span="span-7">
          {hasData && summary.topTags.length > 0 ? (
            <TagOrbit tags={summary.topTags} />
          ) : (
            <Empty text="还没有标签，写日记时加两个。" onGoWrite={onGoWrite} />
          )}
        </ChartCard>

        <ChartCard title="记录热力图" hint="近一年 · 颜色越亮写得越多" span="span-12">
          {hasData ? <HeatGrid weeks={weeks} today={today} /> : <Empty text="热力图目前一片空白。" onGoWrite={onGoWrite} />}
        </ChartCard>

        <section className="span-12">
          <div className="ticker" aria-hidden="true">
            <div className="ticker-track">
              {[...tickerItems, ...tickerItems].map((item, index) => (
                <span key={`${item}-${index}`} className="nowrap">
                  {item} <span className="star-sep">★</span>
                </span>
              ))}
            </div>
          </div>
          <p className="sr-only">
            数据摘要：{tickerItems.slice(0, 6).join('；')}。
          </p>
        </section>
      </div>
    </div>
  )
}
