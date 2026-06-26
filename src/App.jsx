import { useEffect, useMemo, useState } from 'react'
import { fetchPressureSeries, reverseGeocode } from './lib/weather.js'
import { computeHourlyRisk, currentConditions, dailyForecast } from './lib/risk.js'
import { buildBriefing, tipsFor, buildExplanation, goodStreak, buildEncouragement } from './lib/tips.js'
import { CONDITION_MAP } from './lib/conditions.js'
import { suggestSensitivity } from './lib/calibrate.js'
import {
  loadSettings,
  saveSettings,
  loadHistory,
  recordPrediction,
  setDayType,
  updateDayLog,
  toggleDayFactor,
  clearDayLog,
} from './lib/storage.js'

import CurrentCard from './components/CurrentCard.jsx'
import BriefingCard from './components/BriefingCard.jsx'
import ForecastStrip from './components/ForecastStrip.jsx'
import HourlyChart from './components/HourlyChart.jsx'
import Controls from './components/Controls.jsx'
import LocationBar from './components/LocationBar.jsx'
import HistoryView from './components/HistoryView.jsx'
import CorrelationView from './components/CorrelationView.jsx'
import CalibrationCard from './components/CalibrationCard.jsx'
import DayLog from './components/DayLog.jsx'
import EducationLibrary from './components/EducationLibrary.jsx'
import ConditionSelector from './components/ConditionSelector.jsx'
import Encouragement from './components/Encouragement.jsx'
import NotificationsCard from './components/NotificationsCard.jsx'
import BackupCard from './components/BackupCard.jsx'
import SettingsDrawer from './components/SettingsDrawer.jsx'
import HowItWorks from './components/HowItWorks.jsx'

export default function App() {
  const [settings, setSettings] = useState(loadSettings)
  const [series, setSeries] = useState(null)
  const [status, setStatus] = useState('idle') // idle | loading | ready | error
  const [error, setError] = useState(null)
  const [locating, setLocating] = useState(false)
  const [history, setHistory] = useState(loadHistory)
  const [selectedKey, setSelectedKey] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)

  const { unit, sensitivity, location, conditions, onboarded, includeWeather, theme, textSize, morningHour, eveningHour } =
    settings
  const selectedConditions = (conditions || []).map((k) => CONDITION_MAP[k]).filter(Boolean)
  // Stays up through the whole pick; dismissed only by Done/Skip, not by the
  // first selection.
  const showOnboarding = !onboarded

  // Persist settings whenever they change.
  useEffect(() => saveSettings(settings), [settings])

  // Apply theme + text size to the document root.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light')
  }, [theme])
  useEffect(() => {
    const px = { default: '18px', large: '20px', xl: '22px' }[textSize] || '18px'
    document.documentElement.style.fontSize = px
  }, [textSize])

  // Fetch pressure whenever the location changes.
  useEffect(() => {
    if (!location) {
      setStatus('idle')
      return
    }
    let cancelled = false
    setStatus('loading')
    setError(null)
    fetchPressureSeries(location.latitude, location.longitude)
      .then((s) => {
        if (cancelled) return
        setSeries(s)
        setStatus('ready')
      })
      .catch((err) => {
        if (cancelled) return
        setError(err.message)
        setStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [location])

  // Derive risk model from the raw series + current sensitivity.
  const model = useMemo(() => {
    if (!series?.hourly?.length) return null
    const now = new Date()
    const scored = computeHourlyRisk(series.hourly, sensitivity, undefined, includeWeather)
    const current = currentConditions(scored, now)
    const days = dailyForecast(scored, now, 3)
    const today = days[0] || null
    const briefing = buildBriefing(today, current)
    const explanation = buildExplanation(today, current, unit)
    return { scored, current, days, today, briefing, explanation }
  }, [series, sensitivity, unit, includeWeather])

  // Log today's prediction once we have a model.
  useEffect(() => {
    if (!model?.today) return
    setHistory(
      recordPrediction(model.today.key, model.today.band, model.today.score, model.today.minPressure),
    )
  }, [model?.today?.key, model?.today?.band])

  const calibration = useMemo(
    () => suggestSensitivity(history, sensitivity),
    [history, sensitivity],
  )

  const encouragement = model ? buildEncouragement(model.today, goodStreak(history)) : null

  const update = (patch) => setSettings((s) => ({ ...s, ...patch }))

  function toggleCondition(key) {
    setSettings((s) => {
      const set = new Set(s.conditions || [])
      set.has(key) ? set.delete(key) : set.add(key)
      return { ...s, conditions: [...set] }
    })
  }

  const todayKey = model?.today?.key || new Date().toDateString()
  const todayEntry = history.find((h) => h.dateKey === todayKey) || null

  function useDeviceLocation() {
    if (!navigator.geolocation) {
      setError('Geolocation is not available in this browser.')
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        const label = await reverseGeocode(latitude, longitude)
        update({ location: { label, latitude, longitude } })
        setLocating(false)
      },
      (err) => {
        setError(`Location failed: ${err.message}`)
        setLocating(false)
      },
      { enableHighAccuracy: false, timeout: 10000 },
    )
  }

  const selectedDay =
    model?.days?.find((d) => d.key === selectedKey) || model?.today || null

  return (
    <div className="mx-auto min-h-full max-w-md px-4 pb-16 pt-6">
      <header className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">PressureSense</h1>
          <p className="text-sm text-muted">
            A gentle heads-up on how today might feel, and easy things that help.
          </p>
        </div>
        <button
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          className="min-h-touch min-w-touch shrink-0 rounded-lg border border-border text-xl text-text hover:bg-surface-2"
        >
          ☰
        </button>
      </header>

      <div className="space-y-4">
        <LocationBar
          location={location}
          onPick={(loc) => update({ location: loc })}
          onUseDevice={useDeviceLocation}
          locating={locating}
        />

        {showOnboarding && (
          <ConditionSelector
            selected={conditions || []}
            onToggle={toggleCondition}
            onboarding
            onDismiss={() => update({ onboarded: true })}
          />
        )}

        {status === 'loading' && (
          <div className="rounded-2xl border border-border/60 bg-surface p-8 text-center text-sm text-muted">
            Loading pressure data…
          </div>
        )}

        {status === 'error' && (
          <div className="rounded-2xl border border-high/40 bg-high/10 p-5 text-sm text-high-ink">
            Couldn’t load data: {error}
          </div>
        )}

        {status === 'ready' && model && (
          <>
            <SectionLabel>Today</SectionLabel>
            <Encouragement text={encouragement} />
            <BriefingCard
              briefing={model.briefing}
              tips={tipsFor(model.today?.band || 'green', selectedConditions)}
              explanation={model.explanation}
            />
            <CurrentCard current={model.current} unit={unit} />
            <ForecastStrip
              days={model.days}
              unit={unit}
              selectedKey={selectedDay?.key}
              onSelect={setSelectedKey}
            />
            <HourlyChart day={selectedDay} unit={unit} />
          </>
        )}

        <SectionLabel>Your tracking</SectionLabel>
        {status === 'ready' && (
          <DayLog
            entry={todayEntry}
            history={history}
            onSetType={(t) => setHistory(setDayType(todayKey, t))}
            onUpdate={(patch) => setHistory(updateDayLog(todayKey, patch))}
            onToggleFactor={(f) => setHistory(toggleDayFactor(todayKey, f))}
            onClear={() => setHistory(clearDayLog(todayKey))}
          />
        )}

        <CorrelationView history={history} unit={unit} />

        <HistoryView history={history} />

        <CalibrationCard result={calibration} onApply={(v) => update({ sensitivity: v })} />

        <SectionLabel>Learn</SectionLabel>
        <EducationLibrary conditions={conditions || []} />

        <Disclaimer />
      </div>

      <SettingsDrawer open={menuOpen} onClose={() => setMenuOpen(false)}>
        <SectionLabel>Settings</SectionLabel>
        <NotificationsCard
          location={location}
          sensitivity={sensitivity}
          morningHour={morningHour ?? 7}
          eveningHour={eveningHour ?? 19}
          onHours={(patch) => update(patch)}
        />

        {!showOnboarding && (
          <ConditionSelector selected={conditions || []} onToggle={toggleCondition} />
        )}

        <Controls
          sensitivity={sensitivity}
          onSensitivity={(v) => update({ sensitivity: v })}
          unit={unit}
          onUnit={(u) => update({ unit: u })}
          includeWeather={!!includeWeather}
          onIncludeWeather={(v) => update({ includeWeather: v })}
          theme={theme || 'light'}
          onTheme={(t) => update({ theme: t })}
          textSize={textSize || 'default'}
          onTextSize={(t) => update({ textSize: t })}
        />

        <BackupCard />

        <SectionLabel>Help</SectionLabel>
        <HowItWorks />
      </SettingsDrawer>
    </div>
  )
}

// Small group header used on the main screen (Today / Your tracking) and inside
// the slide-out menu (Settings / Help).
function SectionLabel({ children }) {
  return (
    <div className="px-1 pt-3 text-[11px] font-semibold uppercase tracking-wider text-muted">{children}</div>
  )
}

function Disclaimer() {
  return (
    <p className="px-1 text-[11px] leading-relaxed text-muted">
      The link between pressure and pain is real for a lot of people, but it’s individual, and
      this is general wellness guidance, not medical advice or a diagnosis. Swelling and pain
      that stick around or keep coming back, especially in the ankles, can have causes that
      have nothing to do with the weather, so they’re always worth a chat with a doctor.
    </p>
  )
}
