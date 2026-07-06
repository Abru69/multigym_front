import { create } from 'zustand'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'warning'
}

interface ToastStore {
  toasts: Toast[]
  addToast: (message: string, type?: Toast['type']) => void
  removeToast: (id: string) => void
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (message, type = 'success') => {
    const id = Math.random().toString(36).slice(2, 9)
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }))
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
    }, 4000)
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}))

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
}

const typeClasses = {
  success: 'border-[var(--success)]/30 bg-[var(--success)]/10',
  error: 'border-[var(--error)]/30 bg-[var(--error)]/10',
  warning: 'border-[var(--warning)]/30 bg-[var(--warning)]/10',
}

const iconClasses = {
  success: 'text-[var(--success)]',
  error: 'text-[var(--error)]',
  warning: 'text-[var(--warning)]',
}

function ToastContainer() {
  const { toasts, removeToast } = useToastStore()

  return (
    <div className="fixed right-4 bottom-4 z-[100] flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = icons[toast.type]
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.95 }}
              className={cn(
                'flex min-w-[280px] items-center gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-xl',
                typeClasses[toast.type]
              )}
            >
              <Icon size={18} className={iconClasses[toast.type]} />
              <span className="flex-1 text-sm text-[var(--text-primary)]">{toast.message}</span>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                aria-label="Cerrar notificación"
              >
                <X size={14} />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

export { ToastContainer }
