import { Calendar, Database } from 'lucide-react';
import { formatCurrency, formatNumber } from '../lib/utils';
import { Card } from './ui/Card';

export const AnalyticalTable = ({ history, currentDU, type, category }) => {
  const format = type === 'currency' ? formatCurrency : formatNumber;
  return (
    <div className="animate-fade-in mt-8">
      <div className="mb-4 flex items-center gap-2">
        <Database size={20} className="text-[#003366]" />
        <h3 className="text-lg font-bold text-slate-800">Visão Analítica - Evolução Dia Útil {currentDU}</h3>
      </div>
      <Card className="overflow-hidden border-0 shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-xs uppercase tracking-wider text-slate-500">
                <th className="whitespace-nowrap px-6 py-4 text-left font-semibold">Referência</th>

                {category !== 'CONTENÇÃO' && (
                  <th className="whitespace-nowrap px-6 py-4 text-center font-semibold">Quantidade</th>
                )}

                {category !== 'CONTENÇÃO' && (
                  <th className="whitespace-nowrap px-6 py-4 text-center font-semibold text-[#003366]">Ticket Médio</th>
                )}

                <th className="whitespace-nowrap px-6 py-4 text-center font-semibold">Resultado (D.U. {currentDU})</th>
                <th className="whitespace-nowrap px-6 py-4 text-center font-semibold text-blue-600">MÉDIA DIÁRIA</th>
                <th className="whitespace-nowrap bg-slate-50/80 px-6 py-4 text-center font-bold">
                  FECHAMENTO / PROJEÇÃO
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {history.map((row, index) => (
                <tr key={index} className={`transition-colors hover:bg-slate-50 ${row.isCurrent ? 'bg-blue-100' : ''}`}>
                  <td className="whitespace-nowrap px-6 py-4 text-left align-middle font-medium text-slate-700">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-slate-400" /> {row.label}
                    </div>
                  </td>

                  {category !== 'CONTENÇÃO' && (
                    <td className="whitespace-nowrap px-6 py-4 text-center align-middle font-medium text-slate-600">
                      {row.countAtDU}
                    </td>
                  )}

                  {category !== 'CONTENÇÃO' && (
                    <td className="whitespace-nowrap px-6 py-4 text-center align-middle font-medium text-[#003366]">
                      {formatCurrency(row.countAtDU > 0 ? row.valueAtDU / row.countAtDU : 0)}
                    </td>
                  )}

                  <td className="whitespace-nowrap px-6 py-4 text-center align-middle font-bold text-[#003366]">
                    {format(row.valueAtDU)}
                  </td>

                  <td className="whitespace-nowrap px-6 py-4 text-center align-middle font-medium text-slate-600">
                    {format(row.valueAtDU / currentDU)}
                  </td>

                  <td className="whitespace-nowrap bg-slate-50/30 px-6 py-4 text-center align-middle font-bold text-slate-700">
                    {row.isCurrent ? (
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-lg text-[#003366]">{format(row.value)}</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#003366]/70">
                          PROJEÇÃO
                        </span>
                      </div>
                    ) : (
                      format(row.value)
                    )}
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
