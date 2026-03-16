import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency, formatNumber } from '../../lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export const Card = ({ children, className = '' }: Readonly<CardProps>) => (
  <div
    className={`flex flex-col justify-between rounded-2xl border border-slate-100 bg-white shadow-[0_2px_10px_-3px_rgba(0,51,102,0.1)] transition-all duration-300 ${className}`}
  >
    {children}
  </div>
);

interface MetricCardProps {
  title: string;
  value: number;
  type?: 'currency' | 'number';
  comparison: number | null;
  icon?: LucideIcon;
  subtext: string;
}

export const MetricCard = ({
  title,
  value,
  type = 'currency',
  comparison,
  icon: Icon,
  subtext,
}: Readonly<MetricCardProps>) => {
  const isPositive = (comparison ?? 0) >= 0;
  const format = type === 'currency' ? formatCurrency : formatNumber;
  return (
    <Card className="group relative h-full overflow-hidden p-6 hover:shadow-lg">
      <div className="absolute right-0 top-0 p-4 opacity-5 transition-opacity group-hover:opacity-10">
        {Icon && <Icon size={80} color="#003366" />}
      </div>
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">{title}</p>
        <h3 className="text-2xl font-bold text-ocl-primary md:text-3xl">{format(value)}</h3>
      </div>
      <div className="mt-4 flex items-end justify-between border-t border-slate-50/50 pt-2">
        <div className="flex max-w-[60%] items-center gap-1 text-xs font-medium text-slate-400">{subtext}</div>
        <div
          className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold ${isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}
        >
          {comparison !== null && (
            <>
              {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />} {Math.abs(comparison).toFixed(1)}%
            </>
          )}
        </div>
      </div>
    </Card>
  );
};
