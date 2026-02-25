export { colors as THEME } from './colors';

export const parseCurrency = (valStr: string | number | null | undefined): number => {
  if (!valStr) return 0;
  if (typeof valStr === 'number') return valStr;
  let clean = valStr
    .toString()
    .replaceAll(/[R$\s]/g, '')
    .trim();
  if (clean.includes(',') && clean.includes('.')) {
    clean = clean.replaceAll('.', '').replaceAll(',', '.');
  } else if (clean.includes(',')) {
    clean = clean.replaceAll(',', '.');
  }
  return Number.parseFloat(clean) || 0;
};

export const formatCurrency = (val: number): string =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);

export const formatNumber = (val: number): string => new Intl.NumberFormat('pt-BR').format(Math.round(val));

export const formatMonth = (str: string | undefined | null): string => {
  if (!str) return '-';
  const [y, m] = str.split('-');
  return new Date(Number(y), Number(m) - 1).toLocaleString('pt-BR', { month: 'short', year: '2-digit' }).toUpperCase();
};
