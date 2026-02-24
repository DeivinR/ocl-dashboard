import { Calendar, Database } from 'lucide-react';
import { formatCurrency, formatNumber } from '../lib/utils';
import { Card } from './ui/Card';

export const AnalyticalTable = ({ history, currentDU, type, category }) => {
    const format = type === 'currency' ? formatCurrency : formatNumber;
    return (
      <div className="mt-8 animate-fade-in">
        <div className="flex items-center gap-2 mb-4">
          <Database size={20} className="text-[#003366]" />
          <h3 className="text-lg font-bold text-slate-800">Visão Analítica - Evolução Dia Útil {currentDU}</h3>
        </div>
        <Card className="overflow-hidden border-0 shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold whitespace-nowrap text-left">Referência</th>
                  
                  {category !== 'CONTENÇÃO' && (
                      <th className="px-6 py-4 font-semibold text-center whitespace-nowrap">Quantidade</th>
                  )}

                  {category !== 'CONTENÇÃO' && (
                      <th className="px-6 py-4 font-semibold text-center whitespace-nowrap text-[#003366]">Ticket Médio</th>
                  )}
                  
                  <th className="px-6 py-4 font-semibold text-center whitespace-nowrap">Resultado (D.U. {currentDU})</th>
                  <th className="px-6 py-4 font-semibold text-center whitespace-nowrap text-blue-600">MÉDIA DIÁRIA</th>
                  <th className="px-6 py-4 font-bold text-center whitespace-nowrap bg-slate-50/80">FECHAMENTO / PROJEÇÃO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {history.map((row, index) => (
                  <tr key={index} className={`hover:bg-slate-50 transition-colors ${row.isCurrent ? 'bg-blue-100' : ''}`}>
                    <td className="px-6 py-4 font-medium text-slate-700 whitespace-nowrap text-left align-middle">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-slate-400"/> {row.label}
                      </div>
                    </td>
                    
                    {category !== 'CONTENÇÃO' && (
                        <td className="px-6 py-4 text-center text-slate-600 font-medium whitespace-nowrap align-middle">
                            {row.countAtDU}
                        </td>
                    )}

                    {category !== 'CONTENÇÃO' && (
                        <td className="px-6 py-4 text-center text-[#003366] font-medium whitespace-nowrap align-middle">
                            {formatCurrency(row.countAtDU > 0 ? row.valueAtDU / row.countAtDU : 0)}
                        </td>
                    )}

                    <td className="px-6 py-4 text-center font-bold text-[#003366] whitespace-nowrap align-middle">{format(row.valueAtDU)}</td>
                    
                    <td className="px-6 py-4 text-center text-slate-600 whitespace-nowrap font-medium align-middle">
                        {format(row.valueAtDU / currentDU)}
                    </td>

                    <td className="px-6 py-4 text-center font-bold text-slate-700 whitespace-nowrap bg-slate-50/30 align-middle">
                      {row.isCurrent ? (
                          <div className="flex flex-col items-center justify-center">
                              <span className="text-[#003366] text-lg">{format(row.value)}</span>
                              <span className="text-[10px] uppercase tracking-widest text-[#003366]/70 font-bold">PROJEÇÃO</span>
                          </div>
                      ) : format(row.value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
};
