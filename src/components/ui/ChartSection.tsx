import { useEffect, useRef, type ReactNode } from 'react';
import { Card } from './Card';
import { PeriodSelect, type MonthsToShow } from './PeriodSelect';

interface ChartSectionProps {
  title: string;
  icon: ReactNode;
  valueLine: ReactNode;
  periodValue: MonthsToShow;
  onPeriodChange: (value: MonthsToShow) => void;
  chartMinWidth: number;
  isMobile: boolean;
  children: ReactNode;
  currentDU?: number;
}

export const ChartSection = ({
  title,
  icon,
  valueLine,
  periodValue,
  onPeriodChange,
  chartMinWidth,
  isMobile,
  children,
  currentDU,
}: Readonly<ChartSectionProps>) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isMobile && scrollContainerRef.current && currentDU && chartMinWidth > 0) {
      const container = scrollContainerRef.current;
      const scrollWidth = container.scrollWidth;
      const containerWidth = container.clientWidth;
      const scrollableWidth = scrollWidth - containerWidth;

      const scrollPosition = (scrollableWidth * currentDU) / chartMinWidth - containerWidth / 2;
      container.scrollLeft = Math.max(0, scrollPosition);
    }
  }, [isMobile, currentDU, chartMinWidth]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
        </div>
        <PeriodSelect value={periodValue} onChange={onPeriodChange} />
      </div>
      <Card className="border-0 p-6 shadow-md">
        <div className="mb-3 flex flex-wrap items-end gap-x-4 gap-y-1">{valueLine}</div>
        <div ref={scrollContainerRef} className={isMobile ? 'overflow-x-auto overflow-y-visible' : ''}>
          <div style={isMobile ? { minWidth: chartMinWidth } : undefined}>{children}</div>
        </div>
      </Card>
    </div>
  );
};
