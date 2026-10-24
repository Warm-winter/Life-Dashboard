import { useEffect, useMemo, useState } from 'react'
import { countChars, formatDateCN, todayKey } from '../lib/format'
import { analyzeSignals, lexiconSentiment, personality } from '../lib/sentiment'
import { selfPercentile } from '../lib/stats'
import { MOODS, WEATHERS, type DiaryEntry, type MoodKey, type WeatherKey } from '../lib/types'
import { SparkIcon, TrashIcon } from '../components/icons'

interface Draft {
  title: string
  body: string
  mood: MoodKey
  weather: WeatherKey
  tags: string[]
}

function draftFrom(entry?: DiaryEntry): Draft {
  if (entry) {
    return {
      title: entry.title,
      body: entry.body,
      mood: entry.mood,
      weather: entry.weather,
      tags: [...entry.tags],
    }
  }
  return { title: '', body: '', mood: 'calm', weather: 'sunny', tags: [] }
}

function timeLabel(ts: number | null): string {
  if (!ts) return ''
  return new Date(ts).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

interface WriteViewProps {
  entries: DiaryEntry[]
  date: string
  onDateChange: (date: string) => void
  onSave: (entry: DiaryEntry) => void
  onOpen: (date: string) => void
  onRequestDelete: (date: string) => void
}

export function WriteView({ entries, date, onDateChange, onSave, onOpen, onRequestDelete }: WriteViewProps) {
  const existing = entries.find((item) => item.date === date)
  const [draft, setDraft] = useState<Draft>(() => draftFrom(existing))
  const [dirty, setDirty] = useState(false)
  const [savedAt, setSavedAt] = useState<number | null>(existing ? existing.updatedAt : null)
  const [tagInput, setTagInput] = useState('')
  const [flash, setFlash] = useState(0)

  // 换日期 = 换草稿（同一天的外部改动不覆盖你正在打的字）
  useEffect(() => {
    const entry = entries.find((item) => item.date === date)
    setDraft(draftFrom(entry))
    setDirty(false)
    setSavedAt(entry ? entry.updatedAt : null)
    setTagInput('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date])

  // 停笔 420ms 自动落盘
  useEffect(() => {
    if (!dirty) return
    const timer = window.setTimeout(() => {
      const now = Date.now()
      const isEmpty = !draft.title.trim() && !draft.body.trim() && draft.tags.length === 0
      if (!existing && isEmpty) {
        setDirty(false)
        return
      }
      onSave({
        id: existing?.id ?? `e-${date}`,
        date,
        title: draft.title.trim(),
        body: draft.body,
        mood: draft.mood,
        weather: draft.weather,
        tags: draft.tags,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      })
      setDirty(false)
      setSavedAt(now)
      setFlash((value) => value + 1)
    }, 420)
    return () => window.clearTimeout(timer)
  }, [draft, dirty, date, existing, onSave])

  const chars = countChars(draft.body)
  const signals = useMemo(() => analyzeSignals(draft.body), [draft.body])
  const persona = useMemo(() => personality(signals, draft.mood), [signals, draft.mood])
  const lexicon = useMemo(() => lexiconSentiment(draft.body), [draft.body])
  const percentile = useMemo(() => selfPercentile(entries, chars), [entries, chars])

  const update = (patch: Partial<Draft>) => {
    setDraft((current) => ({ ...current, ...patch }))
    setDirty(true)
  }

  const addTag = () => {
    const tag = tagInput.trim().slice(0, 12)
    if (!tag) return
    if (!draft.tags.includes(tag)) update({ tags: [...draft.tags, tag].slice(0, 8) })
    setTagInput('')
  }

  const toneLabel = lexicon.score > 0.15 ? '偏正面' : lexicon.score < -0.15 ? '偏负面' : '基本中性'
  const recent = entries.filter((item) => item.date !== date).slice(0, 4)

  return (
    <div>
      <div className="view-head">
        <div className="view-title">
          <span className="view-kicker">DAILY LOG / {date}</span>
          <h1 className="wordart wordart--xl">写日记</h1>
        </div>
        <div className="row" style={{ flexWrap: 'wrap' }}>
          <span className="badge">
            {dirty ? '输入中…' : savedAt ? `已保存 ${timeLabel(savedAt)}` : '还没开始'}
          </span>
          <span className="badge num">{chars} 字</span>
          <button
            type="button"
            className="btn btn--sm btn--ghost"
            onClick={() => onDateChange(todayKey())}
            disabled={date === todayKey()}
          >
            回到今天
          </button>
        </div>
      </div>

      <div className="write-grid">
        <aside className="stack write-side">
          <section className="card stack">
            <div className="field">
              <label className="field-label" htmlFor="entry-date">
                日期 · {formatDateCN(date)}
              </label>
              <input
                id="entry-date"
                className="input num"
                type="date"
                value={date}
                onChange={(event) => {
                  if (event.target.value) onDateChange(event.target.value)
                }}
              />
            </div>

            <div className="field">
              <span className="field-label" id="mood-label">
                今天的心情
              </span>
              <div className="mood-grid" role="group" aria-labelledby="mood-label">
                {MOODS.map((mood) => (
                  <button
                    key={mood.key}
                    type="button"
                    className="mood-btn"
                    aria-pressed={draft.mood === mood.key}
                    onClick={() => update({ mood: mood.key })}
                  >
                    <span className="mood-glyph" aria-hidden="true">
                      {mood.glyph}
                    </span>
                    <span className="mood-label">{mood.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="field">
              <label className="field-label" htmlFor="entry-weather">
                天气
              </label>
              <select
                id="entry-weather"
                className="select"
                value={draft.weather}
                onChange={(event) => update({ weather: event.target.value as WeatherKey })}
              >
                {WEATHERS.map((weather) => (
                  <option key={weather.key} value={weather.key}>
                    {weather.glyph} {weather.label}
                  </option>
                ))}
              </select>
            </div>
          </section>

          <section className="card stack">
            <div className="field">
              <label className="field-label" htmlFor="tag-input">
                标签 · 回车添加
              </label>
              <div className="tag-editor">
                <input
                  id="tag-input"
                  className="input"
                  value={tagInput}
                  maxLength={12}
                  placeholder="比如：加班"
                  onChange={(event) => setTagInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      addTag()
                    }
                  }}
                />
                <button type="button" className="btn btn--sm btn--primary" onClick={addTag}>
                  添加
                </button>
              </div>
            </div>
            {draft.tags.length > 0 ? (
              <div className="chips">
                {draft.tags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className="chip chip--tag"
                    onClick={() => update({ tags: draft.tags.filter((item) => item !== tag) })}
                    aria-label={`删除标签 ${tag}`}
                  >
                    {tag} <span aria-hidden="true">×</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="dim" style={{ fontSize: 12 }}>
                标签会进入看板的星图，建议每天 1–3 个。
              </p>
            )}
          </section>

          <section className="card card--tight">
            <p className="field-label" style={{ marginBottom: 8 }}>
              现场操作手册
            </p>
            <ul className="stack" style={{ gap: 6, fontSize: 12, color: 'var(--ink-2)' }}>
              <li>
                <span className="kbd">1</span> <span className="kbd">2</span> <span className="kbd">3</span>{' '}
                切换三个视图
              </li>
              <li>停笔半秒自动保存，数据只存在这台电脑。</li>
              <li>
                想给评委看点刺激的：<span className="kbd">Ctrl</span> + <span className="kbd">Shift</span> +{' '}
                <span className="kbd">$</span>
              </li>
            </ul>
          </section>
        </aside>

        <div className="stack write-main">
          <section className="card editor-card">
            {flash > 0 && <span className="save-ping" key={flash} aria-hidden="true" />}
            <input
              className="editor-title"
              value={draft.title}
              maxLength={80}
              placeholder="给今天起个标题"
              aria-label="日记标题"
              onChange={(event) => update({ title: event.target.value })}
            />
            <textarea
              className="editor-body"
              value={draft.body}
              placeholder="今天发生了什么？随便写两句也算数。"
              aria-label="日记正文"
              onChange={(event) => update({ body: event.target.value })}
            />
            <div className="editor-foot">
              <span>
                {chars} 字 · {signals.lines} 段 ·{' '}
                {existing ? `首次写于 ${timeLabel(existing.createdAt)}` : '这是一篇新日记'}
              </span>
              <span className="editor-actions">
                {existing && (
                  <button
                    type="button"
                    className="btn btn--sm btn--danger"
                    onClick={() => onRequestDelete(date)}
                  >
                    <TrashIcon size={14} /> 删除
                  </button>
                )}
              </span>
            </div>
          </section>

          <section className="card">
            <div className="card-head">
              <h2 className="card-title row" style={{ gap: 6 }}>
                <SparkIcon size={16} />
                本地玄学分析
              </h2>
              <span className="card-hint">0 token · 0 延迟 · 不联网</span>
            </div>
            <div className="analysis-grid">
              <dl className="analysis-item">
                <dt>今日人格</dt>
                <dd className="analysis-big wordart">{draft.body ? persona.label : '待测'}</dd>
              </dl>
              <dl className="analysis-item">
                <dt>情绪倾向</dt>
                <dd>
                  {toneLabel}
                  {lexicon.positive.length + lexicon.negative.length > 0 && (
                    <span className="dim">
                      {' '}
                      · {[...lexicon.positive, ...lexicon.negative].slice(0, 3).join(' / ')}
                    </span>
                  )}
                </dd>
              </dl>
              <dl className="analysis-item">
                <dt>文本特征</dt>
                <dd>
                  感叹 {signals.exclam} · 问号 {signals.question} · 省略 {signals.ellipsis} · 笑脸{' '}
                  {signals.laughs}
                </dd>
              </dl>
              <dl className="analysis-item">
                <dt>系统批注</dt>
                <dd>
                  {draft.body ? persona.note : '写点什么，它才有得分析。'}
                  {draft.body && (
                    <span className="dim" style={{ display: 'block', marginTop: 2 }}>
                      字数超过你自己 <strong className="num accent-text">{percentile}%</strong> 的日子
                    </span>
                  )}
                </dd>
              </dl>
            </div>
          </section>

          <section className="card">
            <div className="card-head">
              <h2 className="card-title">最近写过</h2>
              <span className="card-hint">点击查看全文</span>
            </div>
            {recent.length === 0 ? (
              <p className="dim" style={{ fontSize: 13 }}>
                还没有别的记录。
              </p>
            ) : (
              <div className="recent-list">
                {recent.map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    className="recent-item"
                    onClick={() => onOpen(entry.date)}
                  >
                    <span className="recent-date">{entry.date.slice(5)}</span>
                    <span className="recent-title">{entry.title || '（无题）'}</span>
                    <span className="recent-date">{countChars(entry.body)} 字</span>
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
