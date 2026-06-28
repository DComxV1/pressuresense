// Doctor / caregiver report. Turns the on-device Day Log into something printable
// or shareable: a CSV for spreadsheets, and a clean printable page (Save as PDF).
// It is a personal tracking summary, never a diagnosis.

import { loadHistory, loadSettings } from './storage.js'
import { formatPressure } from './format.js'
import { patternConfidence } from './calibrate.js'
import { CONDITION_MAP } from './conditions.js'
import { TYPE_META } from './daylog.js'
import { NOT_MEDICAL_ADVICE } from './safety.js'

const DAY_MS = 86400000
const REPORT_DISCLAIMER =
  'This is a personal tracking report, not a diagnosis. It shows how one person logged their days alongside barometric pressure. Weather and pain links are real for many people but modest and individual.'

const fmtDate = (d) => d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })

// Assemble everything the CSV and the printable page need.
export function buildReportModel({ history = loadHistory(), settings = loadSettings(), days = 90, now = new Date() } = {}) {
  const start = days === 0 ? new Date(0) : new Date(now.getTime() - days * DAY_MS)
  const rows = history
    .filter((h) => h.type || h.pain != null || h.minPressure != null)
    .map((h) => ({ ...h, date: new Date(h.dateKey) }))
    .filter((r) => !Number.isNaN(r.date.getTime()) && r.date >= start)
    .sort((a, b) => a.date - b.date)

  const typed = rows.filter((r) => r.type)
  const counts = { good: 0, soso: 0, rough: 0 }
  for (const r of typed) if (counts[r.type] != null) counts[r.type]++
  const pains = typed.filter((r) => r.pain != null).map((r) => r.pain)
  const avgPain = pains.length ? pains.reduce((s, x) => s + x, 0) / pains.length : null
  const conditions = (settings.conditions || []).map((k) => CONDITION_MAP[k]?.label).filter(Boolean)

  return {
    generatedAt: now,
    rangeLabel: days === 0 ? 'All time' : `Last ${days} days`,
    start,
    end: now,
    unit: settings.unit || 'inHg',
    location: settings.location?.label || null,
    rows,
    counts,
    total: typed.length,
    avgPain,
    conditions,
    confidence: patternConfidence(history),
  }
}

export function reportToCSV(model) {
  const esc = (v) => {
    const s = v == null ? '' : String(v)
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const header = ['Date', 'Felt', 'Pain (0-10)', 'Low pressure', 'Forecast', 'What helped', 'Note']
  const lines = [header.map(esc).join(',')]
  for (const r of model.rows) {
    lines.push(
      [
        fmtDate(r.date),
        r.type ? TYPE_META[r.type].label : '',
        r.pain != null ? r.pain : '',
        r.minPressure != null ? formatPressure(r.minPressure, model.unit) : '',
        r.predictedBand || '',
        (r.factors || []).join('; '),
        r.note || '',
      ]
        .map(esc)
        .join(','),
    )
  }
  return lines.join('\r\n')
}

const escHtml = (s) =>
  String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

// A self-contained printable HTML document (its own styles), so it prints clean
// from a new window and the user can "Save as PDF".
export function reportToHTML(model) {
  const rowsHtml = model.rows.length
    ? model.rows
        .map(
          (r) => `<tr>
            <td>${escHtml(fmtDate(r.date))}</td>
            <td>${escHtml(r.type ? TYPE_META[r.type].label : '-')}</td>
            <td class="num">${r.pain != null ? r.pain : '-'}</td>
            <td class="num">${r.minPressure != null ? escHtml(formatPressure(r.minPressure, model.unit)) : '-'}</td>
            <td>${escHtml(r.predictedBand || '-')}</td>
            <td>${escHtml((r.factors || []).join(', ') || '-')}</td>
            <td>${escHtml(r.note || '')}</td>
          </tr>`,
        )
        .join('')
    : `<tr><td colspan="7" class="muted">No logged days in this range yet.</td></tr>`

  return `<!doctype html><html><head><meta charset="utf-8" />
<title>PressureSense report</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: Georgia, 'Times New Roman', serif; color: #1a2a33; margin: 32px; line-height: 1.5; }
  h1 { font-size: 22px; margin: 0 0 2px; }
  h2 { font-size: 14px; text-transform: uppercase; letter-spacing: .06em; color: #4a5a63; margin: 24px 0 8px; }
  .sub { color: #4a5a63; font-size: 13px; margin: 0; }
  .grid { display: flex; flex-wrap: wrap; gap: 24px; margin-top: 8px; }
  .stat .n { font-size: 24px; font-weight: 700; }
  .stat .l { font-size: 12px; color: #4a5a63; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; font-family: Arial, Helvetica, sans-serif; }
  th, td { text-align: left; padding: 6px 8px; border-bottom: 1px solid #d9e1e8; vertical-align: top; }
  th { background: #eff3f6; font-size: 11px; text-transform: uppercase; letter-spacing: .04em; color: #4a5a63; }
  td.num { text-align: right; font-variant-numeric: tabular-nums; }
  .muted { color: #4a5a63; }
  .disclaimer { margin-top: 24px; padding: 12px 14px; background: #f7f9fb; border: 1px solid #d9e1e8; border-radius: 8px; font-size: 12px; color: #4a5a63; }
  @media print { body { margin: 12mm; } button { display: none; } }
</style></head><body>
  <h1>PressureSense tracking report</h1>
  <p class="sub">${escHtml(model.rangeLabel)} &middot; generated ${escHtml(fmtDate(model.generatedAt))}${
    model.location ? ' &middot; ' + escHtml(model.location) : ''
  }</p>

  <h2>Summary</h2>
  <div class="grid">
    <div class="stat"><div class="n">${model.counts.good}</div><div class="l">good days</div></div>
    <div class="stat"><div class="n">${model.counts.soso}</div><div class="l">so-so days</div></div>
    <div class="stat"><div class="n">${model.counts.rough}</div><div class="l">rough days</div></div>
    <div class="stat"><div class="n">${model.avgPain != null ? model.avgPain.toFixed(1) : '-'}</div><div class="l">avg pain (0-10)</div></div>
  </div>
  <p class="sub" style="margin-top:12px">
    <strong>Conditions tracked:</strong> ${escHtml(model.conditions.join(', ') || 'none selected')}<br/>
    <strong>Pattern so far:</strong> ${escHtml(model.confidence.label)}. ${escHtml(model.confidence.blurb)}
  </p>

  <h2>Daily log</h2>
  <table>
    <thead><tr>
      <th>Date</th><th>Felt</th><th>Pain</th><th>Low pressure</th><th>Forecast</th><th>What helped</th><th>Note</th>
    </tr></thead>
    <tbody>${rowsHtml}</tbody>
  </table>

  <div class="disclaimer">${escHtml(REPORT_DISCLAIMER)} ${escHtml(NOT_MEDICAL_ADVICE)}</div>
</body></html>`
}

export { REPORT_DISCLAIMER }
