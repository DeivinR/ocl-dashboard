import { getValuesByBusinessDay, type DashboardData, type ValueByDU } from './data';
import { formatMonth } from '../utils';
import type { LineSeries } from './chartStyles';

const toCumulativeSeriesWithId = (values: ValueByDU[], seriesId: string): LineSeries => {
  let sum = 0;
  return {
    id: seriesId,
    data: values.map(({ du, valor }) => {
      sum += valor;
      return { x: `${du}`, y: sum };
    }),
  };
};

const toProjectionSeries = (values: ValueByDU[], totalBusinessDays: number, seriesId: string): LineSeries => {
  let sum = 0;
  return {
    id: seriesId,
    data: values.map(({ du, valor }) => {
      sum += valor;
      const projection = du > 0 ? (sum / du) * totalBusinessDays : 0;
      return { x: `${du}`, y: projection };
    }),
  };
};

export const buildDailyDataMultiMonth = (
  data: DashboardData,
  category: string,
  section: string | undefined,
  monthsToShow: number,
  currentMonthTotalDays: number,
): { series: LineSeries[]; seriesLabels: Record<string, string>; monthOffsets: Record<string, number> } => {
  const series: LineSeries[] = [];
  const seriesLabels: Record<string, string> = {};
  const monthOffsets: Record<string, number> = {};
  for (let offset = 0; offset < monthsToShow; offset++) {
    const periodIndex = data.dates.length - 1 - offset;
    if (periodIndex < 0) break;
    const periodKey = data.dates[periodIndex] ?? '';
    const values = getValuesByBusinessDay(data, category, section, offset);
    if (!values.length) continue;
    const id = `${periodKey}_diario`;
    series.push({ id, data: values.map(({ du, valor }) => ({ x: `${du}`, y: valor })) });
    seriesLabels[id] = formatMonth(periodKey);
    monthOffsets[id] = offset;

    if (offset === 0) {
      const lastDu = Math.max(...values.map((v) => v.du), 1);
      if (lastDu < currentMonthTotalDays) {
        const ghostId = `${periodKey}_ghostAxis`;
        const ghostData = [];
        for (let du = lastDu + 1; du <= currentMonthTotalDays; du++) {
          ghostData.push({ x: `${du}`, y: 0 });
        }
        series.push({ id: ghostId, data: ghostData });
      }
    }
  }
  return { series, seriesLabels, monthOffsets };
};

export const buildCumulativeDataMultiMonth = (
  data: DashboardData,
  category: string,
  section: string | undefined,
  monthsToShow: number,
  currentMonthTotalDays: number,
): { series: LineSeries[]; seriesLabels: Record<string, string>; monthOffsets: Record<string, number> } => {
  const series: LineSeries[] = [];
  const seriesLabels: Record<string, string> = {};
  const monthOffsets: Record<string, number> = {};

  const addGhostSeriesForCurrentMonth = (
    offset: number,
    periodKey: string,
    values: ValueByDU[],
    totalDaysForPeriod: number,
  ) => {
    if (offset !== 0) return;
    const lastDu = Math.max(...values.map((v) => v.du), 1);
    if (lastDu >= totalDaysForPeriod) return;
    const ghostId = `${periodKey}_ghostAxisCum`;
    const ghostData = [];
    for (let du = lastDu + 1; du <= totalDaysForPeriod; du++) {
      ghostData.push({ x: `${du}`, y: 0 });
    }
    series.push({ id: ghostId, data: ghostData });
  };

  for (let offset = 0; offset < monthsToShow; offset++) {
    const periodIndex = data.dates.length - 1 - offset;
    if (periodIndex < 0) break;
    const periodKey = data.dates[periodIndex] ?? '';
    const label = formatMonth(periodKey);
    const values = getValuesByBusinessDay(data, category, section, offset);
    if (!values.length) continue;
    const totalDaysForPeriod = offset === 0 ? currentMonthTotalDays : Math.max(...values.map((v) => v.du), 1);
    const idAcum = `${periodKey}_acumulado`;
    const idProj = `${periodKey}_projecao`;
    series.push(toCumulativeSeriesWithId(values, idAcum), toProjectionSeries(values, totalDaysForPeriod, idProj));
    seriesLabels[idAcum] = `${label} Acumulado`;
    seriesLabels[idProj] = `${label} Projeção`;
    monthOffsets[idAcum] = offset;
    monthOffsets[idProj] = offset;
    addGhostSeriesForCurrentMonth(offset, periodKey, values, totalDaysForPeriod);
  }
  return { series, seriesLabels, monthOffsets };
};
