import { useMemo } from 'react';
import { 
    Wallet, Handshake, Car, Layers, TrendingUp, Clock, Users, 
    Calendar, Activity, ArrowRight 
} from 'lucide-react';
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
        <div className="max-w-6xl mx-auto pb-20 md:pb-0">
            <div className="bg-gradient-to-r from-[#003366] to-[#004990] rounded-3xl p-6 md:p-10 text-white mb-8 shadow-xl relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center md:items-end gap-6 text-center md:text-left">
                    <div className="flex-1 w-full md:w-auto">
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-2 opacity-80">
                             {category === 'CASH' && <Wallet size={20}/>}
                             {category === 'RENEGOCIAÇÃO' && <Handshake size={20}/>}
                             {category === 'ENTREGA AMIGÁVEL' && <Car size={20}/>}
                             {category === 'CONSOLIDADO' && <Layers size={20}/>}
                            <span className="text-sm font-semibold tracking-widest uppercase">{category}</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-2">{type === 'currency' ? formatCurrency(kpis.current) : formatNumber(kpis.current)}</h1>
                        
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                            <div className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm">
                                <Clock size={14} /> <span>Acumulado até o {kpis.currentDU}º Dia Útil</span>
                            </div>
                            <div className="inline-flex items-center justify-center gap-2 bg-black/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-medium text-white/90">
                                <Users size={12} /> <span>{kpis.count} Qtd.</span>
                            </div>
                        </div>
                    </div>

                    <div className="text-center md:text-right bg-white/5 p-4 rounded-xl backdrop-blur-sm border border-white/10 w-full md:w-auto md:min-w-[200px]">
                        <p className="text-xs font-bold text-white/70 uppercase tracking-widest mb-1 flex items-center justify-center md:justify-end gap-2">
                            <TrendingUp size={14}/> Projeção (Est.)
                        </p>
                        <h2 className="text-3xl font-bold text-white">{type === 'currency' ? formatCurrency(projectionVal) : formatNumber(projectionVal)}</h2>
                        <p className="text-[10px] text-white/50 mt-1">Base: {kpis.totalBusinessDays} dias úteis</p>
                    </div>
                </div>
                <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 skew-x-12 transform translate-x-10"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                    comparison={((kpis.current - kpis.avg6)/kpis.avg6)*100} 
                    type={type} 
                    icon={TrendingUp} 
                    subtext={`Média: ${Math.round(kpis.avg6Count)} qtd.`}
                />
            </div>
            <AnalyticalTable history={kpis.history} currentDU={kpis.currentDU} type={type} category={category} />
            {isMobile && nextName && (
                <button onClick={onNext} className="w-full mt-8 bg-white border border-slate-200 text-[#003366] p-4 rounded-xl font-bold flex items-center justify-between shadow-sm">
                    <span>Próximo: {nextName}</span> <ArrowRight size={20} />
                </button>
            )}
        </div>
    );
};
