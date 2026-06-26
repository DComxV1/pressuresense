import { useState } from 'react'

// Plain-language FAQ: the science behind the forecast and what each part of the
// app does. Lives in the slide-out menu.
const FAQ = [
  {
    q: 'How does the forecast work?',
    a: 'Barometric pressure is the weight of the air around you. When it drops, especially quickly, the tissues and fluid around your joints can expand a little and press on nerves, which many people feel as pain, stiffness, or swelling. PressureSense pulls the hourly pressure forecast for your location and rates each day. It pays more attention to how fast pressure is falling than to how low it gets, because a rapid drop tends to provoke pain more than a steady low.',
  },
  {
    q: 'What do green, yellow, and red mean?',
    a: 'Green is calm, steady pressure: a good day. Yellow means some pressure movement, worth staying ahead of. Red means a sharp drop or pressure well below the comfortable zone, so plan a gentler day. Each one comes with a few things you can do.',
  },
  {
    q: 'What does the sensitivity slider do?',
    a: 'Everyone reacts to pressure a little differently. The slider sets how easily a day tips into yellow or red. More sensitive means smaller changes get flagged. You can set it by hand, or let the app learn it for you (see calibration).',
  },
  {
    q: 'What is the Day Log for?',
    a: 'Log how each day actually felt (good, so-so, or rough), your pain level, and what you did. After a couple of weeks this reveals your real pattern, and which things tend to show up on your good days.',
  },
  {
    q: 'What is “Your pattern”?',
    a: 'It lays the days you logged over the actual pressure, so you can see whether low pressure really lines up with your pain. It’s your own data, shown back to you.',
  },
  {
    q: 'What is calibration?',
    a: 'After about two weeks of logging, the app compares its predictions to how you actually felt and suggests the sensitivity that fits you best. That’s what makes the forecast yours rather than generic.',
  },
  {
    q: 'What are weather factors?',
    a: 'Optional. Some people are as sensitive to cold or humidity as they are to pressure. Turn this on to fold temperature and humidity into the score, or leave it off to keep things pressure-only.',
  },
  {
    q: 'How do notifications work?',
    a: 'A gentle good-morning note on calm days, and an evening heads-up when tomorrow looks tougher, at the local times you choose. They arrive even when the app is closed.',
  },
  {
    q: 'Will I lose my data?',
    a: 'Everything stays on this device and is private to you. Use Backup to export a copy, and Restore to bring it back on a new phone. It’s worth exporting now and then, and before switching phones.',
  },
  {
    q: 'Is this medical advice?',
    a: 'No. The link between pressure and pain is real for a lot of people but it’s individual. This is general wellness guidance, not medical advice or a diagnosis. Swelling or pain that sticks around or keeps coming back is always worth a chat with a doctor.',
  },
]

export default function HowItWorks() {
  const [open, setOpen] = useState(null)
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="mb-1 text-xs uppercase tracking-wide text-muted">How it works</div>
      <p className="mb-3 text-xs text-muted">The science, and what everything does.</p>
      <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border">
        {FAQ.map((item, i) => {
          const isOpen = open === i
          return (
            <li key={i}>
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-3 px-3 py-3 text-left hover:bg-surface-2"
              >
                <span className="text-sm font-medium text-text">{item.q}</span>
                <span className="shrink-0 text-muted" aria-hidden>
                  {isOpen ? '−' : '+'}
                </span>
              </button>
              {isOpen && <p className="px-3 pb-4 text-sm leading-relaxed text-muted">{item.a}</p>}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
