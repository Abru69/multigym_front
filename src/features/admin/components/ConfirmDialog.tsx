import { Modal } from '@/components/ui/Modal'
import { AlertTriangle } from 'lucide-react'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  isLoading?: boolean
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Eliminar',
  isLoading,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[var(--error)]/10">
          <AlertTriangle size={20} className="text-[var(--error)]" aria-hidden="true" />
        </div>
        <p className="text-sm text-[var(--text-secondary)]">{message}</p>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={onClose}
          disabled={isLoading}
          className="rounded-xl border border-[var(--border)] bg-transparent px-4 py-2 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-hover)] disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className="rounded-xl bg-[var(--error)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--error)]/90 disabled:opacity-50"
        >
          {isLoading ? 'Eliminando...' : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
