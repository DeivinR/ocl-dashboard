export const LINE_MIN_WIDTH_PX = 36;
export const CHART_HEIGHT = 350;

export const HISTORICAL_COLOR = '#94a3b8';
export const HISTORICAL_OPACITIES = [1, 0.5];
export const PROJECTION_COLOR = '#2dd4bf';
export const PROJECTION_COLOR_HISTORICAL = '#99f6e4';

export type LineSeries = { id: string; data: { x: string; y: number }[] };

export type SeriesStyleMap = Record<string, { color: string; opacity: number }>;

export const resolveSeriesStyles = (
  seriesIds: string[],
  monthOffsets: Record<string, number>,
  currentColor: string,
): SeriesStyleMap => {
  const result: SeriesStyleMap = {};
  for (const id of seriesIds) {
    if (id.endsWith('_ghostAxis') || id.endsWith('_ghostAxisCum')) {
      result[id] = { color: 'transparent', opacity: 0 };
      continue;
    }
    const offset = monthOffsets[id] ?? 0;
    const isProjection = id.endsWith('_projecao');
    let color: string;
    if (isProjection) color = offset === 0 ? PROJECTION_COLOR : PROJECTION_COLOR_HISTORICAL;
    else color = offset === 0 ? currentColor : HISTORICAL_COLOR;
    const opacity = offset === 0 ? 1 : (HISTORICAL_OPACITIES[(offset - 1) as 0 | 1] ?? 0.5);
    result[id] = { color, opacity };
  }
  return result;
};
