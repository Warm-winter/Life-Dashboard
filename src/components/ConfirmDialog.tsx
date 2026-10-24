import { Modal } from './Modal'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmText: string
  cancelText?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmText,
  cancelText = '算了',
  danger = true,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onCancel} labelledBy="confirm-title">
      <div className="modal-head">
        <h2 id="confirm-title" className="wordart" style={{ fontSize: 22 }}>
          {title}
        </h2>
      </div>
      <p className="muted" style={{ lineHeight: 1.8 }}>
        {message}
      </p>
      <div className="modal-foot">
        <button type="button" className="btn btn--ghost" onClick={onCancel}>
          {cancelText}
        </button>
        <button
          type="button"
          className={danger ? 'btn btn--danger' : 'btn btn--primary'}
          onClick={onConfirm}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  )
}
