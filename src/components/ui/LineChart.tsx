import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ResponsiveLine, type LineSvgProps, type LineCustomSvgLayerProps, type SliceData } from '@nivo/line';
import type { LineSeries, SeriesStyleMap } from '../../lib/chartStyles';
import { CHART_HEIGHT } from '../../lib/chartStyles';
import { LineTooltip, buildSliceTooltip, TooltipContent, isGhostSeries } from './ChartTooltip';

const TOOLTIP_OFFSET = 14;
const DEFAULT_CHART_COLOR = '#0ea5e9';

const getChartMargins = (isMobile: boolean, showLegend: boolean) => {
  if (isMobile) {
    return { top: 12, right: 8, bottom: showLegend ? 100 : 28, left: 8 };
  }
  return { top: 8, right: 15, bottom: showLegend ? 44 : 24, left: 15 };
};

const getPointSize = (isMobile: boolean) => (isMobile ? 10 : 8);

const getPointBorderWidth = (isMobile: boolean) => (isMobile ? 2 : 0);

const getTickPadding = (isMobile: boolean) => (isMobile ? 10 : 8);

const abbreviateLabel = (label: string): string => {
  const monthMatch = /^([A-Z]{3})/i.exec(label);
  return monthMatch?.[1] ?? label.split(' ')[0] ?? label;
};

const buildLegendData = (
  seriesLabels: Record<string, string> | undefined,
  styleMap: SeriesStyleMap,
  defaultColor: string,
) => {
  if (!seriesLabels) return undefined;

  return Object.entries(seriesLabels)
    .filter(([id]) => !id.endsWith('_ghostAxis') && !id.endsWith('_ghostAxisCum'))
    .map(([id, label]) => ({
      id,
      label: abbreviateLabel(label),
      color: styleMap[id]?.color ?? defaultColor,
    }));
};

const buildLegendConfig = (
  showLegend: boolean,
  isMobile: boolean,
  seriesLabels: Record<string, string> | undefined,
  styleMap: SeriesStyleMap,
  defaultColor: string,
) => {
  if (!showLegend) return [];

  return [
    {
      anchor: 'bottom' as const,
      direction: 'row' as const,
      justify: false,
      translateX: 0,
      translateY: isMobile ? 50 : 46,
      itemsSpacing: isMobile ? 8 : 12,
      itemDirection: 'left-to-right' as const,
      itemWidth: isMobile ? 50 : 60,
      itemHeight: 20,
      itemOpacity: 1,
      symbolSize: 10,
      symbolShape: 'circle' as const,
      symbolBorderColor: 'rgba(0, 0, 0, .5)',
      data: buildLegendData(seriesLabels, styleMap, defaultColor),
    },
  ];
};

const getThemeConfig = (isMobile: boolean) => ({
  text: { fontSize: isMobile ? 11 : 12 },
  axis: { ticks: { text: { fill: '#94a3b8' } } },
  grid: { line: { stroke: '#e2e8f0', strokeWidth: 1, strokeDasharray: '4 4' } },
  legends: {
    text: {
      fontSize: isMobile ? 10 : 11,
      fill: '#64748b',
      fontWeight: 500,
    },
  },
});

export const buildLinesLayer = (styleMap: SeriesStyleMap) =>
  function LinesLayer({ series, lineGenerator }: LineCustomSvgLayerProps<LineSeries>) {
    return (
      <>
        {series.map(({ id, data }) => {
          const style = styleMap[id];
          const path = lineGenerator(data.map((d) => d.position));
          if (!path) return null;
          return (
            <path
              key={id}
              d={path}
              fill="none"
              stroke={style?.color}
              strokeWidth={2}
              strokeOpacity={style?.opacity ?? 1}
            />
          );
        })}
      </>
    );
  };

interface LineChartConfig {
  fmt: (v: number) => string;
  styleMap: SeriesStyleMap;
  linesLayer: ReturnType<typeof buildLinesLayer>;
  setSlice: (s: SliceData<LineSeries> | null) => void;
  seriesLabels?: Record<string, string>;
  defaultColor?: string;
  isMobile?: boolean;
  showLegend?: boolean;
}

export const buildLineChartProps = ({
  fmt,
  styleMap,
  linesLayer,
  setSlice,
  seriesLabels,
  defaultColor = DEFAULT_CHART_COLOR,
  isMobile = false,
  showLegend = false,
}: LineChartConfig): Partial<LineSvgProps<LineSeries>> => {
  const hasSeriesLabels = Boolean(seriesLabels);

  return {
    margin: getChartMargins(isMobile, showLegend),
    curve: 'monotoneX',
    enableArea: false,
    areaOpacity: 0.2,
    enableGridY: false,
    enableGridX: true,
    axisLeft: null,
    axisBottom: {
      tickSize: 0,
      tickPadding: getTickPadding(isMobile),
      tickValues: undefined,
    },
    colors: (series: { id: string }) => styleMap[series.id]?.color ?? defaultColor,
    lineWidth: 0,
    pointSize: getPointSize(isMobile),
    pointBorderWidth: getPointBorderWidth(isMobile),
    pointBorderColor: { from: 'serieColor' },
    enablePoints: true,
    useMesh: !hasSeriesLabels,
    enableSlices: hasSeriesLabels ? 'x' : false,
    sliceTooltip: hasSeriesLabels ? buildSliceTooltip(setSlice) : undefined,
    tooltip: hasSeriesLabels ? undefined : LineTooltip(fmt),
    layers: ['grid', 'markers', 'axes', 'areas', 'crosshair', linesLayer, 'points', 'slices', 'mesh', 'legends'],
    legends: buildLegendConfig(showLegend, isMobile, seriesLabels, styleMap, defaultColor),
    theme: getThemeConfig(isMobile),
  };
};

export interface MultiSeriesLineChartProps {
  data: LineSeries[];
  fmt: (v: number) => string;
  styleMap: SeriesStyleMap;
  seriesLabels?: Record<string, string>;
  defaultColor?: string;
  onSliceChange?: (slice: SliceData<LineSeries> | null) => void;
  height?: number;
  isMobile?: boolean;
  showLegend?: boolean;
}

export const MultiSeriesLineChart = ({
  data,
  fmt,
  styleMap,
  seriesLabels,
  defaultColor = DEFAULT_CHART_COLOR,
  onSliceChange,
  height = CHART_HEIGHT,
  isMobile = false,
  showLegend = false,
}: Readonly<MultiSeriesLineChartProps>) => {
  const linesLayer = useMemo(() => buildLinesLayer(styleMap), [styleMap]);
  const [slice, setSlice] = useState<SliceData<LineSeries> | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});

  const setSliceCb = useCallback(
    (s: SliceData<LineSeries> | null) => {
      setSlice(s);
      onSliceChange?.(s);
    },
    [onSliceChange],
  );

  useEffect(() => {
    return () => onSliceChange?.(null);
  }, [onSliceChange]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (tooltipRef.current) {
      const tw = tooltipRef.current.offsetWidth;
      const th = tooltipRef.current.offsetHeight;
      const spaceRight = window.innerWidth - e.clientX;
      const left = spaceRight > tw + TOOLTIP_OFFSET * 2 ? e.clientX + TOOLTIP_OFFSET : e.clientX - tw - TOOLTIP_OFFSET;
      const top = Math.min(e.clientY - th / 2, window.innerHeight - th - 8);
      setTooltipStyle({ left, top });
    }
  }, []);

  const showPortalTooltip = !onSliceChange;

  return (
    <div
      style={{ height, userSelect: 'none', WebkitUserSelect: 'none', touchAction: 'pan-x' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setSliceCb(null)}
      role="application"
      aria-label="Line chart"
    >
      <ResponsiveLine
        data={data}
        xScale={{ type: 'point' }}
        yScale={{ type: 'linear', min: 0 }}
        {...buildLineChartProps({ fmt, styleMap, linesLayer, setSlice: setSliceCb, seriesLabels, defaultColor, isMobile, showLegend })}
      />
      {showPortalTooltip &&
        slice &&
        seriesLabels &&
        slice.points.some((p) => !isGhostSeries(String(p.seriesId))) &&
        createPortal(
          <div ref={tooltipRef} className="fixed z-[9999]" style={tooltipStyle}>
            <TooltipContent
              xLabel={slice.points[0]?.data.xFormatted ?? ''}
              points={slice.points}
              fmt={fmt}
              seriesLabels={seriesLabels}
            />
          </div>,
          document.body,
        )}
    </div>
  );
};
