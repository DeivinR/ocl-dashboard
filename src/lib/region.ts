import { REGION_LABELS } from '../enums';

export function regionLabel(region: string | null): string {
  if (!region) return '–';
  return REGION_LABELS[region] ?? region;
}
