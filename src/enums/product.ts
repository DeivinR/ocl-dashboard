export const PRODUCTS = ['cash', 'reneg', 'retomada', 'amigavel', 'judicial'] as const;
export type Product = (typeof PRODUCTS)[number];
