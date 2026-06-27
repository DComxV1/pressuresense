// Band styling, token-based. Risk hue runs teal -> amber -> red-orange (not
// green/red) so red-green colorblind users can tell the bands apart. Every band
// also carries an icon and a text label, so hue is never the only signal.
export const bandClasses = {
  green: {
    bg: 'bg-good/10',
    border: 'border-good/40',
    text: 'text-good-ink',
    dot: 'bg-good',
    solid: 'bg-good',
    icon: '✓',
    // The hero "horizon": a calm wash of the band color, stronger at the top
    // and easing toward the page so the color is the first thing felt.
    hero: 'bg-gradient-to-b from-good/25 via-good/10 to-good/[0.04]',
    heroBorder: 'border-good/30',
  },
  yellow: {
    bg: 'bg-caution/10',
    border: 'border-caution/40',
    text: 'text-caution-ink',
    dot: 'bg-caution',
    solid: 'bg-caution',
    icon: '⚠',
    hero: 'bg-gradient-to-b from-caution/25 via-caution/10 to-caution/[0.04]',
    heroBorder: 'border-caution/30',
  },
  red: {
    bg: 'bg-high/10',
    border: 'border-high/40',
    text: 'text-high-ink',
    dot: 'bg-high',
    solid: 'bg-high',
    icon: '◆',
    hero: 'bg-gradient-to-b from-high/25 via-high/10 to-high/[0.04]',
    heroBorder: 'border-high/30',
  },
}

export const trendArrow = {
  rising: '↑',
  falling: '↓',
  steady: '→',
}
