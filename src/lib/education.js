// Education library (A8). Short, practical, condition-keyed explainers. General
// wellness guidance, not medical advice. `conditions` lists the condition keys
// each article is most relevant to ([] = relevant to everyone).

export const ARTICLES = [
  {
    id: 'swelling-calf-pump',
    title: 'Swelling & the calf-muscle pump',
    summary: 'Why ankles swell when you sit still, and how to get the fluid moving again.',
    conditions: ['injury'],
    intro:
      'When you sit or stand still for a while, blood and fluid pool in the lower legs and ankles. Your calf muscles work like a pump that pushes it back up, but only while they’re moving.',
    tips: [
      'Take a short walk after you’ve been sitting a while. Even 5 to 10 minutes helps.',
      'Do ankle pumps (point and flex your feet) while you’re seated.',
      'Put your feet up above hip level when you rest, so gravity can help things drain.',
      'Compression socks (15 to 20 mmHg) help push blood back up during long spells of sitting or standing.',
    ],
    note: 'Swelling that keeps coming back can have causes that have nothing to do with the weather, so it’s worth having a doctor take a look.',
  },
  {
    id: 'mobility-in-a-flare',
    title: 'Gentle mobility during a flare',
    summary: 'On a rough day, gentle movement beats sitting still. Keep it easy and often.',
    conditions: ['osteoarthritis', 'rheumatoid', 'fibromyalgia'],
    intro:
      'Sitting still stiffens joints up fast. On a flagged day, think little and often: short, easy movement spread through the day rather than one big push.',
    tips: [
      'Ankle pumps and circles, a few times an hour.',
      'Seated marches and slow knee extensions.',
      'Shoulder rolls and gentle neck turns for upper-body stiffness.',
      'Stop before it hurts. The goal is to keep things moving, not to push through pain.',
    ],
  },
  {
    id: 'heat-vs-ice',
    title: 'Heat or ice, and when to use each',
    summary: 'A simple rule for the choice people mix up most.',
    conditions: [],
    intro: 'These two get mixed up all the time. Here’s the simple rule:',
    tips: [
      'Reach for heat when things are stiff and achy. It relaxes muscles and gets the blood flowing, which is just what pressure-drop stiffness needs.',
      'Reach for ice when something is hot, swollen, and angry, or freshly injured. It calms the swelling and numbs the pain.',
      'Not sure on a stiff, achy day? Warmth is usually the safer pick.',
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
      'Omega-3s: oily fish like salmon or sardines, or a good fish-oil supplement.',
      'Stay well hydrated, especially on low-pressure days.',
      'Lean toward whole foods; go easy on heavily processed food and excess alcohol.',
      'For gout, watch known triggers (high-purine foods, alcohol, sugary drinks).',
    ],
  },
  {
    id: 'sleep-and-pain',
    title: 'Sleep & pain',
    summary: 'They feed each other, so protecting your sleep goes a long way.',
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
    if (a.conditions.length === 0) return 1 // general, relevant to everyone
    return a.conditions.some((k) => sel.has(k)) ? 2 : 0
  }
  return ARTICLES.map((a) => ({ ...a, forYou: score(a) === 2 }))
    .sort((a, b) => score(b) - score(a))
}
