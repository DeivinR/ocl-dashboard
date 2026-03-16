import type { ChangeEvent } from 'react';
import { ChevronDown } from 'lucide-react';

export const CUMULATIVE_MONTH_OPTIONS = [1, 2, 3] as const;
export type MonthsToShow = (typeof CUMULATIVE_MONTH_OPTIONS)[number];

interface PeriodSelectProps {
  value: MonthsToShow;
  onChange: (value: MonthsToShow) => void;
}

export const PeriodSelect = ({ value, onChange }: Readonly<PeriodSelectProps>) => {
  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    onChange(Number(e.target.value) as MonthsToShow);
  };

  return (
    <label className="group flex items-center gap-2 text-xs font-medium text-slate-500">
      <span className="uppercase tracking-wide text-slate-400">Período</span>
      <div className="relative">
        <select
          value={value}
          onChange={handleChange}
          className="cursor-pointer appearance-none rounded-lg border border-slate-200 bg-white py-1.5 pl-3 pr-8 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:shadow-md focus:border-ocl-primary focus:outline-none focus:ring-2 focus:ring-ocl-primary/10"
        >
          {CUMULATIVE_MONTH_OPTIONS.map((n) => (
            <option key={n} value={n}>
              Últimos {n} {n === 1 ? 'mês' : 'meses'}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400 group-hover:text-slate-600">
          <ChevronDown className="h-3 w-3" />
        </div>
      </div>
    </label>
  );
};

