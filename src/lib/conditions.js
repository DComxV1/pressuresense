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
        'Try gentle warmth on the stiff joint.',
      ],
      red: [
        'Favor low-impact movement over high-impact activity today.',
        'Gentle warmth and gentle mobility, little and often.',
        'Keep moving in short bursts rather than long stretches of rest.',
      ],
    },
  },
  {
    key: 'rheumatoid',
    label: 'Rheumatoid / inflammatory',
    blurb: 'Inflammation-driven flares.',
    tips: {
      green: ['Keep your clinician-approved anti-inflammatory plan steady.'],
      yellow: [
        'Follow your clinician-approved anti-inflammatory plan.',
        'Balance rest with gentle motion.',
        'Drink fluids steadily, unless your clinician has limited them.',
      ],
      red: [
        'Don’t overexert on a flare day.',
        'Prioritize rest balanced with gentle movement.',
        'Follow your clinician-approved plan as directed, rather than waiting.',
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
      green: ['Keep fluids steady, unless your clinician has limited them, and stay on top of your known dietary triggers.'],
      yellow: [
        'Drink fluids steadily, unless your clinician has limited them.',
        'Watch your known dietary triggers today.',
        'Elevate a joint if it feels tender.',
      ],
      red: [
        'Keep fluids steady through the day, unless your clinician has limited them.',
        'Be careful with your known dietary triggers today.',
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
        'Stay ahead of it: drink fluids steadily (unless your clinician has limited them) and keep your routine steady.',
        'Keep your usual remedies within reach.',
        'Go easy on bright light and long screen time.',
      ],
      red: [
        'A bigger pressure swing is coming. Keep your usual migraine plan, as directed, close.',
        'Dim screens and bright light, and rest your eyes.',
        'Drink fluids steadily, unless your clinician has limited them, and protect your sleep tonight.',
      ],
    },
  },
  {
    key: 'sinus',
    label: 'Sinus problems',
    blurb: 'Pressure changes can block sinuses and bring on sinus headaches.',
    tips: {
      green: ['Normal routine. Drink fluids steadily, unless your clinician has limited them, to keep sinuses comfortable.'],
      yellow: [
        'Drink fluids steadily, unless your clinician has limited them.',
        'A saline rinse or some steam can keep things clear.',
      ],
      red: [
        'A pressure shift is coming. Try a saline rinse or steam.',
        'Drink fluids steadily, unless your clinician has limited them.',
        'Use your usual sinus plan as directed.',
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
      green: ['Keep your routine and your clinician-approved anti-inflammatory plan steady.'],
      yellow: [
        'Balance rest with gentle movement.',
        'Stay ahead of fatigue, and drink fluids steadily unless your clinician has limited them.',
      ],
      red: [
        'Pace yourself and rest proactively.',
        'Follow your clinician-approved plan, rather than waiting.',
        'Protect against fatigue, and drink fluids steadily unless your clinician has limited them.',
      ],
    },
  },
  {
    key: 'neuropathy',
    label: 'Nerve pain',
    blurb: 'Some nerve pain flares with pressure and temperature shifts.',
    tips: {
      green: ['Normal routine, with some gentle movement.'],
      yellow: [
        'Gentle movement, and keep hands and feet warm. Check the warmth with a part of you that has normal feeling, since numb skin can burn without you noticing.',
        'Comfortable, supportive footwear.',
      ],
      red: ['Keep warm and keep moving gently, taking care that anything warm is not too hot for numb skin.', 'Ease off anything that aggravates the area.'],
    },
  },
]

export const CONDITION_MAP = Object.fromEntries(CONDITIONS.map((c) => [c.key, c]))
