import { useEffect, useRef } from 'react'

// Slide-out menu panel. Holds the setup + help cards so the main screen stays
// focused on today and tracking.
//
// Accessibility (W3C older-users guidance): when it opens, focus moves into the
// drawer; Tab is trapped inside; Escape closes it; and on close, focus returns
// to whatever opened it (the menu button).
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export default function SettingsDrawer({ open, onClose, children }) {
  const panelRef = useRef(null)
  const restoreRef = useRef(null)

  // Move focus in on open; restore it on close.
  useEffect(() => {
    if (open) {
      restoreRef.current = document.activeElement
      // Defer so the panel is laid out before we focus into it.
      const t = setTimeout(() => {
        const els = panelRef.current?.querySelectorAll(FOCUSABLE)
        els?.[0]?.focus()
      }, 50)
      return () => clearTimeout(t)
    }
    restoreRef.current?.focus?.()
  }, [open])

  // Escape to close; Tab trapped within the panel.
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab') return
      const els = panelRef.current?.querySelectorAll(FOCUSABLE)
      if (!els || !els.length) return
      const first = els[0]
      const last = els[els.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
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
        ref={panelRef}
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
