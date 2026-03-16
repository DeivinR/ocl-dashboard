import { TrendingUp, TrendingDown } from 'lucide-react';
import type { SliceData } from '@nivo/line';
import type { DashboardData, ValueByDU } from '../../lib/data';
import { LINE_MIN_WIDTH_PX, type LineSeries } from '../../lib/chartStyles';
import { isGhostSeries } from './ChartTooltip';

const getPointValue = (slice: SliceData<LineSeries>, seriesIdSuffix: string): number | null => {
  const point = slice.points.find((p) => String(p.seriesId).endsWith(seriesIdSuffix));
  return point ? Number(point.data.y) : null;
};

export interface DailyDisplayState {
  chartMinWidth: number;
  selectedDU: string | null;
  selectedDailyPoints: SliceData<LineSeries>['points'] | null;
  displayDailyValue: number;
  displayDiff: number;
  displayIsPositive: boolean;
}

export interface CumulativeDisplayState {
  chartMinWidth: number;
  displayCumulativeTotal: number;
  displayProjectionTotal: number;
  selectedCumulativeDU: string | null;
}

export const buildDailyDisplayState = ({
  data,
  dailyDataMultiMonth,
  dailyMonthOffsets,
  currentDailyValues,
  dailySlice,
}: {
  data: DashboardData;
  dailyDataMultiMonth: LineSeries[];
  dailyMonthOffsets: Record<string, number>;
  currentDailyValues: ValueByDU[];
  dailySlice: SliceData<LineSeries> | null;
}): DailyDisplayState => {
  const lastDUValue = currentDailyValues.at(-1)?.valor ?? 0;
  const prevDUValue = currentDailyValues.length >= 2 ? (currentDailyValues.at(-2)?.valor ?? 0) : 0;
  const baseDiff = lastDUValue - prevDUValue;

  const allDailyX = dailyDataMultiMonth.flatMap((s) => s.data.map((d) => Number(d.x)));
  const validDailyX = allDailyX.filter((n) => !Number.isNaN(n));
  const maxDUDaily =
    dailyDataMultiMonth.length > 0 && validDailyX.length > 0 ? Math.max(...validDailyX, 1) : currentDailyValues.length;
  const chartMinWidth = maxDUDaily * LINE_MIN_WIDTH_PX;

  const rawSelectedDU = dailySlice?.points[0]?.data.xFormatted ?? null;
  const isFutureDU =
    rawSelectedDU !== null && Number.parseInt(String(rawSelectedDU), 10) > (data.currentDU ?? Number.POSITIVE_INFINITY);
  const effectiveSlice = isFutureDU ? null : dailySlice;

  const selectedDU = effectiveSlice?.points[0]?.data.xFormatted ?? null;
  const selectedDailyPoints = effectiveSlice
    ? [...effectiveSlice.points].filter((p) => !isGhostSeries(String(p.seriesId))).reverse()
    : null;
  const selectedDailyValue = effectiveSlice ? getPointValue(effectiveSlice, '_diario') : null;
  const displayDailyValue = selectedDailyValue ?? lastDUValue;

  const currentMonthKey = data.dates.at(-1) ?? '';
  const currentMonthDailySeries = dailyDataMultiMonth.find(
    (s) => s.id === `${currentMonthKey}_diario` || (s.id.endsWith('_diario') && dailyMonthOffsets[s.id] === 0),
  );
  const selectedDUIndex =
    selectedDU !== null && currentMonthDailySeries
      ? currentMonthDailySeries.data.findIndex((d) => String(d.x) === String(selectedDU))
      : -1;
  const prevSelectedValue =
    selectedDUIndex > 0 ? (currentMonthDailySeries?.data[selectedDUIndex - 1]?.y ?? null) : null;
  const displayDiff =
    selectedDailyValue !== null && prevSelectedValue !== null ? selectedDailyValue - prevSelectedValue : baseDiff;
  const displayIsPositive = displayDiff >= 0;

  return {
    chartMinWidth,
    selectedDU,
    selectedDailyPoints,
    displayDailyValue,
    displayDiff,
    displayIsPositive,
  };
};

export const buildCumulativeDisplayState = ({
  data,
  values,
  cumulativeDataMultiMonth,
  cumulativeSlice,
}: {
  data: DashboardData;
  values: ValueByDU[];
  cumulativeDataMultiMonth: LineSeries[];
  cumulativeSlice: SliceData<LineSeries> | null;
}): CumulativeDisplayState => {
  const currentMonthKey = data.dates.at(-1) ?? '';
  const currentMonthCumulativeSeries = cumulativeDataMultiMonth.find((s) => s.id === `${currentMonthKey}_acumulado`);
  const currentMonthProjectionSeries = cumulativeDataMultiMonth.find((s) => s.id === `${currentMonthKey}_projecao`);
  const cumulativeTotalBase = currentMonthCumulativeSeries?.data.at(-1)?.y ?? 0;
  const projectionTotalBase = currentMonthProjectionSeries?.data.at(-1)?.y ?? 0;

  const allCumulativeX = cumulativeDataMultiMonth.flatMap((s) =>
    s.data.map((d) => Number(String(d.x).replace('DU ', ''))),
  );
  const validCumulativeX = allCumulativeX.filter((n) => !Number.isNaN(n));
  const maxDUCumulative =
    cumulativeDataMultiMonth.length > 0 && validCumulativeX.length > 0
      ? Math.max(...validCumulativeX, 1)
      : values.length;
  const chartMinWidth = maxDUCumulative * LINE_MIN_WIDTH_PX;

  const selectedCumulativeDU = cumulativeSlice?.points[0]?.data.xFormatted ?? null;
  const selectedCumulativeValue = cumulativeSlice ? getPointValue(cumulativeSlice, '_acumulado') : null;
  const selectedProjectionValue = cumulativeSlice ? getPointValue(cumulativeSlice, '_projecao') : null;
  const displayCumulativeTotal = selectedCumulativeValue ?? cumulativeTotalBase;
  const displayProjectionTotal = selectedProjectionValue ?? projectionTotalBase;

  return {
    chartMinWidth,
    displayCumulativeTotal,
    displayProjectionTotal,
    selectedCumulativeDU,
  };
};

export const renderDailyValueLine = ({
  selectedDU,
  selectedDailyPoints,
  dailyMonthsToShow,
  fmt,
  displayDailyValue,
  currentDailyLength,
  displayIsPositive,
  displayDiff,
  dailySeriesLabels,
}: {
  selectedDU: string | null;
  selectedDailyPoints: SliceData<LineSeries>['points'] | null;
  dailyMonthsToShow: number;
  fmt: (v: number) => string;
  displayDailyValue: number;
  currentDailyLength: number;
  displayIsPositive: boolean;
  displayDiff: number;
  dailySeriesLabels: Record<string, string>;
}) => {
  if (selectedDU && selectedDailyPoints && dailyMonthsToShow > 1) {
    return (
      <>
        <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-500">
          DU {selectedDU}
        </span>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {selectedDailyPoints.map((point) => (
            <div key={String(point.seriesId)} className="flex items-center gap-1.5">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: point.seriesColor }} />
              <span className="text-xs font-semibold text-slate-500">
                {dailySeriesLabels[String(point.seriesId)] ?? point.seriesId}:
              </span>
              <span className="text-sm font-bold text-ocl-primary">{fmt(Number(point.data.y))}</span>
            </div>
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <span className="flex items-center gap-2 text-3xl font-bold text-ocl-primary tabular-nums transition-all duration-150">
        {fmt(displayDailyValue)}
      </span>
      {selectedDU && (
        <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-500">
          DU {selectedDU}
        </span>
      )}
      {currentDailyLength >= 2 && (
        <span
          className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold ${displayIsPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}
        >
          {displayIsPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {fmt(Math.abs(displayDiff))} vs DU anterior
        </span>
      )}
    </>
  );
};

export const renderCumulativeValueLine = ({
  fmt,
  displayCumulativeTotal,
  selectedCumulativeDU,
  displayProjectionTotal,
}: {
  fmt: (v: number) => string;
  displayCumulativeTotal: number;
  selectedCumulativeDU: string | null;
  displayProjectionTotal: number;
}) => (
  <>
    <span className="flex items-center gap-2 text-3xl font-bold text-ocl-primary tabular-nums transition-all duration-150">
      {fmt(displayCumulativeTotal)}
    </span>
    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">
      {selectedCumulativeDU ? `DU ${selectedCumulativeDU} · ` : ''}
      Projeção: {fmt(displayProjectionTotal)}
    </span>
  </>
);
