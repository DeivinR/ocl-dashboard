export const DELAY_RANGES = [
  'Entrantes',
  'Até 90 dias',
  '91 a 180 dias',
  'Over 180 dias',
  'Prejuízo',
] as const;
export type DelayRange = (typeof DELAY_RANGES)[number];
