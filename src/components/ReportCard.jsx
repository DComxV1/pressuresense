import { useState } from 'react'
import { buildReportModel, reportToCSV, reportToHTML } from '../lib/report.js'

// Doctor / caregiver report. A printable summary (Save as PDF) and a CSV, built
// from the on-device log. Senior-friendly: big buttons, plain language.
const RANGES = [
  [30, '30 days'],
  [90, '90 days'],
  [0, 'All'],
]

export default function ReportCard() {
  const [days, setDays] = useState(90)
  const [msg, setMsg] = useState(null)

  function downloadCSV() {
    try {
      const model = buildReportModel({ days })
      const blob = new Blob([reportToCSV(model)], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `pressuresense-report-${model.generatedAt.toISOString().slice(0, 10)}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      setMsg('Report downloaded as a spreadsheet (CSV).')
    } catch {
      setMsg('Couldn’t create the report.')
    }
  }

  function printReport() {
    try {
      const model = buildReportModel({ days })
      const html = reportToHTML(model)
      const w = window.open('', '_blank')
      if (!w) {
        setMsg('Allow pop-ups for this site to open the printable report.')
        return
      }
      w.document.open()
      w.document.write(html)
      w.document.close()
      w.focus()
      setTimeout(() => {
        try {
          w.print()
        } catch {
          /* user can still print from the new tab */
        }
      }, 350)
      setMsg('Opened a printable report. Choose Print, then Save as PDF.')
    } catch {
      setMsg('Couldn’t open the printable report.')
    }
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-surface p-5">
      <div className="text-sm font-medium text-text">Doctor / caregiver report</div>
      <p className="mt-1 text-sm leading-relaxed text-muted">
        A simple summary of your logged days to print or share with a doctor or caregiver. It’s a
        personal tracking report, not a diagnosis.
      </p>

      <div className="mt-3 flex items-center gap-2">
        <span className="text-sm text-muted">Range</span>
        <div className="inline-flex overflow-hidden rounded-lg border border-border" role="group" aria-label="Report range">
          {RANGES.map(([val, label]) => (
            <button
              key={val}
              onClick={() => setDays(val)}
              aria-pressed={days === val}
              className={`min-h-touch px-3 text-sm ${
                days === val ? 'bg-accent text-white' : 'bg-transparent text-muted hover:bg-surface-2'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-3">
        <button
          onClick={printReport}
          className="min-h-touch rounded-lg bg-accent px-4 text-sm font-medium text-white"
        >
          Print / Save as PDF
        </button>
        <button
          onClick={downloadCSV}
          className="min-h-touch rounded-lg border border-border px-4 text-sm text-text hover:bg-surface-2"
        >
          Download spreadsheet (CSV)
        </button>
      </div>
      {msg && <p className="mt-2 text-sm text-muted">{msg}</p>}
    </div>
  )
}
