import { create } from 'zustand'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react'


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

// eslint-disable-next-line react-refresh/only-export-components
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

const iconClasses = {
  success: 'text-green-500',
  error: 'text-red-500',
  warning: 'text-amber-500',
}

function ToastContainer() {
  const { toasts, removeToast } = useToastStore()

  return (
    <div className="fixed right-2 bottom-4 z-[100] flex flex-col gap-2 sm:right-4">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = icons[toast.type]
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.95 }}
              className="flex min-w-[240px] max-w-[calc(100vw-2rem)] items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2.5 shadow-[var(--shadow-lg)] sm:min-w-[280px] sm:px-4 sm:py-3"
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
