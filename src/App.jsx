import { useEffect, useMemo, useState } from 'react'
import { fetchPressureSeries, reverseGeocode } from './lib/weather.js'
import { computeHourlyRisk, currentConditions, dailyForecast } from './lib/risk.js'
import { buildBriefing, tipsFor, buildExplanation } from './lib/tips.js'
import { CONDITION_MAP } from './lib/conditions.js'
import { suggestSensitivity } from './lib/calibrate.js'
import {
  loadSettings,
  saveSettings,
  loadHistory,
  recordPrediction,
  recordCheckIn,
  markFlare,
  updateFlare,
  toggleFlareHelped,
  unmarkFlare,
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
import FlareLog from './components/FlareLog.jsx'
import ConditionSelector from './components/ConditionSelector.jsx'
import CheckInCard from './components/CheckInCard.jsx'

export default function App() {
  const [settings, setSettings] = useState(loadSettings)
  const [series, setSeries] = useState(null)
  const [status, setStatus] = useState('idle') // idle | loading | ready | error
  const [error, setError] = useState(null)
  const [locating, setLocating] = useState(false)
  const [history, setHistory] = useState(loadHistory)
  const [selectedKey, setSelectedKey] = useState(null)

  const { unit, sensitivity, location, conditions, onboarded } = settings
  const selectedConditions = (conditions || []).map((k) => CONDITION_MAP[k]).filter(Boolean)
  const showOnboarding = !onboarded && (conditions || []).length === 0

  // Persist settings whenever they change.
  useEffect(() => saveSettings(settings), [settings])

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
    const scored = computeHourlyRisk(series.hourly, sensitivity)
    const current = currentConditions(scored, now)
    const days = dailyForecast(scored, now, 3)
    const today = days[0] || null
    const briefing = buildBriefing(today, current)
    const explanation = buildExplanation(today, current, unit)
    return { scored, current, days, today, briefing, explanation }
  }, [series, sensitivity, unit])

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

  const update = (patch) => setSettings((s) => ({ ...s, ...patch }))

  function toggleCondition(key) {
    setSettings((s) => {
      const set = new Set(s.conditions || [])
      set.has(key) ? set.delete(key) : set.add(key)
      return { ...s, conditions: [...set], onboarded: true }
    })
  }

  const todayKey = model?.today?.key || new Date().toDateString()
  const todayEntry = history.find((h) => h.dateKey === todayKey) || null
  const onCheckIn = (patch) => setHistory(recordCheckIn(todayKey, patch))

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
      <header className="mb-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">PressureSense</h1>
        <p className="text-sm text-slate-400">
          Barometric pain forecast — what today will feel like, and what to do.
        </p>
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
          <div className="rounded-2xl border border-slate-700/60 bg-slate-800/40 p-8 text-center text-sm text-slate-400">
            Loading pressure data…
          </div>
        )}

        {status === 'error' && (
          <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-5 text-sm text-red-300">
            Couldn’t load data: {error}
          </div>
        )}

        {status === 'ready' && model && (
          <>
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

        {status === 'ready' && <CheckInCard entry={todayEntry} onChange={onCheckIn} />}

        <FlareLog
          history={history}
          todayKey={todayKey}
          onMark={() => setHistory(markFlare(todayKey))}
          onUpdate={(patch) => setHistory(updateFlare(todayKey, patch))}
          onToggleHelped={(remedy) => setHistory(toggleFlareHelped(todayKey, remedy))}
          onUnmark={() => setHistory(unmarkFlare(todayKey))}
        />

        <CalibrationCard result={calibration} onApply={(v) => update({ sensitivity: v })} />

        <Controls
          sensitivity={sensitivity}
          onSensitivity={(v) => update({ sensitivity: v })}
          unit={unit}
          onUnit={(u) => update({ unit: u })}
        />

        {!showOnboarding && (
          <ConditionSelector selected={conditions || []} onToggle={toggleCondition} />
        )}

        <CorrelationView history={history} unit={unit} />

        <HistoryView
          history={history}
          onFelt={(dateKey, felt) => setHistory(recordCheckIn(dateKey, { felt }))}
        />

        <Disclaimer />
      </div>
    </div>
  )
}

function Disclaimer() {
  return (
    <p className="px-1 text-[11px] leading-relaxed text-slate-400">
      The pressure–pain link is real for many people but individual, and this is general
      wellness guidance, not medical advice or a diagnosis. Persistent or recurrent swelling
      and pain — ankle swelling in particular — can have causes unrelated to weather and is
      worth a check with a clinician.
    </p>
  )
}
