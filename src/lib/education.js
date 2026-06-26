// Education library (A8). Short, practical, condition-keyed explainers. General
// wellness guidance, not medical advice. `conditions` lists the condition keys
// each article is most relevant to ([] = relevant to everyone). `icon` is a
// simple visual cue to help scanning.

export const ARTICLES = [
  {
    id: 'swelling-calf-pump',
    title: 'Swelling & the calf-muscle pump',
    summary: 'Why ankles swell when you sit still, and how to get the fluid moving again.',
    icon: '🦵',
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
    icon: '🤸',
    conditions: ['osteoarthritis', 'rheumatoid', 'fibromyalgia', 'lupus', 'back'],
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
    icon: '🔥',
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
    icon: '🥗',
    conditions: ['rheumatoid', 'gout', 'lupus'],
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
    icon: '😴',
    conditions: ['fibromyalgia', 'lupus', 'migraine'],
    intro:
      'Pain and poor sleep reinforce each other. Protecting sleep is one of the highest-leverage things you can do for next-day pain and fatigue.',
    tips: [
      'Keep a consistent wind-down routine and bedtime.',
      'Cool, dark room; limit screens in the hour before bed.',
      'On a flagged day, pace your energy so you’re not wired and exhausted at night.',
    ],
  },
  {
    id: 'pressure-migraine',
    title: 'Riding out a pressure migraine',
    summary: 'What helps when a pressure swing brings one on.',
    icon: '🤕',
    conditions: ['migraine'],
    intro:
      'Barometric swings are a common migraine trigger. You can often blunt one by staying ahead of it rather than reacting once it hits.',
    tips: [
      'Hydrate steadily through the day; being even a little dry makes things worse.',
      'Keep sleep, meals, and caffeine on their usual schedule.',
      'Dim bright light and take screen breaks when a swing is forecast.',
      'Have your usual remedy on hand before the worst of it arrives.',
    ],
  },
  {
    id: 'clear-sinuses',
    title: 'Keeping sinuses clear',
    summary: 'Simple ways to ease pressure-driven sinus trouble.',
    icon: '👃',
    conditions: ['sinus'],
    intro:
      'When pressure shifts, sinuses can block up and ache. A few simple habits keep them clearer.',
    tips: [
      'Stay well hydrated to keep things thin and moving.',
      'A saline rinse or spray helps flush the sinuses out.',
      'Steam from a warm shower or a bowl of hot water can open things up.',
      'Gentle warmth over the cheeks and brow eases the ache.',
    ],
  },
  {
    id: 'back-care',
    title: 'Looking after your back',
    summary: 'Keeping a stiff back moving on a rough day.',
    icon: '🧍',
    conditions: ['back'],
    intro:
      'Backs tend to stiffen as pressure drops. Gentle, frequent movement beats long rest or bracing.',
    tips: [
      'Change position often; try not to sit in one spot too long.',
      'Gentle stretches and short walks keep things loose.',
      'Warmth on the lower back relaxes tight muscles.',
      'Go easy on heavy lifting and twisting on flagged days.',
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
