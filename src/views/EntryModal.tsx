import { Modal } from '../components/Modal'
import { CloseIcon } from '../components/icons'
import { countChars, formatDateCN } from '../lib/format'
import { MOOD_MAP, WEATHER_MAP, type DiaryEntry } from '../lib/types'

interface Props {
  entry: DiaryEntry | null
  onClose: () => void
  onEdit: (date: string) => void
  onDelete: (date: string) => void
}

export function EntryModal({ entry, onClose, onEdit, onDelete }: Props) {
  return (
    <Modal open={Boolean(entry)} onClose={onClose} labelledBy="entry-modal-title">
      {entry && (
        <>
          <div className="modal-head">
            <div>
              <p className="view-kicker">
                {formatDateCN(entry.date)} · {WEATHER_MAP[entry.weather].glyph}{' '}
                {WEATHER_MAP[entry.weather].label}
              </p>
              <h2 id="entry-modal-title" className="wordart" style={{ fontSize: 26, marginTop: 4 }}>
                {entry.title || '（无题）'}
              </h2>
            </div>
            <button type="button" className="btn btn--icon btn--ghost" onClick={onClose} aria-label="关闭">
              <CloseIcon size={18} />
            </button>
          </div>

          <div className="chips">
            <span className="chip">
              {MOOD_MAP[entry.mood].glyph} {MOOD_MAP[entry.mood].label}
            </span>
            {entry.tags.map((tag) => (
              <span className="chip" key={tag}>
                {tag}
              </span>
            ))}
            <span className="chip num">{countChars(entry.body)} 字</span>
          </div>

          <div className="modal-body">{entry.body || '（这一天只留下了标题。）'}</div>

          <div className="modal-foot">
            <button type="button" className="btn btn--danger" onClick={() => onDelete(entry.date)}>
              删除这篇
            </button>
            <button type="button" className="btn btn--ghost" onClick={onClose}>
              关闭
            </button>
            <button type="button" className="btn btn--primary" onClick={() => onEdit(entry.date)}>
              编辑这篇
            </button>
          </div>
        </>
      )}
    </Modal>
  )
}
