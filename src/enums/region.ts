export const REGIONS = ['MG', 'RJ_ES', 'SUL', 'SP', 'CO', 'NE_2', 'NO', 'NE_1', 'SU'] as const;
export type Region = (typeof REGIONS)[number];

export const REGION_LABELS: Record<string, string> = {
  MG: 'Minas Gerais',
  RJ_ES: 'RJ / ES',
  SUL: 'Sul',
  SP: 'São Paulo',
  CO: 'Centro-Oeste',
  NE_2: 'Nordeste 2',
  NO: 'Norte',
  NE_1: 'Nordeste 1',
  SU: 'Sudeste',
};
