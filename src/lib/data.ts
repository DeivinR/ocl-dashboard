import { parseCurrency, formatMonth } from './utils';

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

  const headers = lines[0]!.split(';').map((h) => h.trim().toUpperCase());
  const colMap = {
    PRODUTO: headers.indexOf('PRODUTO'),
    REPASSE: headers.indexOf('REPASSE'),
    HO: headers.indexOf('HO'),
    DU: headers.indexOf('DU'),
    PERIODO: headers.indexOf('PERÍODO'),
    TIPO: headers.indexOf('TIPO'),
    RISCO: headers.indexOf('RISCO CONTENÇÃO'),
  };

  const rawData: RawDataItem[] = [];
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i]!.split(';');
    if (row.length < headers.length) continue;
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
  let finalDU = manualDU ? Number.parseInt(manualDU) : 1;
  const finalTotalDays = totalDays ? Number.parseInt(totalDays) : 22;

  if (!manualDU) {
    const latestDate = uniqueDates.at(-1);
    const currentMonthData = rawData.filter((d) => d.periodo === latestDate);
    finalDU = Math.max(...currentMonthData.map((d) => d.du), 1);
  }

  return { rawData, dates: uniqueDates, currentDU: finalDU, totalBusinessDays: finalTotalDays };
};

export const calculateKPIs = (data: DashboardData | null, category: string, section?: string): KPIs => {
  if (!data?.rawData)
    return { current: 0, count: 0, prev: 0, prevCount: 0, avg3: 0, avg3Count: 0, avg6: 0, avg6Count: 0, history: [] };

  const { rawData, dates, currentDU, totalBusinessDays } = data;
  const n = dates.length;
  const currentDate = dates[n - 1];
  const prevDate = dates[n - 2];

  const filterByCategory = (item: RawDataItem): boolean => {
    if (category === 'CONSOLIDADO') return true;
    if (category === 'CONTENÇÃO') return !!item.risco && item.risco.length > 2;
    const prod = item.produto?.toUpperCase();
    if (category === 'CASH') return ['PARCIAL', 'ATUALIZAÇÃO', 'QUITAÇÃO', 'VAP'].some((p) => prod?.includes(p));
    if (category === 'RENEGOCIAÇÃO') return prod === 'RENEGOCIAÇÃO';
    if (category === 'ENTREGA AMIGÁVEL') return prod === 'ENTREGA AMIGÁVEL';
    if (category === 'APREENSÃO') return prod === 'APREENSÃO';
    if (category === 'RETOMADAS') return prod === 'ENTREGA AMIGÁVEL' || prod === 'APREENSÃO';
    return false;
  };

  const getValueToSum = (item: RawDataItem): number => {
    if (category === 'CONTENÇÃO') return 1;
    if (
      section === 'desempenho' &&
      (category === 'ENTREGA AMIGÁVEL' || category === 'APREENSÃO' || category === 'RETOMADAS')
    )
      return 1;
    if (section === 'desempenho' && (category === 'CASH' || category === 'RENEGOCIAÇÃO')) return item.valor;
    return item.ho;
  };

  const countUntilDU = (targetDate: string | undefined, limitDU: number): number => {
    return rawData.filter((d) => d.periodo === targetDate && d.du <= limitDU && filterByCategory(d)).length;
  };

  const sumUntilDU = (targetDate: string | undefined, limitDU: number): number => {
    return rawData
      .filter((d) => d.periodo === targetDate && d.du <= limitDU && filterByCategory(d))
      .reduce((acc, curr) => acc + getValueToSum(curr), 0);
  };

  const sumTotalMonth = (targetDate: string): number => {
    return rawData
      .filter((d) => d.periodo === targetDate && filterByCategory(d))
      .reduce((acc, curr) => acc + getValueToSum(curr), 0);
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

  const calculateProjection = (accumulated: number, currentDay: number, totalDays: number): number => {
    if (currentDay === 0) return 0;
    return (accumulated / currentDay) * totalDays;
  };

  const history: HistoryItem[] = dates
    .map((d) => {
      const isCurrent = d === currentDate;
      const totalMonthVal = sumTotalMonth(d);
      const closingValue = isCurrent
        ? calculateProjection(currentVal, currentDU, totalBusinessDays || 22)
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
