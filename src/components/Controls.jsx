// Sensitivity slider + unit toggle. Sensitivity calibrates when the model tips
// into YELLOW/RED — everyone's pressure sensitivity is individual.
export default function Controls({
  sensitivity,
  onSensitivity,
  unit,
  onUnit,
  includeWeather,
  onIncludeWeather,
}) {
  return (
    <div className="rounded-2xl border border-slate-700/60 bg-slate-800/40 p-5">
      <div className="flex items-center justify-between">
        <label htmlFor="sens" className="text-sm font-medium text-slate-200">
          Sensitivity
        </label>
        <span className="text-xs text-slate-400">{sensLabel(sensitivity)}</span>
      </div>
      <input
        id="sens"
        type="range"
        min="0"
        max="100"
        step="5"
        value={sensitivity}
        onChange={(e) => onSensitivity(Number(e.target.value))}
        aria-valuetext={`${sensLabel(sensitivity)} sensitivity`}
        className="mt-3 w-full accent-sky-500"
      />
      <div className="mt-1 flex justify-between text-[11px] text-slate-500">
        <span>Less sensitive</span>
        <span>More sensitive</span>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-200">Units</span>
        <div className="inline-flex overflow-hidden rounded-lg border border-slate-600">
          {['inHg', 'hPa'].map((u) => (
            <button
              key={u}
              onClick={() => onUnit(u)}
              aria-pressed={unit === u}
              aria-label={`Show pressure in ${u}`}
              className={`px-3 py-1 text-sm ${
                unit === u ? 'bg-sky-600 text-white' : 'bg-transparent text-slate-300'
              }`}
            >
              {u}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-slate-200">Weather factors</div>
          <p className="text-xs text-slate-400">
            Also weigh cold, humidity &amp; temperature swings, not just pressure.
          </p>
        </div>
        <button
          role="switch"
          aria-checked={includeWeather}
          aria-label="Include temperature and humidity in the risk score"
          onClick={() => onIncludeWeather(!includeWeather)}
          className={`relative h-6 w-11 shrink-0 rounded-full transition ${
            includeWeather ? 'bg-sky-600' : 'bg-slate-600'
          }`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${
              includeWeather ? 'left-[22px]' : 'left-0.5'
            }`}
          />
        </button>
      </div>
    </div>
  )
}

function sensLabel(s) {
  if (s <= 20) return 'Low'
  if (s <= 40) return 'Below average'
  if (s <= 60) return 'Average'
  if (s <= 80) return 'Above average'
  return 'High'
}
