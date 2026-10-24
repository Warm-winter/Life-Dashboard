import { type ReactNode, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

interface ModalProps {
  open: boolean
  onClose: () => void
  labelledBy: string
  children: ReactNode
}

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

/** 带焦点陷阱、Esc 关闭、关闭后焦点归位的对话框。 */
export function Modal({ open, onClose, labelledBy, children }: ModalProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const restoreRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return
    restoreRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null

    const card = cardRef.current
    const focusables = () =>
      card
        ? Array.from(card.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
            (el) => !el.hasAttribute('disabled') && el.offsetParent !== null,
          )
        : []

    const first = focusables()[0]
    first?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab') return
      const list = focusables()
      if (list.length === 0) {
        event.preventDefault()
        return
      }
      const head = list[0]
      const tail = list[list.length - 1]
      if (event.shiftKey && document.activeElement === head) {
        event.preventDefault()
        tail.focus()
      } else if (!event.shiftKey && document.activeElement === tail) {
        event.preventDefault()
        head.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      restoreRef.current?.focus?.()
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby={labelledBy} ref={cardRef}>
        {children}
      </div>
    </div>,
    document.body,
  )
}
