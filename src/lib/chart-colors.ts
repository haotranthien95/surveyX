// Shared chart color constants — single source of truth
// Maps to CSS variables in globals.css

export const DIMENSION_COLORS = {
  Credibility: 'hsl(221 83% 53%)',   // blue-600
  Respect: 'hsl(262 83% 58%)',       // violet-600
  Fairness: 'hsl(189 94% 37%)',      // cyan-600
  Pride: 'hsl(21 90% 48%)',          // orange-600
  Camaraderie: 'hsl(142 72% 29%)',   // green-600
} as const;

export const SENTIMENT_COLORS = {
  positive: 'hsl(142 72% 29%)',  // green-600
  neutral: 'hsl(37 91% 55%)',    // amber-500
  negative: 'hsl(0 84% 60%)',    // red-500
} as const;

export const ENPS_COLORS = {
  promoter: 'hsl(142 72% 29%)',
  passive: 'hsl(37 91% 55%)',
  detractor: 'hsl(0 84% 60%)',
} as const;

export type DimensionName = keyof typeof DIMENSION_COLORS;
