import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, X } from 'lucide-react'
import {
  getActiveAnnouncementsByPosition,
  trackAnnouncementClick,
  trackAnnouncementView,
} from '@/lib/api'
import type { AnnouncementDTO } from '@/types'

interface TenantAnnouncementsProps {
  position: AnnouncementDTO['position']
}

export function TenantAnnouncements({ position }: TenantAnnouncementsProps) {
  const [announcements, setAnnouncements] = useState<AnnouncementDTO[]>([])
  const [popupOpen, setPopupOpen] = useState(false)
  const viewedIds = useRef<Set<string>>(new Set())

  useEffect(() => {
    let mounted = true

    async function loadAnnouncements() {
      try {
        const response = await getActiveAnnouncementsByPosition(position)
        const items = response.lista ?? response.dto ?? []
        if (!mounted) return

        setAnnouncements(items)

        if (position === 'POPUP' && items.length > 0) {
          const popupKey = `tenant-announcement-popup-${items[0].id}`
          setPopupOpen(sessionStorage.getItem(popupKey) !== 'dismissed')
        }
      } catch {
        if (mounted) setAnnouncements([])
      }
    }

    loadAnnouncements()

    return () => {
      mounted = false
    }
  }, [position])

  useEffect(() => {
    announcements.forEach((announcement) => {
      if (viewedIds.current.has(announcement.id)) return
      viewedIds.current.add(announcement.id)
      trackAnnouncementView(announcement.id).catch(() => undefined)
    })
  }, [announcements])

  if (announcements.length === 0) return null

  if (position === 'POPUP') {
    const announcement = announcements[0]

    return (
      <AnimatePresence>
        {popupOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.96 }}
              className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-2xl"
            >
              <button
                type="button"
                onClick={() => {
                  sessionStorage.setItem(`tenant-announcement-popup-${announcement.id}`, 'dismissed')
                  setPopupOpen(false)
                }}
                className="absolute right-3 top-3 z-10 rounded-full bg-black/40 p-2 text-white transition-colors hover:bg-black/60"
                aria-label="Cerrar anuncio"
              >
                <X size={18} />
              </button>
              <AnnouncementMedia announcement={announcement} className="h-56 w-full" />
              <div className="p-6">
                <AnnouncementText announcement={announcement} titleClassName="text-2xl" />
                <AnnouncementLink announcement={announcement} className="mt-5 w-full justify-center" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  return (
    <section className={position === 'HERO' ? 'bg-[var(--bg-primary)] px-4 pb-6 sm:px-6 lg:px-8' : 'mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8'}>
      <div className={position === 'HERO' ? 'mx-auto max-w-7xl' : undefined}>
        <div className={position === 'FOOTER' ? 'grid gap-4 md:grid-cols-2' : 'space-y-4'}>
          {announcements.map((announcement) => (
            <motion.article
              key={announcement.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className={getCardClassName(position)}
            >
              <div className={position === 'BANNER' ? 'flex flex-col gap-5 sm:flex-row sm:items-center' : undefined}>
                <AnnouncementMedia
                  announcement={announcement}
                  className={position === 'BANNER' ? 'h-44 w-full rounded-2xl sm:w-72' : 'mb-5 h-56 w-full rounded-2xl'}
                />
                <div className="flex-1">
                  <AnnouncementText announcement={announcement} titleClassName={position === 'HERO' ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'} />
                  <AnnouncementLink announcement={announcement} className="mt-5" />
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}

function getCardClassName(position: AnnouncementDTO['position']) {
  const base = 'overflow-hidden border border-[var(--border)] bg-[var(--card)] shadow-sm'

  if (position === 'HERO') {
    return `${base} rounded-3xl p-5 sm:p-7`
  }

  if (position === 'FOOTER') {
    return `${base} rounded-2xl p-5`
  }

  return `${base} rounded-3xl p-5 sm:p-7`
}

function AnnouncementText({ announcement, titleClassName }: { announcement: AnnouncementDTO; titleClassName: string }) {
  return (
    <div>
      <p className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-[var(--accent)]">Anuncio</p>
      <h2 className={`${titleClassName} font-black tracking-tight text-[var(--text-primary)]`}>
        {announcement.title}
      </h2>
      {announcement.description && (
        <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)] sm:text-base">
          {announcement.description}
        </p>
      )}
    </div>
  )
}

function AnnouncementMedia({ announcement, className }: { announcement: AnnouncementDTO; className: string }) {
  if (!announcement.mediaUrl || announcement.mediaType === 'TEXT') return null

  if (announcement.mediaType === 'VIDEO') {
    return (
      <video
        controls
        className={`${className} bg-black object-cover`}
        src={announcement.mediaUrl}
      />
    )
  }

  return (
    <img
      src={announcement.mediaUrl}
      alt={announcement.title}
      className={`${className} object-cover`}
    />
  )
}

function AnnouncementLink({ announcement, className }: { announcement: AnnouncementDTO; className?: string }) {
  if (!announcement.linkUrl) return null

  return (
    <a
      href={announcement.linkUrl}
      target="_blank"
      rel="noreferrer"
      onClick={() => trackAnnouncementClick(announcement.id).catch(() => undefined)}
      className={`inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-bold text-[var(--accent-text)] transition-all hover:brightness-110 active:scale-[0.98] ${className ?? ''}`}
    >
      Ver más
      <ArrowRight size={16} />
    </a>
  )
}
