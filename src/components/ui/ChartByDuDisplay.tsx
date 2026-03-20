import { TrendingUp, TrendingDown } from 'lucide-react';
import type { SliceData } from '@nivo/line';
import { LINE_MIN_WIDTH_PX, type DashboardData, type ValueByDU, type LineSeries } from '../../services';
import { isGhostSeries } from './ChartTooltip';

const getPointValue = (slice: SliceData<LineSeries>, seriesIdSuffix: string): number | null => {
  const point = slice.points.find((p) => String(p.seriesId).endsWith(seriesIdSuffix));
  return point ? Number(point.data.y) : null;
};

const calculateChartMinWidth = (series: LineSeries[], fallbackLength: number): number => {
  const allX = series.flatMap((s) => s.data.map((d) => Number(String(d.x).replace('DU ', ''))));
  const validX = allX.filter((n) => !Number.isNaN(n));
  const maxDU = series.length > 0 && validX.length > 0 ? Math.max(...validX, 1) : fallbackLength;
  return maxDU * LINE_MIN_WIDTH_PX;
};

const filterAndSortPoints = (
  points: SliceData<LineSeries>['points'],
  sortFn?: (a: SliceData<LineSeries>['points'][number], b: SliceData<LineSeries>['points'][number]) => number,
) => {
  const filtered = points.filter((p) => !isGhostSeries(String(p.seriesId)));
  return sortFn ? filtered.sort(sortFn) : filtered.reverse();
};

export interface DailyDisplayState {
  chartMinWidth: number;
  selectedDU: string | null;
  selectedDailyPoints: SliceData<LineSeries>['points'] | null;
  displayDailyValue: number;
  displayDiff: number;
  displayIsPositive: boolean;
  hasPreviousDU: boolean;
}

export interface CumulativeDisplayState {
  chartMinWidth: number;
  displayCumulativeTotal: number;
  displayProjectionTotal: number;
  selectedCumulativeDU: string | null;
  selectedCumulativePoints: SliceData<LineSeries>['points'] | null;
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

  const chartMinWidth = calculateChartMinWidth(dailyDataMultiMonth, currentDailyValues.length);

  const rawSelectedDU = dailySlice?.points[0]?.data.xFormatted ?? null;
  const selectedDUNumber = rawSelectedDU === null ? null : Number.parseInt(String(rawSelectedDU), 10);
  const isCurrentMonthPoint = dailySlice?.points.some((p) => {
    const seriesId = String(p.seriesId);
    return dailyMonthOffsets[seriesId] === 0;
  }) ?? false;
  const isFutureDU =
    selectedDUNumber !== null &&
    isCurrentMonthPoint &&
    selectedDUNumber > (data.currentDU ?? Number.POSITIVE_INFINITY);
  const effectiveSlice = isFutureDU ? null : dailySlice;

  const selectedDU = effectiveSlice?.points[0]?.data.xFormatted ?? null;
  const selectedDailyPoints = effectiveSlice ? filterAndSortPoints(effectiveSlice.points) : null;
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
  const hasPreviousDU = selectedDU === null ? currentDailyValues.length >= 2 : selectedDUIndex > 0;

  return {
    chartMinWidth,
    selectedDU,
    selectedDailyPoints,
    displayDailyValue,
    displayDiff,
    displayIsPositive,
    hasPreviousDU,
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

  const chartMinWidth = calculateChartMinWidth(cumulativeDataMultiMonth, values.length);

  const selectedCumulativeDU = cumulativeSlice?.points[0]?.data.xFormatted ?? null;
  const selectedCumulativePoints = cumulativeSlice
    ? filterAndSortPoints(cumulativeSlice.points, (a, b) => {
      const aId = String(a.seriesId);
      const bId = String(b.seriesId);
      const aIsProjection = aId.endsWith('_projecao');
      const bIsProjection = bId.endsWith('_projecao');
      if (aIsProjection && !bIsProjection) return -1;
      if (!aIsProjection && bIsProjection) return 1;
      const aMonth = aId.split('_')[0] ?? '';
      const bMonth = bId.split('_')[0] ?? '';
      return bMonth.localeCompare(aMonth);
    })
    : null;
  const selectedCumulativeValue = cumulativeSlice ? getPointValue(cumulativeSlice, '_acumulado') : null;
  const selectedProjectionValue = cumulativeSlice ? getPointValue(cumulativeSlice, '_projecao') : null;
  const displayCumulativeTotal = selectedCumulativeValue ?? cumulativeTotalBase;
  const displayProjectionTotal = selectedProjectionValue ?? projectionTotalBase;

  return {
    chartMinWidth,
    displayCumulativeTotal,
    displayProjectionTotal,
    selectedCumulativeDU,
    selectedCumulativePoints,
  };
};

export const renderDailyValueLine = ({
  selectedDU,
  selectedDailyPoints,
  dailyMonthsToShow,
  fmt,
  displayDailyValue,
  displayIsPositive,
  displayDiff,
  dailySeriesLabels,
  hasPreviousDU,
}: {
  selectedDU: string | null;
  selectedDailyPoints: SliceData<LineSeries>['points'] | null;
  dailyMonthsToShow: number;
  fmt: (v: number) => string;
  displayDailyValue: number;
  displayIsPositive: boolean;
  displayDiff: number;
  dailySeriesLabels: Record<string, string>;
  hasPreviousDU: boolean;
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
      <span className="flex items-center gap-2 text-3xl font-bold tabular-nums text-ocl-primary transition-all duration-150">
        {fmt(displayDailyValue)}
      </span>
      {selectedDU && (
        <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-500">
          DU {selectedDU}
        </span>
      )}
      {hasPreviousDU && (
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
  selectedCumulativePoints,
  monthsToShow,
  cumulativeSeriesLabels,
}: {
  fmt: (v: number) => string;
  displayCumulativeTotal: number;
  selectedCumulativeDU: string | null;
  displayProjectionTotal: number;
  selectedCumulativePoints: SliceData<LineSeries>['points'] | null;
  monthsToShow: number;
  cumulativeSeriesLabels: Record<string, string>;
}) => {
  if (selectedCumulativeDU && selectedCumulativePoints && monthsToShow > 1) {
    const projecaoPoints = selectedCumulativePoints.filter((p) => String(p.seriesId).endsWith('_projecao'));
    const acumuladoPoints = selectedCumulativePoints.filter((p) => String(p.seriesId).endsWith('_acumulado'));

    const formatLabel = (point: (typeof selectedCumulativePoints)[number]) => {
      const id = String(point.seriesId);
      const rawLabel = cumulativeSeriesLabels[id] ?? id;
      return rawLabel.replace(/\s+(Acumulado|Projeção)$/u, '');
    };

    return (
      <>
        <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-500">
          DU {selectedCumulativeDU}
        </span>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {projecaoPoints.length > 0 && (
            <div className="flex flex-col gap-1">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Projeção</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {projecaoPoints.map((point) => (
                  <div key={String(point.seriesId)} className="flex items-center gap-1.5">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: point.seriesColor }} />
                    <span className="text-xs font-semibold text-slate-500">{formatLabel(point)}:</span>
                    <span className="text-sm font-bold text-ocl-primary">{fmt(Number(point.data.y))}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {acumuladoPoints.length > 0 && (
            <div className="flex flex-col gap-1">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Acumulado</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {acumuladoPoints.map((point) => (
                  <div key={String(point.seriesId)} className="flex items-center gap-1.5">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: point.seriesColor }} />
                    <span className="text-xs font-semibold text-slate-500">{formatLabel(point)}:</span>
                    <span className="text-sm font-bold text-ocl-primary">{fmt(Number(point.data.y))}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </>
    );
  }

  return (
    <>
      <span className="flex items-center gap-2 text-3xl font-bold tabular-nums text-ocl-primary transition-all duration-150">
        {fmt(displayCumulativeTotal)}
      </span>
      {selectedCumulativeDU && (
        <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-500">
          DU {selectedCumulativeDU}
        </span>
      )}
      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">
        Projeção: {fmt(displayProjectionTotal)}
      </span>
    </>
  );
};
