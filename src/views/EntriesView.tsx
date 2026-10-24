import { useMemo, useState } from 'react'
import { countChars, formatDateCN, weekdayCN } from '../lib/format'
import { MOOD_MAP, type DiaryEntry } from '../lib/types'
import { SearchIcon } from '../components/icons'

interface Props {
  entries: DiaryEntry[]
  onOpen: (date: string) => void
  onGoWrite: () => void
  onExport: () => void
  onResetDemo: () => void
  onRequestClear: () => void
}

interface Group {
  month: string
  items: DiaryEntry[]
}

const LEFT_PAD = (value: number): string => String(value).padStart(2, '0')

export function EntriesView({
  entries,
  onOpen,
  onGoWrite,
  onExport,
  onResetDemo,
  onRequestClear,
}: Props) {
  const [query, setQuery] = useState('')
  const keyword = query.trim().toLowerCase()

  const filtered = useMemo(() => {
    if (!keyword) return entries
    return entries.filter((entry) => {
      const haystack = `${entry.title} ${entry.body} ${entry.tags.join(' ')}`.toLowerCase()
      return haystack.includes(keyword)
    })
  }, [entries, keyword])

  const groups = useMemo<Group[]>(() => {
    const map = new Map<string, DiaryEntry[]>()
    for (const entry of filtered) {
      const month = entry.date.slice(0, 7)
      const list = map.get(month)
      if (list) list.push(entry)
      else map.set(month, [entry])
    }
    return [...map.entries()].map(([month, items]) => ({ month, items }))
  }, [filtered])

  const totalChars = filtered.reduce((sum, entry) => sum + countChars(entry.body), 0)

  return (
    <div>
      <div className="view-head">
        <div className="view-title">
          <span className="view-kicker">ARCHIVE / {entries.length} ENTRIES</span>
          <h1 className="wordart wordart--xl">日记本</h1>
        </div>
        <div className="row" style={{ flexWrap: 'wrap' }}>
          <span className="badge">
            {filtered.length} 篇 · {totalChars} 字
          </span>
          <button type="button" className="btn btn--sm btn--ghost" onClick={onExport}>
            导出 JSON
          </button>
          <button type="button" className="btn btn--sm btn--ghost" onClick={onResetDemo}>
            载入示例
          </button>
          <button type="button" className="btn btn--sm btn--danger" onClick={onRequestClear}>
            清空
          </button>
        </div>
      </div>

      <div className="search-bar">
        <label className="sr-only" htmlFor="entries-search">
          搜索日记
        </label>
        <input
          id="entries-search"
          className="input"
          type="search"
          placeholder="搜标题、正文或标签…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <span className="dim" style={{ fontSize: 12 }}>
          <SearchIcon size={13} style={{ display: 'inline', verticalAlign: '-2px' }} /> {filtered.length} /{' '}
          {entries.length} 篇
        </span>
      </div>

      {filtered.length === 0 ? (
        <section className="card">
          <div className="chart-empty">
            <p>{entries.length === 0 ? '日记本还是空的。' : `没有找到包含「${query.trim()}」的记录。`}</p>
            <button type="button" className="btn btn--sm btn--primary" onClick={onGoWrite}>
              去写一篇
            </button>
          </div>
        </section>
      ) : (
        groups.map((group) => {
          const [year, month] = group.month.split('-')
          return (
            <section key={group.month} style={{ marginBottom: 'var(--sp-5)' }}>
              <div className="card-head" style={{ marginBottom: 'var(--sp-3)' }}>
                <h2 className="card-title">
                  {year} 年 {Number(month)} 月
                </h2>
                <span className="card-hint">{group.items.length} 篇</span>
              </div>
              <div className="entry-list">
                {group.items.map((entry) => {
                  const mood = MOOD_MAP[entry.mood]
                  const excerpt = entry.body.replace(/\s+/g, ' ').slice(0, 72)
                  const day = Number(entry.date.slice(8, 10))
                  return (
                    <button
                      key={entry.id}
                      type="button"
                      className="entry-row"
                      onClick={() => onOpen(entry.date)}
                      aria-label={`查看 ${formatDateCN(entry.date)} 的日记：${entry.title || '无题'}`}
                    >
                      <span className="entry-day">
                        <span className="entry-day-num num">{LEFT_PAD(day)}</span>
                        <span className="entry-day-meta">{weekdayCN(entry.date)}</span>
                      </span>
                      <span className="entry-main">
                        <span className="entry-title">{entry.title || '（无题）'}</span>
                        <span className="entry-excerpt">{excerpt || '（没有正文）'}</span>
                        {entry.tags.length > 0 && (
                          <span className="chips" style={{ marginTop: 4 }}>
                            {entry.tags.slice(0, 4).map((tag) => (
                              <span className="chip" key={tag}>
                                {tag}
                              </span>
                            ))}
                          </span>
                        )}
                      </span>
                      <span className="entry-side">
                        <span aria-hidden="true" style={{ fontSize: 18 }}>
                          {mood.glyph}
                        </span>
                        <span className="entry-chars">{countChars(entry.body)} 字</span>
                      </span>
                    </button>
                  )
                })}
              </div>
            </section>
          )
        })
      )}
    </div>
  )
}
