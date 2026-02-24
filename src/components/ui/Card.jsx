import { TrendingUp, TrendingDown, Users } from 'lucide-react';
import { formatCurrency, formatNumber } from '../../lib/utils';

export const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(0,51,102,0.1)] border border-slate-100 transition-all duration-300 flex flex-col justify-between ${className}`}>
    {children}
  </div>
);

export const MetricCard = ({ title, value, type = "currency", comparison, icon: Icon, subtext }) => {
    const isPositive = comparison >= 0;
    const format = type === 'currency' ? formatCurrency : formatNumber;
    return (
        <Card className="p-6 relative overflow-hidden group hover:shadow-lg h-full">
             <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">{Icon && <Icon size={80} color="#003366" />}</div>
            <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">{title}</p>
                <h3 className="text-2xl md:text-3xl font-bold text-[#003366]">{format(value)}</h3>
            </div>
            <div className="flex justify-between items-end mt-4 pt-2 border-t border-slate-50/50">
                <div className="text-xs text-slate-400 font-medium max-w-[60%] flex items-center gap-1">
                    <Users size={12} className="text-slate-300"/> {subtext}
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {comparison !== null && (<>{isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />} {Math.abs(comparison).toFixed(1)}%</>)}
                </div>
            </div>
        </Card>
    );
};
