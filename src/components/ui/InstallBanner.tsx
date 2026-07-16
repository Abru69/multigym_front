import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, X } from 'lucide-react'
import { useInstallPrompt } from '@/hooks/useInstallPrompt'

export function InstallBanner() {
  const { isInstallable, isInstalled, promptInstall } = useInstallPrompt()
  const [dismissed, setDismissed] = useState(false)
  const [installing, setInstalling] = useState(false)

  useEffect(() => {
    const wasDismissed = localStorage.getItem('pwa-install-dismissed')
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (wasDismissed) setDismissed(true)
  }, [])

  const handleInstall = async () => {
    setInstalling(true)
    await promptInstall()
    setInstalling(false)
  }

  const handleDismiss = () => {
    setDismissed(true)
    localStorage.setItem('pwa-install-dismissed', 'true')
  }

  if (isInstalled || dismissed || !isInstallable) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -80, opacity: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 200 }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between gap-4 border-b px-4 py-3 sm:px-6"
        style={{
          backgroundColor: 'var(--card)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            <Download size={20} style={{ color: 'var(--accent-text)' }} />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              Instalar MultiGym
            </p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Accede rápido desde tu pantalla de inicio
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleInstall}
            disabled={installing}
            className="rounded-xl px-4 py-2 text-sm font-bold transition-all hover:opacity-90 active:scale-[0.97] disabled:opacity-50"
            style={{
              backgroundColor: 'var(--accent)',
              color: 'var(--accent-text)',
            }}
          >
            {installing ? 'Instalando...' : 'Instalar'}
          </button>
          <button
            onClick={handleDismiss}
            className="rounded-lg p-2 transition-colors hover:bg-white/5"
            style={{ color: 'var(--text-muted)' }}
          >
            <X size={18} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
