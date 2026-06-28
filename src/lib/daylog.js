// Shared Day Log vocabulary. One unified log replaces the old flare log + daily
// check-in: a day type, an optional pain level, shared factor chips, and a note.

export const DAY_TYPES = ['good', 'soso', 'rough']

// Day type maps onto the same risk bands used everywhere (green/yellow/red).
export const TYPE_BAND = { good: 'green', soso: 'yellow', rough: 'red' }

export const TYPE_META = {
  good: { label: 'Good', band: 'green' },
  soso: { label: 'So-so', band: 'yellow' },
  rough: { label: 'Rough', band: 'red' },
}

// The "what did you do" chips are the SAME for every day type — these apply to
// good days (repeat the wins) as much as rough ones. These double as the
// vocabulary the Flare Plan marks as "helped", so plan actions map onto these.
// Existing labels are kept stable so older logged entries stay matched.
export const FACTORS = [
  'Hydration',
  'Compression socks',
  'Elevation',
  'Gentle movement',
  'Rest',
  'Heat / warmth',
  'Ice',
  'Anti-inflammatory',
  'Stretching',
  'Paced chores',
  'Screen breaks',
  'Saline rinse',
  'Acted early',
  'Lighter day',
]

// Only the framing changes by type.
export const PROMPTS = {
  good: {
    heading: 'What worked / what did you do differently?',
    placeholder: 'What went well, what was different today…',
  },
  soso: {
    heading: 'What helped take the edge off?',
    placeholder: 'What you did, how it went…',
  },
  rough: {
    heading: 'What are you trying?',
    placeholder: 'What set it off, what you tried, how it went…',
  },
}
