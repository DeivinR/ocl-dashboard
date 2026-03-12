import { useState, useMemo, useRef, useEffect } from 'react';
import { Wallet, Handshake, Car, Gavel, FileText, Target, Database, Calendar, Filter, Activity, TrendingUp, ChevronDown } from 'lucide-react';
import type { GetToken } from '../api/client';
import { useGoals } from '../hooks/useGoals';
import { useClickOutside } from '../hooks/useClickOutside';
import { formatNumber, formatMonth } from '../lib/utils';
import { isCurrentMonth, monthsAgoISO } from '../lib/date';
import { regionLabel } from '../lib/region';
import { computeMetrics } from '../lib/goals';
import { Card, MetricCard } from './ui/Card';
import { GoalsDashboardSkeleton } from './ui/Skeleton';

const PERIOD_OPTIONS = [
  { label: '3 meses', months: 3 },
  { label: '6 meses', months: 6 },
  { label: '12 meses', months: 12 },
  { label: '24 meses', months: 24 },
] as const;

interface GoalsDashboardProps {
  getToken: GetToken;
  activeTab: string;
  categoryLabel?: string;
}

const PRODUCT_ICONS: Record<string, typeof Wallet> = {
  cash: Wallet,
  reneg: Handshake,
  retomada: FileText,
  amigavel: Car,
  judicial: Gavel,
};

const PAGE_SIZE = 50;

export const GoalsDashboard = ({ getToken, activeTab, categoryLabel }: Readonly<GoalsDashboardProps>) => {
  const [selectedMonths, setSelectedMonths] = useState(6);
  const [filterOpen, setFilterOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const filterRef = useRef<HTMLDivElement>(null);
  const periodFrom = useMemo(() => monthsAgoISO(selectedMonths), [selectedMonths]);
  const { goals, loading, error } = useGoals(getToken, activeTab, periodFrom);
  const Icon = PRODUCT_ICONS[activeTab] ?? Target;

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [activeTab, selectedMonths]);

  useClickOutside(filterRef, () => setFilterOpen(false), filterOpen);

  const visibleGoals = useMemo(() => goals.slice(0, visibleCount), [goals, visibleCount]);
  const hasMore = visibleCount < goals.length;

  const metrics = useMemo(() => computeMetrics(goals), [goals]);

  const tableContent = (() => {
    if (loading) return <GoalsDashboardSkeleton />;
    if (error) {
      return (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700">{error}</div>
      );
    }
    if (goals.length === 0) {
      return (
        <Card className="p-12 text-center text-slate-500">Nenhuma meta encontrada para este produto.</Card>
      );
    }
    return null;
  })();

  return (
    <div className="mx-auto max-w-6xl pb-20 md:pb-0">
      <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-ocl-primary to-ocl-secondary p-6 text-white shadow-xl md:p-10">
        <div className="relative z-10 flex flex-col items-center justify-between gap-6 text-center md:flex-row md:items-end md:text-left">
          <div className="w-full flex-1 md:w-auto">
            <div className="mb-2 flex items-center justify-center gap-2 opacity-80 md:justify-start">
              <Icon size={20} />
              <span className="text-sm font-semibold uppercase tracking-widest">{categoryLabel ?? activeTab}</span>
            </div>
            <h1 className="mb-2 text-4xl font-bold md:text-5xl">{formatNumber(metrics.currentTotal)}</h1>
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
              <div className="inline-flex items-center justify-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm backdrop-blur-sm">
                <Target size={14} /> <span>Meta total do mês atual</span>
              </div>
              <div className="inline-flex items-center justify-center gap-2 rounded-full bg-black/20 px-4 py-1.5 text-xs font-medium text-white/90 backdrop-blur-sm">
                <span>{metrics.regionCount} regiões</span>
              </div>
            </div>
          </div>
          <div className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur-sm md:w-auto md:min-w-[200px] md:text-right">
            <p className="mb-1 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-white/70 md:justify-end">
              <TrendingUp size={14} /> Mês Anterior
            </p>
            <h2 className="text-3xl font-bold text-white">{formatNumber(metrics.prevTotal)}</h2>
            <p className="mt-1 text-[10px] text-white/50">
              {metrics.varPrev >= 0 ? '+' : ''}{metrics.varPrev.toFixed(1)}% vs. anterior
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 right-0 top-0 w-1/3 translate-x-10 skew-x-12 transform bg-white/5" />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <MetricCard
          title="Meta mês atual"
          value={metrics.currentTotal}
          comparison={metrics.varPrev}
          type="number"
          icon={Target}
          subtext={`${metrics.regionCount} regiões`}
        />
        <MetricCard
          title="vs. Mês Anterior"
          value={metrics.prevTotal}
          comparison={metrics.varPrev}
          type="number"
          icon={Activity}
          subtext={metrics.prevTotal > 0 ? `Total: ${formatNumber(metrics.prevTotal)}` : 'Sem dados'}
        />
        <MetricCard
          title="vs. Média do Período"
          value={Math.round(metrics.avgTotal)}
          comparison={metrics.varAvg}
          type="number"
          icon={Activity}
          subtext={`Média: ${formatNumber(Math.round(metrics.avgTotal))}`}
        />
      </div>

      {tableContent ?? (
        <div className="animate-fade-in mt-8">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database size={20} className="text-ocl-primary" />
              <h3 className="text-lg font-bold text-slate-800">Metas por região e faixa</h3>
            </div>
            <div ref={filterRef} className="relative">
              <button
                type="button"
                onClick={() => setFilterOpen((o) => !o)}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition-colors hover:bg-slate-50"
              >
                <Filter size={14} />
                {PERIOD_OPTIONS.find((o) => o.months === selectedMonths)?.label}
                <ChevronDown size={14} className={`transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
              </button>
              {filterOpen && (
                <div className="absolute right-0 z-20 mt-1 min-w-[140px] rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg">
                  {PERIOD_OPTIONS.map((opt) => (
                    <button
                      key={opt.months}
                      type="button"
                      onClick={() => {
                        setSelectedMonths(opt.months);
                        setFilterOpen(false);
                      }}
                      className={`flex w-full items-center rounded-md px-3 py-1.5 text-left text-sm transition-colors ${
                        selectedMonths === opt.months
                          ? 'bg-ocl-primary/10 font-semibold text-ocl-primary'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <Card className="overflow-hidden border-0 shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[320px] table-fixed text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-xs uppercase tracking-wider text-slate-500">
                    <th className="w-[18%] min-w-[72px] whitespace-nowrap px-4 py-4 text-left font-semibold md:px-6">
                      Período
                    </th>
                    <th className="w-[22%] min-w-[80px] whitespace-nowrap px-4 py-4 text-left font-semibold md:px-6">
                      Região
                    </th>
                    <th className="w-[42%] min-w-[120px] whitespace-nowrap px-4 py-4 text-left font-semibold md:px-6">
                      Faixa
                    </th>
                    <th className="w-[18%] min-w-[72px] whitespace-nowrap bg-slate-50/80 px-4 py-4 text-center font-bold md:px-6">
                      Meta
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {visibleGoals.map((g) => {
                    const isCurrent = isCurrentMonth(g.period);
                    return (
                      <tr
                        key={g.pk_id}
                        className={`transition-colors hover:bg-slate-50 ${isCurrent ? 'bg-blue-100' : ''}`}
                      >
                        <td className="w-[18%] min-w-[72px] whitespace-nowrap px-4 py-4 align-middle font-medium text-slate-700 md:px-6">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-slate-400" />
                            {g.period ? formatMonth(g.period.slice(0, 7)) : '–'}
                          </div>
                        </td>
                        <td className="w-[22%] min-w-[80px] truncate px-4 py-4 align-middle font-medium text-slate-700 md:px-6">
                          {regionLabel(g.region)}
                        </td>
                        <td className="w-[42%] min-w-[120px] truncate px-4 py-4 align-middle font-medium text-slate-600 md:px-6">
                          {g.delay_range ?? '–'}
                        </td>
                        <td className="w-[18%] min-w-[72px] whitespace-nowrap bg-slate-50/30 px-4 py-4 text-center align-middle font-bold text-slate-700 md:px-6">
                          {isCurrent ? (
                            <div className="flex flex-col items-center justify-center">
                              <span className="text-lg text-ocl-primary">
                                {g.goal == null ? '–' : formatNumber(g.goal)}
                              </span>
                              <span className="text-[10px] font-bold uppercase tracking-widest text-ocl-primary/70">
                                META DO MÊS
                              </span>
                            </div>
                          ) : (
                            <span className={g.goal == null ? '' : 'text-ocl-primary'}>
                              {g.goal == null ? '–' : formatNumber(g.goal)}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
          {hasMore && (
            <div className="mt-4 flex items-center justify-center">
              <button
                type="button"
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                className="rounded-lg border border-slate-200 bg-white px-6 py-2 text-sm font-semibold text-slate-600 shadow-sm transition-colors hover:bg-slate-50 hover:text-ocl-primary"
              >
                Mostrar mais ({goals.length - visibleCount} restantes)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
