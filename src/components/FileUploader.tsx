import { useState, type ChangeEvent } from 'react';
import { CloudLightning, Cloud, Eye, Settings } from 'lucide-react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { parseStructuredCSV } from '../lib/data';
import type { DashboardData } from '../lib/data';
import type { Database } from '../lib/database.types';
import { Card } from './ui/Card';

interface FileUploaderProps {
  supabase: SupabaseClient<Database> | null;
  onDataSaved: (data: DashboardData) => void;
  isHomolog: boolean;
}

export const FileUploader = ({ supabase, onDataSaved, isHomolog }: Readonly<FileUploaderProps>) => {
  const [status, setStatus] = useState('idle');
  const [statusMsg, setStatusMsg] = useState('');
  const [manualDU, setManualDU] = useState('1');
  const [totalDays, setTotalDays] = useState('22');

  const handleFile = async (e: ChangeEvent<HTMLInputElement>, mode: 'cloud' | 'local') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!manualDU || Number.parseInt(manualDU) < 1) {
      alert('Por favor, informe o Dia Útil atual (DU).');
      e.target.value = '';
      return;
    }
    if (!totalDays || Number.parseInt(totalDays) < Number.parseInt(manualDU)) {
      alert('Dias Úteis Totais inválido.');
      e.target.value = '';
      return;
    }

    setStatus('processing');
    setStatusMsg('Lendo arquivo...');

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target?.result as string;
      const processed = parseStructuredCSV(text, manualDU, totalDays);

      if (!processed || processed.rawData.length === 0) {
        alert('Erro: CSV vazio ou inválido.');
        setStatus('idle');
        return;
      }

      if (mode === 'cloud' && !isHomolog) {
        if (!supabase) {
          alert('Supabase não inicializado.');
          setStatus('idle');
          return;
        }
        setStatusMsg('Enviando dados para o Supabase...');
        try {
          const { error } = await supabase
            .from('dashboards')
            .upsert({ id: 'latest', content: processed, updated_at: new Date().toISOString() });
          if (error) throw error;
          onDataSaved(processed);
          setStatus('success-cloud');
          setStatusMsg('Sucesso! Base de dados atualizada.');
        } catch (err) {
          console.error('Erro Supabase:', err);
          alert('Erro ao salvar: ' + (err as Error).message);
          setStatus('idle');
        }
      } else {
        onDataSaved(processed);
        setStatus('success-local');
        setStatusMsg('Simulação local carregada.');
      }
      setTimeout(() => {
        setStatus('idle');
        setStatusMsg('');
      }, 3000);
    };
    reader.readAsText(file, 'UTF-8');
  };

  return (
    <div className="mx-auto max-w-2xl pb-20 pt-10 text-center">
      <Card className="p-10">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-50">
          <CloudLightning size={40} className="text-ocl-primary" />
        </div>
        <h2 className="mb-2 text-2xl font-bold text-slate-800">Gestão de Dados (Supabase)</h2>
        <p className="mb-8 text-slate-500">Importe o arquivo CSV completo para atualizar os indicadores.</p>

        <div className="mb-8 inline-block w-full rounded-xl border border-slate-200 bg-slate-50 p-6 text-left md:w-auto">
          <div className="mb-4 flex items-center gap-2 border-b border-slate-200 pb-2 font-bold text-ocl-primary">
            <Settings size={18} /> Parâmetros do Mês Atual
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label htmlFor="manual-du" className="mb-2 block text-xs font-bold uppercase text-slate-500">
                Dia Útil (D.U.) Atual
              </label>
              <input
                id="manual-du"
                type="number"
                min="1"
                max="31"
                value={manualDU}
                onChange={(e) => setManualDU(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-3 text-center font-bold text-ocl-primary focus:border-ocl-primary focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="total-days" className="mb-2 block text-xs font-bold uppercase text-slate-500">
                D.U. Totais (Mês)
              </label>
              <input
                id="total-days"
                type="number"
                min="1"
                max="31"
                value={totalDays}
                onChange={(e) => setTotalDays(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-3 text-center font-bold text-ocl-primary focus:border-ocl-primary focus:outline-none"
              />
            </div>
          </div>
          <p className="mt-3 text-xs italic text-slate-400">* Usado para cálculo de projeção do mês corrente.</p>
        </div>

        <div className="flex flex-col justify-center gap-4 md:flex-row">
          <label
            className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-ocl-primary px-6 py-3 font-bold text-white transition ${isHomolog ? 'cursor-not-allowed opacity-50' : 'hover:bg-ocl-hover'}`}
          >
            <Cloud size={20} /> Publicar na Nuvem (Oficial)
            <input
              type="file"
              className="hidden"
              accept=".csv"
              onChange={(e) => handleFile(e, 'cloud')}
              disabled={isHomolog}
            />
          </label>
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-ocl-primary bg-white px-6 py-3 font-bold text-ocl-primary transition hover:bg-blue-50">
            <Eye size={20} /> Simular Visualização (Local)
            <input type="file" className="hidden" accept=".csv" onChange={(e) => handleFile(e, 'local')} />
          </label>
        </div>
        {status !== 'idle' && (
          <p className={`mt-4 font-bold ${status.includes('success') ? 'text-green-600' : 'text-blue-600'}`}>
            {statusMsg}
          </p>
        )}
      </Card>
    </div>
  );
};
