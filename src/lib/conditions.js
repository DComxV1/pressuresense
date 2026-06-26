// Condition library (A1). Each condition responds to pressure through a
// different mechanism, so the coaching differs. Tips are keyed to risk band.

export const CONDITIONS = [
  {
    key: 'osteoarthritis',
    label: 'Osteoarthritis',
    blurb: 'Stiffness that worsens on pressure drops.',
    tips: {
      green: ['Good day for low-impact activity and range-of-motion work.'],
      yellow: [
        'Do gentle range-of-motion before activity.',
        'Keep moving in short bursts. Sitting still stiffens OA up fast.',
        'Apply warmth to the stiff joint.',
      ],
      red: [
        'Avoid high-impact activity today.',
        'Warm the joint and do gentle mobility, little and often.',
        'Keep moving in short bursts rather than long stretches of rest.',
      ],
    },
  },
  {
    key: 'rheumatoid',
    label: 'Rheumatoid / inflammatory',
    blurb: 'Inflammation-driven flares.',
    tips: {
      green: ['Keep your anti-inflammatory routine steady.'],
      yellow: [
        'Stay ahead with your anti-inflammatory routine.',
        'Balance rest with gentle motion.',
        'Hydrate well.',
      ],
      red: [
        'Don’t overexert on a flare day.',
        'Prioritize rest balanced with gentle movement.',
        'Stay ahead of the inflammation early. Don’t wait for it.',
      ],
    },
  },
  {
    key: 'fibromyalgia',
    label: 'Fibromyalgia',
    blurb: 'Heightened pain, fatigue, and fog. Pressure drops hit your energy too.',
    tips: {
      green: ['Pace yourself so you don’t burn through your energy and crash tomorrow.'],
      yellow: [
        'Pace activity; spread tasks across the day.',
        'Gentle stretching.',
        'Protect your sleep tonight.',
      ],
      red: [
        'Conserve your energy and plan an easy, low-demand day.',
        'Gentle stretching and stress regulation.',
        'Protect sleep and rest proactively before the crash.',
      ],
    },
  },
  {
    key: 'gout',
    label: 'Gout',
    blurb: 'Pressure and temperature shifts can precede flares.',
    tips: {
      green: ['Keep hydration up and stay on top of dietary triggers.'],
      yellow: ['Hydrate well.', 'Watch dietary triggers today.', 'Elevate if a joint feels tender.'],
      red: [
        'Hydrate aggressively.',
        'Be strict with dietary triggers today.',
        'Elevate and rest a tender joint.',
      ],
    },
  },
  {
    key: 'injury',
    label: 'Old injury / post-surgical',
    blurb: 'Localized weather sensitivity.',
    tips: {
      green: ['Your normal routine is fine. Just keep the area gently moving.'],
      yellow: [
        'Targeted warmth on the sensitive area.',
        'Consider light support or bracing if you’ll be active.',
      ],
      red: [
        'Targeted warmth and support/bracing on the area.',
        'Ease off loading the old injury today.',
      ],
    },
  },
]

export const CONDITION_MAP = Object.fromEntries(CONDITIONS.map((c) => [c.key, c]))
