import { useEffect } from 'react'

// Slide-out menu panel. Holds the setup + help cards so the main screen stays
// focused on today and tracking. Closes on backdrop click or Escape.
export default function SettingsDrawer({ open, onClose, children }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  return (
    <div className={`fixed inset-0 z-50 ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-bg shadow-2xl transition-transform duration-200 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-bg px-4 py-3">
          <span className="text-base font-semibold text-text">Menu</span>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="min-h-touch min-w-touch rounded-lg text-2xl leading-none text-muted hover:bg-surface-2"
          >
            ×
          </button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">{children}</div>
      </div>
    </div>
  )
}
