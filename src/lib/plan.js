// Today's Plan / My Flare Plan (senior-first).
//
// A small library of safe, self-chosen actions. The user keeps a short personal
// plan; on tougher days the app shows it back as "Your plan for today" and lets
// them mark what helped. Each action maps 1:1 to a Day Log FACTOR, so marking it
// helped feeds the same pattern learning as the Day Log chips.
//
// Wording is conservative: anything with real risk (compression, medication,
// fluids, heat on numb skin) carries a clinician-check hint. Nothing here is a
// prescription.

// `factor` must match a label in daylog.js FACTORS. `conditions` lists the
// condition keys an action is most relevant to ([] = useful to everyone).
export const PLAN_ACTIONS = [
  {
    key: 'move',
    label: 'Gentle movement',
    factor: 'Gentle movement',
    conditions: [],
    hint: 'Range-of-motion, a short walk, or seated movement. Stop before it hurts.',
  },
  {
    key: 'warmth',
    label: 'Warmth for stiffness',
    factor: 'Heat / warmth',
    conditions: [],
    hint: 'Gentle warmth on stiff, achy areas. Make sure it is not too hot, especially on numb skin.',
  },
  {
    key: 'stretch',
    label: 'Gentle stretching',
    factor: 'Stretching',
    conditions: [],
    hint: 'Easy stretches, especially the stiff spots.',
  },
  {
    key: 'pace',
    label: 'Pace your chores',
    factor: 'Paced chores',
    conditions: [],
    hint: 'Spread tasks across the day instead of one big push.',
  },
  {
    key: 'rest',
    label: 'Take rest breaks',
    factor: 'Rest',
    conditions: [],
    hint: 'Short, planned breaks before you are worn out.',
  },
  {
    key: 'fluids',
    label: 'Drink fluids steadily',
    factor: 'Hydration',
    conditions: [],
    hint: 'Sip through the day, unless your clinician has told you to limit fluids.',
  },
  {
    key: 'elevate',
    label: 'Elevate your legs',
    factor: 'Elevation',
    conditions: [],
    hint: 'Feet up when you rest, to help swelling drain.',
  },
  {
    key: 'cold',
    label: 'Cold pack for swelling',
    factor: 'Ice',
    conditions: ['gout', 'injury'],
    hint: 'For something hot, swollen, or freshly irritated. Wrap it; never put ice straight on skin.',
  },
  {
    key: 'meds',
    label: 'Follow your pain plan',
    factor: 'Anti-inflammatory',
    conditions: [],
    hint: 'Your clinician-approved pain or anti-inflammatory plan, only as directed.',
  },
  {
    key: 'screens',
    label: 'Dim lights, screen breaks',
    factor: 'Screen breaks',
    conditions: ['migraine'],
    hint: 'Lower the brightness and rest your eyes when a swing is forecast.',
  },
  {
    key: 'saline',
    label: 'Saline rinse or steam',
    factor: 'Saline rinse',
    conditions: ['sinus'],
    hint: 'To help keep sinuses clear.',
  },
  {
    key: 'compression',
    label: 'Use compression',
    factor: 'Compression socks',
    conditions: [],
    hint: 'Only if a clinician has told you compression is safe for you.',
  },
]

export const PLAN_MAP = Object.fromEntries(PLAN_ACTIONS.map((a) => [a.key, a]))

// A safe, general starter plan for first run. All low-risk.
export const DEFAULT_PLAN = ['move', 'warmth', 'rest', 'pace', 'fluids']

// How many actions to show on a flagged day (kept short on purpose).
export const PLAN_SHOW_LIMIT = 5

// Resolve stored keys to action objects, preserving the library's order and
// dropping anything unknown.
export function resolvePlan(keys = []) {
  const set = new Set(keys)
  return PLAN_ACTIONS.filter((a) => set.has(a.key))
}
