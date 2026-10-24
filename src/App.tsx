import { useCallback, useEffect, useRef, useState } from 'react'
import { ConfirmDialog } from './components/ConfirmDialog'
import { ParticleField } from './components/ParticleField'
import { StarWipe } from './components/StarWipe'
import { TabBar, TopBar } from './components/TopBar'
import { todayKey } from './lib/format'
import { buildSeedEntries } from './lib/seed'
import { playSound, setMuted } from './lib/sound'
import { saveEntries, saveSettings } from './lib/storage'
import { buildHash, buildSearch, parseFx, parseView } from './lib/urlState'
import { VIEW_LABELS, type DiaryEntry, type FxLevel, type Settings, type ViewKey } from './lib/types'
import { DashboardView } from './views/DashboardView'
import { EntriesView } from './views/EntriesView'
import { EntryModal } from './views/EntryModal'
import { WriteView } from './views/WriteView'

interface AppProps {
  initialEntries: DiaryEntry[]
  initialSettings: Settings
}

type ConfirmState = { kind: 'entry'; date: string } | { kind: 'clear' } | null

const sortDesc = (list: DiaryEntry[]): DiaryEntry[] =>
  [...list].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))

export function App({ initialEntries, initialSettings }: AppProps) {
  const [entries, setEntries] = useState<DiaryEntry[]>(initialEntries)
  const [settings, setSettings] = useState<Settings>(() => {
    const params = new URLSearchParams(window.location.search)
    return params.has('fx') ? { ...initialSettings, fx: parseFx(window.location.search) } : initialSettings
  })
  const [view, setView] = useState<ViewKey>(() => parseView(window.location.hash))
  const [selectedDate, setSelectedDate] = useState<string>(() => todayKey())
  const [modalDate, setModalDate] = useState<string | null>(null)
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null)
  const [wipeToken, setWipeToken] = useState(0)
  const [confirm, setConfirm] = useState<ConfirmState>(null)
  const mainRef = useRef<HTMLElement | null>(null)

  const fx = settings.fx

  const showToast = useCallback((text: string) => {
    setToast({ id: Date.now() + Math.round(Math.random() * 1000), text })
  }, [])

  /* ── 持久化与 URL ── */
  useEffect(() => {
    document.documentElement.dataset.fx = String(fx)
  }, [fx])

  useEffect(() => {
    saveSettings(settings)
  }, [settings])

  useEffect(() => {
    saveEntries(entries)
  }, [entries])

  useEffect(() => {
    const next = `${buildSearch(fx)}${buildHash(view)}`
    if (`${window.location.search}${window.location.hash}` !== next) {
      window.history.replaceState(null, '', next)
    }
  }, [fx, view])

  useEffect(() => {
    const onHashChange = () => setView(parseView(window.location.hash))
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => {
    document.title = `${VIEW_LABELS[view]} · 五毛钱人生仪表盘`
  }, [view])

  useEffect(() => {
    setMuted(!settings.sound)
  }, [settings.sound])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 2800)
    return () => window.clearTimeout(timer)
  }, [toast])

  /* ── 操作 ── */
  const goView = useCallback(
    (next: ViewKey) => {
      setView(next)
      if (next !== 'write' && fx >= 3.5) setWipeToken((token) => token + 1)
    },
    [fx],
  )

  const changeFx = useCallback(
    (next: FxLevel) => {
      setSettings((current) => ({ ...current, fx: next }))
      if (next > fx) setWipeToken((token) => token + 1)
      if (next >= 5) {
        playSound('fanfare')
        showToast('已拉满：五毛钱 MAX，全场最亮')
      } else if (next >= 2) {
        playSound('ding')
      } else if (next === 0) {
        playSound('pop')
        showToast('已回到 ¥0.00：假装很有品味')
      } else {
        playSound('pop')
      }
    },
    [fx, showToast],
  )

  const toggleSound = useCallback(() => {
    const next = !settings.sound
    setMuted(!next)
    if (next) playSound('ding')
    setSettings((current) => ({ ...current, sound: next }))
    showToast(next ? '音效已打开（记得接音箱）' : '音效已关闭')
  }, [settings.sound, showToast])

  const handleSave = useCallback((entry: DiaryEntry) => {
    setEntries((current) => sortDesc([...current.filter((item) => item.date !== entry.date), entry]))
  }, [])

  const handleDelete = useCallback(
    (date: string) => {
      setEntries((current) => current.filter((item) => item.date !== date))
      setModalDate(null)
      setConfirm(null)
      showToast('已删除。这一天从此不存在。')
    },
    [showToast],
  )

  const handleClear = useCallback(() => {
    setEntries([])
    setConfirm(null)
    showToast('日记本已清空，重新做人。')
  }, [showToast])

  const handleResetDemo = useCallback(() => {
    setEntries(sortDesc(buildSeedEntries()))
    showToast('已载入 19 天示例数据')
  }, [showToast])

  const handleExport = useCallback(() => {
    const payload = JSON.stringify(
      { version: 1, exportedAt: new Date().toISOString(), entries },
      null,
      2,
    )
    const blob = new Blob([payload], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `wumao-diary-${todayKey()}.json`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
    showToast('已导出 JSON 备份')
  }, [entries, showToast])

  const handleModalEdit = useCallback((date: string) => {
    setSelectedDate(date)
    setModalDate(null)
    setView('write')
  }, [])

  /* ── 键盘快捷键 ── */
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const typing = Boolean(
        target &&
          (target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.tagName === 'SELECT' ||
            target.isContentEditable),
      )

      if ((event.ctrlKey || event.metaKey) && event.shiftKey && (event.key === '$' || event.code === 'Digit4')) {
        event.preventDefault()
        changeFx(5)
        setView('dashboard')
        showToast('彩蛋已触发：全县最靓的仔')
        return
      }

      if (typing || event.ctrlKey || event.metaKey || event.altKey) return
      if (event.key === '1') goView('write')
      else if (event.key === '2') goView('dashboard')
      else if (event.key === '3') goView('entries')
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [changeFx, goView, showToast])

  const modalEntry = modalDate ? (entries.find((entry) => entry.date === modalDate) ?? null) : null

  return (
    <>
      <button
        type="button"
        className="skip-link"
        onClick={() => {
          mainRef.current?.focus()
        }}
      >
        跳到主要内容
      </button>

      <div className="rays" aria-hidden="true" />
      <ParticleField fx={fx} />

      <div className="app">
        <TopBar
          view={view}
          fx={fx}
          sound={settings.sound}
          onView={goView}
          onFx={changeFx}
          onSound={toggleSound}
        />

        <main id="main" className="shell" tabIndex={-1} ref={mainRef}>
          {view === 'write' && (
            <WriteView
              entries={entries}
              date={selectedDate}
              onDateChange={setSelectedDate}
              onSave={handleSave}
              onOpen={setModalDate}
              onRequestDelete={(date) => setConfirm({ kind: 'entry', date })}
            />
          )}
          {view === 'dashboard' && (
            <DashboardView entries={entries} fx={fx} onGoWrite={() => goView('write')} />
          )}
          {view === 'entries' && (
            <EntriesView
              entries={entries}
              onOpen={setModalDate}
              onGoWrite={() => goView('write')}
              onExport={handleExport}
              onResetDemo={handleResetDemo}
              onRequestClear={() => setConfirm({ kind: 'clear' })}
            />
          )}
        </main>

        <footer className="colophon">
          本特效由 ¥0.50 预算倾情赞助 · 数据仅存本机 · 五毛钱人生仪表盘 v0.5
        </footer>

        <TabBar view={view} onView={goView} />
      </div>

      <StarWipe trigger={wipeToken} enabled={fx >= 3.5} />

      <EntryModal
        entry={modalEntry}
        onClose={() => setModalDate(null)}
        onEdit={handleModalEdit}
        onDelete={(date) => {
          setModalDate(null)
          setConfirm({ kind: 'entry', date })
        }}
      />

      <ConfirmDialog
        open={confirm?.kind === 'entry'}
        title="真的删掉这篇？"
        message={
          confirm?.kind === 'entry'
            ? `将删除 ${confirm.date} 的日记，删除后无法恢复——数据只存在这台电脑上。`
            : ''
        }
        confirmText="删除"
        onConfirm={() => {
          if (confirm?.kind === 'entry') handleDelete(confirm.date)
        }}
        onCancel={() => setConfirm(null)}
      />

      <ConfirmDialog
        open={confirm?.kind === 'clear'}
        title="清空全部日记？"
        message="所有记录都会消失，且无法恢复。建议先导出一份 JSON 备份。"
        confirmText="全部清空"
        onConfirm={handleClear}
        onCancel={() => setConfirm(null)}
      />

      <div className="toast-wrap" role="status" aria-live="polite">
        {toast && (
          <div className="toast" key={toast.id}>
            {toast.text}
          </div>
        )}
      </div>
    </>
  )
}
