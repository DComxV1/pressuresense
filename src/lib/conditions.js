// Condition library (A1). Each condition responds to pressure through a
// different mechanism, so the coaching differs. Tips are keyed to risk band.
// Multi-select: a user picks all that apply, and tips from each are blended.

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
  {
    key: 'migraine',
    label: 'Migraine / headaches',
    blurb: 'Pressure swings are a common migraine trigger.',
    tips: {
      green: ['A steady day. Keep hydration, caffeine, and sleep consistent.'],
      yellow: [
        'Stay ahead of it: drink plenty of water and keep your routine steady.',
        'Keep your usual remedies within reach.',
        'Go easy on bright light and long screen time.',
      ],
      red: [
        'A bigger pressure swing is coming. Keep your rescue plan close.',
        'Dim screens and bright light, and rest your eyes.',
        'Hydrate well and protect your sleep tonight.',
      ],
    },
  },
  {
    key: 'sinus',
    label: 'Sinus problems',
    blurb: 'Pressure changes can block sinuses and bring on sinus headaches.',
    tips: {
      green: ['Normal routine. Keep hydrated to keep sinuses happy.'],
      yellow: ['Stay hydrated.', 'A saline rinse or some steam can keep things clear.'],
      red: [
        'A pressure shift is coming. Try a saline rinse or steam.',
        'Stay well hydrated.',
        'Keep your usual sinus measures handy.',
      ],
    },
  },
  {
    key: 'back',
    label: 'Chronic back pain',
    blurb: 'Backs often stiffen and ache as pressure drops.',
    tips: {
      green: ['A good day for gentle activity and your usual movement.'],
      yellow: ['Keep moving gently and avoid sitting for too long.', 'Warmth on the lower back can help.'],
      red: [
        'Plan a gentler day and go easy on heavy lifting.',
        'Warmth and gentle stretching.',
        'Change position often rather than staying put.',
      ],
    },
  },
  {
    key: 'lupus',
    label: 'Lupus',
    blurb: 'Inflammatory flares can track with weather changes.',
    tips: {
      green: ['Keep your routine and anti-inflammatory habits steady.'],
      yellow: ['Balance rest with gentle movement.', 'Stay ahead of fatigue and keep hydrated.'],
      red: [
        'Pace yourself and rest proactively.',
        'Stay ahead of inflammation early.',
        'Protect against fatigue, and keep hydrated.',
      ],
    },
  },
  {
    key: 'neuropathy',
    label: 'Nerve pain',
    blurb: 'Some nerve pain flares with pressure and temperature shifts.',
    tips: {
      green: ['Normal routine, with some gentle movement.'],
      yellow: ['Gentle movement, and keep hands and feet warm.', 'Comfortable, supportive footwear.'],
      red: ['Keep warm and keep moving gently.', 'Ease off anything that aggravates the area.'],
    },
  },
]

export const CONDITION_MAP = Object.fromEntries(CONDITIONS.map((c) => [c.key, c]))
