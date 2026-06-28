// Shared safety language. Kept in one place so the tips, the plan, the
// education library, the doctor report, and the "When to get help now" card all
// speak with the same conservative, clinician-safe voice.
//
// Tone rules (founder + audience): calm, plain, validating, never alarmist, no
// em-dashes. Everything here is general wellness support, not diagnosis or
// treatment.

// One-line disclaimer for footers and the report.
export const NOT_MEDICAL_ADVICE =
  'This is general wellness support, not medical advice or a diagnosis.'

// Who should check first, before trying compression, supplements, big changes
// to fluids, or a brand-new routine.
export const CLINICIAN_CHECK =
  'If you have heart, kidney, or circulation problems, diabetes or nerve pain, skin wounds, take blood thinners, or are pregnant, check with your clinician before using compression, supplements, big changes to how much you drink, or a new routine.'

// Short caveats reused inside individual tips, so guidance never sounds like a
// prescription.
export const CAVEATS = {
  fluids: 'unless your clinician has told you to limit fluids',
  compression: 'only if a clinician has told you it is safe for you',
  meds: 'as directed by your clinician',
}

// The "When to get help now" content. Plain language, grouped loosely from most
// time-critical down. Used by the safety card and linked from rough-day briefings.
export const URGENT_INTRO =
  'If something feels sudden, severe, or different from your usual pain, get medical help now. Trust your instincts.'

export const URGENT_SIGNS = [
  'Chest pain, trouble breathing, or fainting',
  'New weakness or numbness, face drooping, or trouble speaking',
  'A sudden, severe headache, or the worst headache of your life',
  'Severe new pain after a fall or injury',
  'One leg that is swollen, red, warm, or has severe calf pain',
  'A fever along with severe pain or swelling',
  'A joint that is hot, red, very swollen, or that you suddenly cannot use',
  'A reaction to a medicine, or worry about taking your medicines',
  'Thoughts of harming yourself, or not feeling safe',
]

// US helplines. (Kept simple; can be localized later.)
export const US_HELP = {
  emergency: { number: '911', label: 'for a medical emergency' },
  crisis: { number: '988', label: 'for mental health crisis support' },
}
