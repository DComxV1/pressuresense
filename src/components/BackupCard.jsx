import { useRef, useState } from 'react'
import { exportData, importData } from '../lib/storage.js'

// Data lives only in this browser, so export is the real safety net for a phone
// change or a cleared browser. Restore reads a previously exported file.
export default function BackupCard() {
  const fileRef = useRef(null)
  const [msg, setMsg] = useState(null)

  function exportNow() {
    try {
      const data = exportData()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `pressuresense-backup-${data.exportedAt.slice(0, 10)}.json`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      setMsg('Backup downloaded.')
    } catch {
      setMsg('Couldn’t create the backup.')
    }
  }

  async function onFile(e) {
    const file = e.target.files?.[0]
    e.target.value = '' // let the same file be re-imported later
    if (!file) return
    try {
      importData(JSON.parse(await file.text()))
      setMsg('Restored. Reloading…')
      setTimeout(() => window.location.reload(), 600)
    } catch (err) {
      setMsg(err?.message || 'Couldn’t read that file.')
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="text-sm font-medium text-text">Backup</div>
      <p className="mt-1 text-sm text-muted">
        Your data lives only on this device. Export a copy to keep it safe, or restore it on a new phone.
      </p>
      <div className="mt-3 flex flex-wrap gap-3">
        <button
          onClick={exportNow}
          className="min-h-touch rounded-lg bg-accent px-4 text-sm font-medium text-white"
        >
          Export backup
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          className="min-h-touch rounded-lg border border-border px-4 text-sm text-text hover:bg-surface-2"
        >
          Restore from file
        </button>
        <input ref={fileRef} type="file" accept="application/json,.json" onChange={onFile} className="hidden" />
      </div>
      {msg && <p className="mt-2 text-sm text-muted">{msg}</p>}
    </div>
  )
}
