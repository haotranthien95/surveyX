// Shared chart color palette — refined, muted tones
// Inspired by Linear/Vercel dashboards: softer saturation, professional feel

export const DIMENSION_COLORS = {
  Credibility: 'hsl(220 70% 55%)',    // soft blue
  Respect: 'hsl(255 55% 58%)',        // muted violet
  Fairness: 'hsl(175 45% 45%)',       // teal
  Pride: 'hsl(25 75% 55%)',           // warm amber
  Camaraderie: 'hsl(155 45% 45%)',    // sage green
} as const;

export const DIMENSION_COLORS_LIGHT = {
  Credibility: 'hsl(220 70% 92%)',
  Respect: 'hsl(255 55% 92%)',
  Fairness: 'hsl(175 45% 90%)',
  Pride: 'hsl(25 75% 92%)',
  Camaraderie: 'hsl(155 45% 90%)',
} as const;

export const SENTIMENT_COLORS = {
  positive: 'hsl(155 50% 48%)',   // soft green
  neutral: 'hsl(220 10% 72%)',    // warm gray
  negative: 'hsl(0 55% 58%)',     // muted red
} as const;

export const ENPS_COLORS = {
  promoter: 'hsl(155 50% 48%)',
  passive: 'hsl(220 10% 78%)',
  detractor: 'hsl(0 55% 58%)',
} as const;

// Ordered palette for rankings (gradient from dark to light)
export function getRankingGradient(index: number, total: number, baseHue = 155): string {
  const lightness = 38 + (index / Math.max(total - 1, 1)) * 22;
  const saturation = 50 - (index / Math.max(total - 1, 1)) * 15;
  return `hsl(${baseHue} ${saturation}% ${lightness}%)`;
}

export type DimensionName = keyof typeof DIMENSION_COLORS;
