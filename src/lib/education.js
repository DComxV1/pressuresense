// Education library (A8). Short, practical, condition-keyed explainers. General
// wellness guidance — not medical advice. `conditions` lists the condition keys
// each article is most relevant to ([] = relevant to everyone).

export const ARTICLES = [
  {
    id: 'swelling-calf-pump',
    title: 'Swelling & the calf-muscle pump',
    summary: 'Why ankles swell when you’re still — and how to move the fluid back up.',
    conditions: ['injury'],
    intro:
      'When you sit or stand still, blood and fluid pool in the lower legs and ankles. Your calf muscles act as a pump that pushes it back up — but only while they’re moving.',
    tips: [
      'Take a short walk after sitting a while — even 5–10 minutes helps.',
      'Do ankle pumps (point and flex your feet) when seated.',
      'Elevate your feet above hip level when resting so gravity assists drainage.',
      'Compression socks (15–20 mmHg) support venous return during long sitting or standing.',
    ],
    note: 'Recurrent ankle swelling can have causes unrelated to weather — worth a clinician’s check.',
  },
  {
    id: 'mobility-in-a-flare',
    title: 'Gentle mobility during a flare',
    summary: 'On a high-risk day, motion beats stillness — keep it gentle and frequent.',
    conditions: ['osteoarthritis', 'rheumatoid', 'fibromyalgia'],
    intro:
      'Stillness stiffens joints fast. On a flagged day, aim for “little and often” — short, easy movement through the day rather than one intense session.',
    tips: [
      'Ankle pumps and circles, a few times an hour.',
      'Seated marches and slow knee extensions.',
      'Shoulder rolls and gentle neck turns for upper-body stiffness.',
      'Stop short of pain — the goal is to keep things moving, not to push.',
    ],
  },
  {
    id: 'heat-vs-ice',
    title: 'Heat vs. ice — which, when?',
    summary: 'A simple rule for the most commonly confused choice.',
    conditions: [],
    intro: 'These get mixed up constantly. The simple rule:',
    tips: [
      'Heat for stiffness and dull aching — it relaxes muscles and improves blood flow. Good for pressure-drop stiffness.',
      'Ice for acute, hot, swollen inflammation or a fresh injury — it calms swelling and numbs pain.',
      'Unsure on a stiff, achy day? Warmth is usually the safer pick.',
    ],
  },
  {
    id: 'anti-inflammatory-basics',
    title: 'Anti-inflammatory basics',
    summary: 'A few food habits with decent evidence for inflammatory joint pain.',
    conditions: ['rheumatoid', 'gout'],
    intro:
      'Diet won’t replace your treatment, but a few habits have reasonable evidence for inflammatory joint pain.',
    tips: [
      'Omega-3s — oily fish like salmon or sardines, or a quality fish-oil supplement.',
      'Stay well hydrated, especially on low-pressure days.',
      'Lean toward whole foods; go easy on heavily processed food and excess alcohol.',
      'For gout, watch known triggers (high-purine foods, alcohol, sugary drinks).',
    ],
  },
  {
    id: 'sleep-and-pain',
    title: 'Sleep & pain',
    summary: 'They feed each other — protecting sleep is high-leverage.',
    conditions: ['fibromyalgia'],
    intro:
      'Pain and poor sleep reinforce each other. Protecting sleep is one of the highest-leverage things you can do for next-day pain and fatigue.',
    tips: [
      'Keep a consistent wind-down routine and bedtime.',
      'Cool, dark room; limit screens in the hour before bed.',
      'On a flagged day, pace your energy so you’re not wired and exhausted at night.',
    ],
  },
]

// Rank articles for a user: condition-specific matches first, then general,
// then the rest. `forYou` flags a direct condition match.
export function rankedArticles(selectedConditionKeys = []) {
  const sel = new Set(selectedConditionKeys)
  const score = (a) => {
    if (a.conditions.length === 0) return 1 // general — relevant to everyone
    return a.conditions.some((k) => sel.has(k)) ? 2 : 0
  }
  return ARTICLES.map((a) => ({ ...a, forYou: score(a) === 2 }))
    .sort((a, b) => score(b) - score(a))
}
