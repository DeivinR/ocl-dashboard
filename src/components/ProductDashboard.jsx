import { useMemo } from 'react';
import { Wallet, Handshake, Car, Layers, TrendingUp, Clock, Users, Calendar, Activity, ArrowRight } from 'lucide-react';
import { formatCurrency, formatNumber } from '../lib/utils';
import { calculateKPIs } from '../lib/data';
import { MetricCard } from './ui/Card';
import { AnalyticalTable } from './AnalyticalTable';

export const ProductDashboard = ({ category, data, isMobile, onNext, nextName }) => {
  const kpis = useMemo(() => calculateKPIs(data, category), [data, category]);
  const isContencao = category === 'CONTENÇÃO';
  const type = isContencao ? 'number' : 'currency';
  const varPrev = kpis.prev > 0 ? ((kpis.current - kpis.prev) / kpis.prev) * 100 : 0;
  const varAvg3 = kpis.avg3 > 0 ? ((kpis.current - kpis.avg3) / kpis.avg3) * 100 : 0;

  const projectionVal = (kpis.current / (kpis.currentDU || 1)) * (kpis.totalBusinessDays || 22);

  return (
    <div className="mx-auto max-w-6xl pb-20 md:pb-0">
      <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-[#003366] to-[#004990] p-6 text-white shadow-xl md:p-10">
        <div className="relative z-10 flex flex-col items-center justify-between gap-6 text-center md:flex-row md:items-end md:text-left">
          <div className="w-full flex-1 md:w-auto">
            <div className="mb-2 flex items-center justify-center gap-2 opacity-80 md:justify-start">
              {category === 'CASH' && <Wallet size={20} />}
              {category === 'RENEGOCIAÇÃO' && <Handshake size={20} />}
              {category === 'ENTREGA AMIGÁVEL' && <Car size={20} />}
              {category === 'CONSOLIDADO' && <Layers size={20} />}
              <span className="text-sm font-semibold uppercase tracking-widest">{category}</span>
            </div>
            <h1 className="mb-2 text-4xl font-bold md:text-5xl">
              {type === 'currency' ? formatCurrency(kpis.current) : formatNumber(kpis.current)}
            </h1>

            <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
              <div className="inline-flex items-center justify-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm backdrop-blur-sm">
                <Clock size={14} /> <span>Acumulado até o {kpis.currentDU}º Dia Útil</span>
              </div>
              <div className="inline-flex items-center justify-center gap-2 rounded-full bg-black/20 px-4 py-1.5 text-xs font-medium text-white/90 backdrop-blur-sm">
                <Users size={12} /> <span>{kpis.count} Qtd.</span>
              </div>
            </div>
          </div>

          <div className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur-sm md:w-auto md:min-w-[200px] md:text-right">
            <p className="mb-1 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-white/70 md:justify-end">
              <TrendingUp size={14} /> Projeção (Est.)
            </p>
            <h2 className="text-3xl font-bold text-white">
              {type === 'currency' ? formatCurrency(projectionVal) : formatNumber(projectionVal)}
            </h2>
            <p className="mt-1 text-[10px] text-white/50">Base: {kpis.totalBusinessDays} dias úteis</p>
          </div>
        </div>
        <div className="absolute bottom-0 right-0 top-0 w-1/3 translate-x-10 skew-x-12 transform bg-white/5"></div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <MetricCard
          title="vs. Mês Anterior"
          value={kpis.prev}
          comparison={varPrev}
          type={type}
          icon={Calendar}
          subtext={`${Math.round(kpis.prevCount)} qtd.`}
        />
        <MetricCard
          title="VS. MÉDIA TRIMESTRAL"
          value={kpis.avg3}
          comparison={varAvg3}
          type={type}
          icon={Activity}
          subtext={`Média: ${Math.round(kpis.avg3Count)} qtd.`}
        />
        <MetricCard
          title="VS. MÉDIA SEMESTRAL"
          value={kpis.avg6}
          comparison={((kpis.current - kpis.avg6) / kpis.avg6) * 100}
          type={type}
          icon={TrendingUp}
          subtext={`Média: ${Math.round(kpis.avg6Count)} qtd.`}
        />
      </div>
      <AnalyticalTable history={kpis.history} currentDU={kpis.currentDU} type={type} category={category} />
      {isMobile && nextName && (
        <button
          onClick={onNext}
          className="mt-8 flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white p-4 font-bold text-[#003366] shadow-sm"
        >
          <span>Próximo: {nextName}</span> <ArrowRight size={20} />
        </button>
      )}
    </div>
  );
};
