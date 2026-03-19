import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ResponsiveLine, type LineSvgProps, type LineCustomSvgLayerProps, type SliceData } from '@nivo/line';
import type { LineSeries, SeriesStyleMap } from '../../lib/chartStyles';
import { CHART_HEIGHT } from '../../lib/chartStyles';
import { LineTooltip, buildSliceTooltip, TooltipContent, isGhostSeries } from './ChartTooltip';

const TOOLTIP_OFFSET = 14;
const DEFAULT_CHART_COLOR = '#0ea5e9';

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

export const buildLineChartProps = (
  fmt: (v: number) => string,
  styleMap: SeriesStyleMap,
  linesLayer: ReturnType<typeof buildLinesLayer>,
  setSlice: (s: SliceData<LineSeries> | null) => void,
  seriesLabels?: Record<string, string>,
  defaultColor = DEFAULT_CHART_COLOR,
  isMobile = false,
): Partial<LineSvgProps<LineSeries>> => ({
  margin: isMobile ? { top: 12, right: 8, bottom: 28, left: 8 } : { top: 8, right: 15, bottom: 24, left: 15 },
  curve: 'monotoneX',
  enableArea: false,
  areaOpacity: 0.2,
  enableGridY: false,
  enableGridX: true,
  axisLeft: null,
  axisBottom: {
    tickSize: 0,
    tickPadding: isMobile ? 10 : 8,
    tickValues: undefined,
  },
  colors: (series: { id: string }) => styleMap[series.id]?.color ?? defaultColor,
  lineWidth: 0,
  pointSize: isMobile ? 10 : 8,
  pointBorderWidth: isMobile ? 2 : 0,
  pointBorderColor: { from: 'serieColor' },
  enablePoints: true,
  useMesh: !seriesLabels,
  enableSlices: seriesLabels ? 'x' : false,
  sliceTooltip: seriesLabels ? buildSliceTooltip(setSlice, isMobile) : undefined,
  tooltip: seriesLabels ? undefined : LineTooltip(fmt),
  layers: ['grid', 'markers', 'axes', 'areas', 'crosshair', linesLayer, 'points', 'slices', 'mesh', 'legends'],
  theme: {
    text: { fontSize: isMobile ? 11 : 12 },
    axis: { ticks: { text: { fill: '#94a3b8' } } },
    grid: { line: { stroke: '#e2e8f0', strokeWidth: 1, strokeDasharray: '4 4' } },
  },
});

export interface MultiSeriesLineChartProps {
  data: LineSeries[];
  fmt: (v: number) => string;
  styleMap: SeriesStyleMap;
  seriesLabels?: Record<string, string>;
  defaultColor?: string;
  onSliceChange?: (slice: SliceData<LineSeries> | null) => void;
  height?: number;
  isMobile?: boolean;
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
      style={{ height }}
      onMouseMove={handleMouseMove}
      onMouseLeave={isMobile ? undefined : () => setSliceCb(null)}
      role="application"
      aria-label="Line chart"
    >
      <ResponsiveLine
        data={data}
        xScale={{ type: 'point' }}
        yScale={{ type: 'linear', min: 0 }}
        {...buildLineChartProps(fmt, styleMap, linesLayer, setSliceCb, seriesLabels, defaultColor, isMobile)}
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
