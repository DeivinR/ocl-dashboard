import { useState, useMemo } from 'react';
import { BarChart3, Layers } from 'lucide-react';
import { getValuesByBusinessDay, type DashboardData } from '../lib/data';
import { formatCurrency, formatNumber } from '../lib/utils';
import { resolveSeriesStyles } from '../lib/chartStyles';
import { colors } from '../lib/colors';
import { MultiSeriesLineChart } from './ui/LineChart';
import { ChartSection } from './ui/ChartSection';
import type { MonthsToShow } from './ui/PeriodSelect';
import { buildDailyDataMultiMonth, buildCumulativeDataMultiMonth } from '../lib/chartByDuData';
import { useIsMobile } from '../hooks/useIsMobile';
import { useDebouncedSlice } from '../hooks/useDebouncedSlice';
import {
  buildDailyDisplayState,
  buildCumulativeDisplayState,
  renderDailyValueLine,
  renderCumulativeValueLine,
} from './ui/ChartByDuDisplay';

interface ChartByDUProps {
  data: DashboardData;
  category: string;
  section?: string;
  valueType?: 'currency' | 'number';
}

export const ChartByDU = ({ data, category, section, valueType = 'currency' }: Readonly<ChartByDUProps>) => {
  const isMobile = useIsMobile();
  const values = useMemo(() => getValuesByBusinessDay(data, category, section), [data, category, section]);
  const [dailyMonthsToShow, setDailyMonthsToShow] = useState<MonthsToShow>(1);
  const [monthsToShow, setMonthsToShow] = useState<MonthsToShow>(1);
  const { slice: dailySlice, handleSliceChange: handleDailySliceChange } = useDebouncedSlice(isMobile);
  const { slice: cumulativeSlice, handleSliceChange: handleCumulativeSliceChange } = useDebouncedSlice(isMobile);

  const totalDays = data.totalBusinessDays ?? 22;
  const fmt = valueType === 'number' ? formatNumber : formatCurrency;

  const {
    series: dailyDataMultiMonth,
    seriesLabels: dailySeriesLabels,
    monthOffsets: dailyMonthOffsets,
  } = useMemo(
    () => buildDailyDataMultiMonth(data, category, section, dailyMonthsToShow, totalDays),
    [data, category, section, dailyMonthsToShow, totalDays],
  );

  const dailyStyleMap = useMemo(
    () =>
      resolveSeriesStyles(
        dailyDataMultiMonth.map((s) => s.id),
        dailyMonthOffsets,
        colors.ocl.primary,
      ),
    [dailyDataMultiMonth, dailyMonthOffsets],
  );

  const currentDailyValues = useMemo(
    () => getValuesByBusinessDay(data, category, section, 0),
    [data, category, section],
  );

  const {
    series: cumulativeDataMultiMonth,
    seriesLabels: cumulativeSeriesLabels,
    monthOffsets: cumulativeMonthOffsets,
  } = useMemo(
    () => buildCumulativeDataMultiMonth(data, category, section, monthsToShow, totalDays),
    [data, category, section, monthsToShow, totalDays],
  );

  const cumulativeStyleMap = useMemo(
    () =>
      resolveSeriesStyles(
        cumulativeDataMultiMonth.map((s) => s.id),
        cumulativeMonthOffsets,
        colors.ocl.primary,
      ),
    [cumulativeDataMultiMonth, cumulativeMonthOffsets],
  );


  const {
    chartMinWidth: chartMinWidthDaily,
    selectedDU,
    selectedDailyPoints,
    displayDailyValue,
    displayDiff,
    displayIsPositive,
    hasPreviousDU,
  } = useMemo(
    () =>
      buildDailyDisplayState({
        data,
        dailyDataMultiMonth,
        dailyMonthOffsets,
        currentDailyValues,
        dailySlice,
      }),
    [data, dailyDataMultiMonth, dailyMonthOffsets, currentDailyValues, dailySlice],
  );

  const {
    chartMinWidth: chartMinWidthCumulative,
    displayCumulativeTotal,
    displayProjectionTotal,
    selectedCumulativeDU,
    selectedCumulativePoints,
  } = useMemo(
    () =>
      buildCumulativeDisplayState({
        data,
        values,
        cumulativeDataMultiMonth,
        cumulativeSlice,
      }),
    [data, values, cumulativeDataMultiMonth, cumulativeSlice],
  );

  if (!values.length) return null;

  return (
    <div className="animate-fade-in mb-8 space-y-8">
      <ChartSection
        title="Evolução Diária por DU"
        icon={<BarChart3 size={20} className="text-ocl-primary" />}
        valueLine={renderDailyValueLine({
          selectedDU,
          selectedDailyPoints,
          dailyMonthsToShow,
          fmt,
          displayDailyValue,
          displayIsPositive,
          displayDiff,
          dailySeriesLabels,
          hasPreviousDU,
        })}
        periodValue={dailyMonthsToShow}
        onPeriodChange={setDailyMonthsToShow}
        chartMinWidth={chartMinWidthDaily}
        isMobile={isMobile}
      >
        <MultiSeriesLineChart
          data={dailyDataMultiMonth}
          fmt={fmt}
          styleMap={dailyStyleMap}
          seriesLabels={dailyMonthsToShow > 1 || isMobile ? dailySeriesLabels : undefined}
          defaultColor={colors.ocl.primary}
          onSliceChange={isMobile ? handleDailySliceChange : undefined}
          height={isMobile ? 320 : undefined}
          isMobile={isMobile}
          showLegend={dailyMonthsToShow > 1 && !isMobile}
        />
      </ChartSection>

      <ChartSection
        title="Acumulado por DU"
        icon={<Layers size={20} className="text-ocl-primary" />}
        valueLine={renderCumulativeValueLine({
          fmt,
          displayCumulativeTotal,
          selectedCumulativeDU,
          displayProjectionTotal,
          selectedCumulativePoints,
          monthsToShow,
          cumulativeSeriesLabels,
        })}
        periodValue={monthsToShow}
        onPeriodChange={setMonthsToShow}
        chartMinWidth={chartMinWidthCumulative}
        isMobile={isMobile}
      >
        <MultiSeriesLineChart
          data={cumulativeDataMultiMonth}
          fmt={fmt}
          styleMap={cumulativeStyleMap}
          seriesLabels={cumulativeSeriesLabels}
          defaultColor={colors.ocl.primary}
          onSliceChange={isMobile ? handleCumulativeSliceChange : undefined}
          height={isMobile ? 320 : undefined}
          isMobile={isMobile}
          showLegend={monthsToShow > 1 && !isMobile}
        />
      </ChartSection>
    </div>
  );
};
