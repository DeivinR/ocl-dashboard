import { useEffect } from 'react';
import { type Point, type SliceData } from '@nivo/line';
import type { LineSeries } from '../../lib/chartStyles';

export const isGhostSeries = (seriesId: string) =>
  seriesId.endsWith('_ghostAxis') || seriesId.endsWith('_ghostAxisCum');

export const LineTooltip =
  (fmt: (v: number) => string) =>
  ({ point }: { point: Point<LineSeries> }) => (
    <div className="rounded-lg border border-slate-100 bg-white px-3 py-2 text-xs shadow-lg">
      <p className="whitespace-nowrap font-semibold text-slate-500">DU {point.data.xFormatted}</p>
      <p className="text-base font-bold text-ocl-primary">{fmt(Number(point.data.y))}</p>
    </div>
  );

export const TooltipContent = ({
  xLabel,
  points,
  fmt,
  seriesLabels,
}: {
  xLabel: string;
  points: SliceData<LineSeries>['points'];
  fmt: (v: number) => string;
  seriesLabels: Record<string, string>;
}) => (
  <div
    className="rounded-xl border border-slate-100 bg-white shadow-xl"
    style={{ minWidth: 160, pointerEvents: 'none' }}
  >
    <div className="border-b border-slate-100 px-3 py-2">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">DU {xLabel}</p>
    </div>
    <div className="space-y-2 px-3 py-2">
      {[...points]
        .filter((p) => !isGhostSeries(String(p.seriesId)))
        .reverse()
        .map((point) => (
          <div key={String(point.seriesId)} className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-1.5">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: point.seriesColor }} />
              <span className="truncate text-[11px] text-slate-500">
                {seriesLabels[String(point.seriesId)] ?? point.seriesId}
              </span>
            </div>
            <span className="text-xs font-bold tabular-nums text-ocl-primary">{fmt(Number(point.data.y))}</span>
          </div>
        ))}
    </div>
  </div>
);

export const buildSliceTooltip =
  (setSlice: (s: SliceData<LineSeries> | null) => void) =>
  ({ slice }: { slice: SliceData<LineSeries> }) => {
    useEffect(() => {
      setSlice(slice);
      return () => setSlice(null);
    }, [slice]);
    return null;
  };
