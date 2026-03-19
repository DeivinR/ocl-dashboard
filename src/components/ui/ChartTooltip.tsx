import { useEffect } from 'react';
import { type Point, type SliceData } from '@nivo/line';
import type { LineSeries } from '../../lib/chartStyles';

export const isGhostSeries = (seriesId: string) =>
  seriesId.endsWith('_ghostAxis') || seriesId.endsWith('_ghostAxisCum');

export const LineTooltip =
  (fmt: (v: number) => string) =>
  ({ point }: { point: Point<LineSeries> }) => {
    const seriesId = String((point as unknown as { serieId?: string }).serieId ?? '');
    const value = Number(point.data.y);
    if (isGhostSeries(seriesId) || value === 0) return null;
    return (
      <div className="rounded-lg border border-slate-100 bg-white px-3 py-2 text-xs shadow-lg">
        <p className="whitespace-nowrap font-semibold text-slate-500">DU {point.data.xFormatted}</p>
        <p className="text-base font-bold text-ocl-primary">{fmt(value)}</p>
      </div>
    );
  };

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
      {(() => {
        const visiblePoints = [...points].filter((p) => !isGhostSeries(String(p.seriesId)));
        const hasCumulativeSeries = visiblePoints.some((p) => {
          const id = String(p.seriesId);
          return id.endsWith('_acumulado') || id.endsWith('_projecao');
        });

        const sortByMonthAndType = (a: (typeof visiblePoints)[number], b: (typeof visiblePoints)[number]) => {
          const aId = String(a.seriesId);
          const bId = String(b.seriesId);
          const aMonth = aId.split('_')[0] ?? '';
          const bMonth = bId.split('_')[0] ?? '';
          if (aMonth !== bMonth) return bMonth.localeCompare(aMonth);
          const aIsProjection = aId.endsWith('_projecao');
          const bIsProjection = bId.endsWith('_projecao');
          if (aIsProjection && !bIsProjection) return -1;
          if (!aIsProjection && bIsProjection) return 1;
          return 0;
        };

        const formatLabel = (point: (typeof visiblePoints)[number]) => {
          const id = String(point.seriesId);
          const rawLabel = seriesLabels[id] ?? id;
          if (hasCumulativeSeries && (id.endsWith('_acumulado') || id.endsWith('_projecao'))) {
            return rawLabel.replace(/\s+(Acumulado|Projeção)$/u, '');
          }
          return rawLabel;
        };

        if (!hasCumulativeSeries) {
          const sortedVisible = [...visiblePoints].sort(sortByMonthAndType);
          return sortedVisible.map((point) => (
            <div key={String(point.seriesId)} className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-1.5">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: point.seriesColor }} />
                <span className="truncate text-[11px] text-slate-500">{formatLabel(point)}</span>
              </div>
              <span className="text-xs font-bold tabular-nums text-ocl-primary">{fmt(Number(point.data.y))}</span>
            </div>
          ));
        }

        const projecaoPoints = [...visiblePoints]
          .filter((p) => String(p.seriesId).endsWith('_projecao'))
          .sort(sortByMonthAndType);
        const acumuladoPoints = [...visiblePoints]
          .filter((p) => String(p.seriesId).endsWith('_acumulado'))
          .sort(sortByMonthAndType);

        return (
          <>
            {projecaoPoints.length > 0 && (
              <div className="space-y-1">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Projeção</p>
                {projecaoPoints.map((point) => (
                  <div key={String(point.seriesId)} className="flex items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-1.5">
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: point.seriesColor }}
                      />
                      <span className="truncate text-[11px] text-slate-500">{formatLabel(point)}</span>
                    </div>
                    <span className="text-xs font-bold tabular-nums text-ocl-primary">{fmt(Number(point.data.y))}</span>
                  </div>
                ))}
              </div>
            )}

            {acumuladoPoints.length > 0 && (
              <div className="space-y-1">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Acumulado</p>
                {acumuladoPoints.map((point) => (
                  <div key={String(point.seriesId)} className="flex items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-1.5">
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: point.seriesColor }}
                      />
                      <span className="truncate text-[11px] text-slate-500">{formatLabel(point)}</span>
                    </div>
                    <span className="text-xs font-bold tabular-nums text-ocl-primary">{fmt(Number(point.data.y))}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        );
      })()}
    </div>
  </div>
);

export const buildSliceTooltip =
  (setSlice: (s: SliceData<LineSeries> | null) => void, isMobile = false) =>
  ({ slice }: { slice: SliceData<LineSeries> }) => {
    useEffect(() => {
      setSlice(slice);
      return () => {
        if (!isMobile) {
          setSlice(null);
        }
      };
    }, [slice]);
    return null;
  };
