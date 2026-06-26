// Sensitivity, units, weather factors, and appearance (theme + text size).
// Sensitivity calibrates when the model tips into YELLOW/RED. Everyone's
// pressure sensitivity is individual.
export default function Controls({
  sensitivity,
  onSensitivity,
  unit,
  onUnit,
  includeWeather,
  onIncludeWeather,
  theme,
  onTheme,
  textSize,
  onTextSize,
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-center justify-between">
        <label htmlFor="sens" className="text-sm font-medium text-text">
          Sensitivity
        </label>
        <span className="text-xs text-muted">{sensLabel(sensitivity)}</span>
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
        className="mt-3 h-3 w-full accent-accent"
      />
      <div className="mt-1 flex justify-between text-[11px] text-muted">
        <span>Less sensitive</span>
        <span>More sensitive</span>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <span className="text-sm font-medium text-text">Units</span>
        <Segmented
          options={[
            ['inHg', 'inHg'],
            ['hPa', 'hPa'],
          ]}
          value={unit}
          onChange={onUnit}
          ariaLabel="Pressure units"
        />
      </div>

      <div className="mt-6 flex items-center justify-between">
        <span className="text-sm font-medium text-text">Theme</span>
        <Segmented
          options={[
            ['light', 'Light'],
            ['dark', 'Dark'],
          ]}
          value={theme}
          onChange={onTheme}
          ariaLabel="Color theme"
        />
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-text">Text size</span>
        <Segmented
          options={[
            ['default', 'A'],
            ['large', 'A+'],
            ['xl', 'A++'],
          ]}
          value={textSize}
          onChange={onTextSize}
          ariaLabel="Text size"
        />
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-text">Weather factors</div>
          <p className="text-xs text-muted">
            Also weigh cold, humidity &amp; temperature swings, not just pressure.
          </p>
        </div>
        <button
          role="switch"
          aria-checked={includeWeather}
          aria-label="Include temperature and humidity in the risk score"
          onClick={() => onIncludeWeather(!includeWeather)}
          className={`relative h-7 w-12 shrink-0 rounded-full transition ${
            includeWeather ? 'bg-accent' : 'bg-border'
          }`}
        >
          <span
            className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
              includeWeather ? 'left-[26px]' : 'left-1'
            }`}
          />
        </button>
      </div>
    </div>
  )
}

function Segmented({ options, value, onChange, ariaLabel }) {
  return (
    <div className="inline-flex overflow-hidden rounded-lg border border-border" role="group" aria-label={ariaLabel}>
      {options.map(([val, label]) => (
        <button
          key={val}
          onClick={() => onChange(val)}
          aria-pressed={value === val}
          className={`min-h-touch px-3 text-sm ${
            value === val ? 'bg-accent text-white' : 'bg-transparent text-muted hover:bg-surface-2'
          }`}
        >
          {label}
        </button>
      ))}
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
