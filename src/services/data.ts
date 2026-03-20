import { parseCurrency, formatMonth } from '../utils';

const DEFAULT_BUSINESS_DAYS = 22;

export interface RawDataItem {
  produto: string;
  valor: number;
  ho: number;
  du: number;
  periodo: string;
  tipo: string;
  risco: string;
}

export interface DashboardData {
  rawData: RawDataItem[];
  dates: string[];
  currentDU: number;
  totalBusinessDays: number;
}

export interface HistoryItem {
  date: string;
  label: string;
  value: number;
  valueAtDU: number;
  countAtDU: number;
  isCurrent: boolean;
}

export interface KPIs {
  current: number;
  count: number;
  prev: number;
  prevCount: number;
  avg3: number;
  avg3Count: number;
  avg6: number;
  avg6Count: number;
  history: HistoryItem[];
  currentDU?: number;
  totalBusinessDays?: number;
}

export const parseStructuredCSV = (
  csvText: string,
  manualDU: string | null,
  totalDays: string | null,
): DashboardData | null => {
  const lines = csvText.split(/\r?\n/).filter((line) => line.trim() !== '');
  if (lines.length < 2) return null;

  const headers = lines[0]!.split(';').map((h) =>
    h
      .trim()
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, ''),
  );
  const colMap = {
    PRODUTO: headers.indexOf('PRODUTO'),
    REPASSE: headers.indexOf('REPASSE'),
    HO: headers.indexOf('HO'),
    DU: headers.indexOf('DU'),
    PERIODO: headers.indexOf('PERIODO'),
    TIPO: headers.indexOf('TIPO'),
    RISCO: headers.indexOf('RISCO CONTENCAO'),
  };

  if (Object.values(colMap).some((idx) => idx < 0)) {
    return null;
  }

  const rawData: RawDataItem[] = [];
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i]?.split(';');
    if (!row || row.length < headers.length) continue;
    const du = Number.parseInt(row[colMap.DU] ?? '0') || 0;
    rawData.push({
      produto: row[colMap.PRODUTO]?.trim() || 'Outros',
      valor: parseCurrency(row[colMap.REPASSE]),
      ho: parseCurrency(row[colMap.HO]),
      du,
      periodo: row[colMap.PERIODO] || '',
      tipo: row[colMap.TIPO]?.trim() || '',
      risco: row[colMap.RISCO]?.trim() || '',
    });
  }

  const uniqueDates = [...new Set(rawData.map((d) => d.periodo))].sort((a, b) => a.localeCompare(b));
  const parsedManualDU = Number.parseInt(manualDU ?? '');
  let finalDU = Number.isNaN(parsedManualDU) ? 1 : parsedManualDU;
  const parsedTotalDays = Number.parseInt(totalDays ?? '');
  const finalTotalDays = Number.isNaN(parsedTotalDays) ? DEFAULT_BUSINESS_DAYS : parsedTotalDays;

  if (!manualDU) {
    const latestDate = uniqueDates.at(-1);
    const currentMonthData = rawData.filter((d) => d.periodo === latestDate);
    finalDU = currentMonthData.reduce((max, d) => Math.max(max, d.du), 1);
  }

  return { rawData, dates: uniqueDates, currentDU: finalDU, totalBusinessDays: finalTotalDays };
};

function filterByCategory(item: RawDataItem, category: string): boolean {
  if (category === 'CONSOLIDADO') return true;
  if (category === 'CONTENÇÃO') return item.risco.trim() !== '';
  const prod = item.produto?.toUpperCase();
  if (category === 'CASH') return ['PARCIAL', 'ATUALIZAÇÃO', 'QUITAÇÃO', 'VAP'].some((p) => prod?.includes(p));
  if (category === 'RENEGOCIAÇÃO') return prod === 'RENEGOCIAÇÃO';
  if (category === 'ENTREGA AMIGÁVEL') return prod === 'ENTREGA AMIGÁVEL';
  if (category === 'APREENSÃO') return prod === 'APREENSÃO';
  if (category === 'RETOMADAS') return prod === 'ENTREGA AMIGÁVEL' || prod === 'APREENSÃO';
  return false;
}

export interface ValueByDU {
  du: number;
  valor: number;
}

function getEffectiveCurrentDU(data: DashboardData, category: string): number {
  const base = data.currentDU || 1;
  const extra = category === 'RENEGOCIAÇÃO' ? 1 : 0;
  const total = data.totalBusinessDays || DEFAULT_BUSINESS_DAYS;
  return Math.max(1, Math.min(base + extra, total));
}

function calculateProjection(accumulated: number, currentDay: number, totalDays: number): number {
  if (currentDay === 0) return 0;
  return (accumulated / currentDay) * totalDays;
}

function getValueToSum(item: RawDataItem, category: string, section?: string): number {
  if (category === 'CONTENÇÃO') return 1;
  if (
    section === 'desempenho' &&
    (category === 'ENTREGA AMIGÁVEL' || category === 'APREENSÃO' || category === 'RETOMADAS')
  )
    return 1;
  if (section === 'desempenho' && (category === 'CASH' || category === 'RENEGOCIAÇÃO')) return item.valor;
  return item.ho;
}

export const getValuesByBusinessDay = (
  data: DashboardData | null,
  category: string,
  section?: string,
  periodOffset = 0,
): ValueByDU[] => {
  if (!data?.rawData?.length || !data.dates?.length) return [];
  const { rawData, dates } = data;
  const periodIndex = dates.length - 1 - periodOffset;
  if (periodIndex < 0) return [];
  const targetDate = dates[periodIndex];
  if (!targetDate) return [];

  const maxDUInFile = Math.max(0, ...rawData.filter((d) => d.periodo === targetDate).map((d) => d.du));
  const maxDUCap = periodOffset === 0 ? getEffectiveCurrentDU(data, category) : maxDUInFile;

  const maxDU = periodOffset === 0 ? Math.min(maxDUCap, maxDUInFile) : Math.max(1, maxDUInFile);
  if (maxDU < 1) return [];

  const result: ValueByDU[] = [];
  for (let du = 1; du <= maxDU; du++) {
    const valor = rawData
      .filter((d) => d.periodo === targetDate && d.du === du && filterByCategory(d, category))
      .reduce((acc, curr) => acc + getValueToSum(curr, category, section), 0);
    result.push({ du, valor });
  }
  return result;
};

export const getAccumulatedValueAtDU = (
  data: DashboardData | null,
  category: string,
  section: string | undefined,
  targetDU: number,
): number => {
  if (!data?.rawData?.length || !data.dates?.length || targetDU < 1) return 0;
  const { rawData, dates } = data;
  const currentDate = dates.at(-1);
  if (!currentDate) return 0;
  return rawData
    .filter((d) => d.periodo === currentDate && d.du <= targetDU && filterByCategory(d, category))
    .reduce((acc, curr) => acc + getValueToSum(curr, category, section), 0);
};

export const calculateKPIs = (data: DashboardData | null, category: string, section?: string): KPIs => {
  if (!data?.rawData)
    return { current: 0, count: 0, prev: 0, prevCount: 0, avg3: 0, avg3Count: 0, avg6: 0, avg6Count: 0, history: [] };

  const { rawData, dates, totalBusinessDays } = data;
  const currentDU = getEffectiveCurrentDU(data, category);
  const n = dates.length;
  const currentDate = dates.at(-1);
  const prevDate = dates.at(-2);

  const countUntilDU = (targetDate: string | undefined, limitDU: number): number => {
    return rawData.filter((d) => d.periodo === targetDate && d.du <= limitDU && filterByCategory(d, category)).length;
  };

  const sumUntilDU = (targetDate: string | undefined, limitDU: number): number => {
    return rawData
      .filter((d) => d.periodo === targetDate && d.du <= limitDU && filterByCategory(d, category))
      .reduce((acc, curr) => acc + getValueToSum(curr, category, section), 0);
  };

  const sumTotalMonth = (targetDate: string): number => {
    return rawData
      .filter((d) => d.periodo === targetDate && filterByCategory(d, category))
      .reduce((acc, curr) => acc + getValueToSum(curr, category, section), 0);
  };

  const currentVal = sumUntilDU(currentDate, currentDU);
  const currentCount = countUntilDU(currentDate, currentDU);
  const prevVal = sumUntilDU(prevDate, currentDU);
  const prevCount = countUntilDU(prevDate, currentDU);

  const last3 = dates.slice(Math.max(0, n - 4), n - 1);
  const last6 = dates.slice(Math.max(0, n - 7), n - 1);

  const avg3Val = last3.reduce((acc, d) => acc + sumUntilDU(d, currentDU), 0) / (last3.length || 1);
  const avg3Count = last3.reduce((acc, d) => acc + countUntilDU(d, currentDU), 0) / (last3.length || 1);

  const avg6Val = last6.reduce((acc, d) => acc + sumUntilDU(d, currentDU), 0) / (last6.length || 1);
  const avg6Count = last6.reduce((acc, d) => acc + countUntilDU(d, currentDU), 0) / (last6.length || 1);

  const history: HistoryItem[] = dates
    .map((d) => {
      const isCurrent = d === currentDate;
      const totalMonthVal = sumTotalMonth(d);
      const closingValue = isCurrent
        ? calculateProjection(currentVal, currentDU, totalBusinessDays || DEFAULT_BUSINESS_DAYS)
        : totalMonthVal;

      return {
        date: d,
        label: formatMonth(d),
        value: closingValue,
        valueAtDU: sumUntilDU(d, currentDU),
        countAtDU: countUntilDU(d, currentDU),
        isCurrent,
      };
    })
    .reverse();

  return {
    current: currentVal,
    count: currentCount,
    prev: prevVal,
    prevCount,
    avg3: avg3Val,
    avg3Count,
    avg6: avg6Val,
    avg6Count,
    history,
    currentDU,
    totalBusinessDays,
  };
};
