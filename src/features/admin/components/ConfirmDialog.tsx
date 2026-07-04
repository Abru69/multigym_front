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
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-[var(--error)]/20 bg-gradient-to-br from-[var(--error)]/20 to-[var(--error)]/5 shadow-[0_0_12px_rgba(248,113,113,0.15)]">
          <AlertTriangle size={20} className="text-[var(--error)]" aria-hidden="true" />
        </div>
        <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{message}</p>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={onClose}
          disabled={isLoading}
          className="rounded-2xl border border-white/[0.08] bg-white/[0.04] px-5 py-2.5 text-sm font-semibold text-[var(--text-primary)] backdrop-blur-xl transition-all hover:bg-white/[0.08] active:scale-[0.97] disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className="rounded-2xl bg-gradient-to-r from-[var(--error)] to-[var(--error)]/80 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(248,113,113,0.3)] transition-all hover:shadow-[0_6px_20px_rgba(248,113,113,0.4)] active:scale-[0.97] disabled:opacity-50"
        >
          {isLoading ? 'Eliminando...' : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
