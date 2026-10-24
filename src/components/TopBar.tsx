import type { ReactElement } from 'react'
import type { FxLevel, ViewKey } from '../lib/types'
import { FX_LEVELS, VIEWS, VIEW_LABELS } from '../lib/types'
import { fxLabel } from '../lib/urlState'
import {
  BookIcon,
  ChartIcon,
  PenIcon,
  SoundOffIcon,
  SoundOnIcon,
} from './icons'

type IconComponent = (props: { size?: number }) => ReactElement

const TAB_ICONS: Record<ViewKey, IconComponent> = {
  write: PenIcon,
  dashboard: ChartIcon,
  entries: BookIcon,
}

interface TopBarProps {
  view: ViewKey
  fx: FxLevel
  sound: boolean
  onView: (view: ViewKey) => void
  onFx: (fx: FxLevel) => void
  onSound: () => void
}

export function TopBar({ view, fx, sound, onView, onFx, onSound }: TopBarProps) {
  const index = FX_LEVELS.indexOf(fx)
  const SoundIcon = sound ? SoundOnIcon : SoundOffIcon

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <a
          className="brand"
          href="#/write"
          onClick={(event) => {
            event.preventDefault()
            onView('write')
          }}
        >
          <span className="brand-coin" aria-hidden="true">
            ¥
          </span>
          <span className="brand-text">
            <span className="brand-title">五毛钱人生仪表盘</span>
            <span className="brand-sub">FIVE-CENT LIFE OS</span>
          </span>
        </a>

        <nav className="tabs" aria-label="主导航">
          {VIEWS.map((item) => {
            const Icon = TAB_ICONS[item]
            return (
              <button
                key={item}
                type="button"
                className={`tab${view === item ? ' is-active' : ''}`}
                aria-current={view === item ? 'page' : undefined}
                onClick={() => onView(item)}
              >
                <Icon size={15} />
                {VIEW_LABELS[item]}
              </button>
            )
          })}
        </nav>

        <div className="fx-dock">
          <span className="fx-dock-label" id="fx-label">
            <span>特效预算</span>
            <span aria-hidden="true">FX BUDGET</span>
          </span>
          <input
            className="fx-slider"
            type="range"
            min={0}
            max={FX_LEVELS.length - 1}
            step={1}
            value={index < 0 ? 4 : index}
            aria-labelledby="fx-label"
            aria-valuetext={`特效预算 ${fxLabel(fx)}`}
            onChange={(event) => {
              const next = FX_LEVELS[Number(event.target.value)]
              if (next !== undefined) onFx(next)
            }}
          />
          <span className="fx-price" aria-hidden="true">
            {fxLabel(fx)}
          </span>
          <span className="fx-presets">
            <button type="button" className="btn btn--sm btn--ghost" onClick={() => onFx(0)}>
              ¥0
            </button>
            <button type="button" className="btn btn--sm" onClick={() => onFx(5)}>
              MAX
            </button>
          </span>
          <button
            type="button"
            className="btn btn--icon btn--ghost"
            aria-pressed={sound}
            aria-label={sound ? '关闭音效' : '打开音效'}
            title={sound ? '关闭音效' : '打开音效'}
            onClick={onSound}
          >
            <SoundIcon size={18} />
          </button>
        </div>
      </div>
    </header>
  )
}

export function TabBar({ view, onView }: { view: ViewKey; onView: (view: ViewKey) => void }) {
  return (
    <nav className="tabbar" aria-label="底部导航">
      <div className="tabbar-inner">
        {VIEWS.map((item) => {
          const Icon = TAB_ICONS[item]
          return (
            <button
              key={item}
              type="button"
              className={`tabbar-btn${view === item ? ' is-active' : ''}`}
              aria-current={view === item ? 'page' : undefined}
              onClick={() => onView(item)}
            >
              <Icon size={22} />
              <span>{VIEW_LABELS[item]}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
