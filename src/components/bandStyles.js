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
  },
  yellow: {
    bg: 'bg-caution/10',
    border: 'border-caution/40',
    text: 'text-caution-ink',
    dot: 'bg-caution',
    solid: 'bg-caution',
    icon: '⚠',
  },
  red: {
    bg: 'bg-high/10',
    border: 'border-high/40',
    text: 'text-high-ink',
    dot: 'bg-high',
    solid: 'bg-high',
    icon: '◆',
  },
}

export const trendArrow = {
  rising: '↑',
  falling: '↓',
  steady: '→',
}
