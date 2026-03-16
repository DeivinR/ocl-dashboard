import { useState, type ChangeEvent } from 'react';
import { CloudLightning, Cloud, Settings, CheckCircle2, Loader2 } from 'lucide-react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { parseStructuredCSV } from '../lib/data';
import type { DashboardData } from '../lib/data';
import type { Database } from '../lib/database.types';

interface FileUploaderProps {
  supabase: SupabaseClient<Database> | null;
  onDataSaved: (data: DashboardData) => void;
}

export const FileUploader = ({ supabase, onDataSaved }: Readonly<FileUploaderProps>) => {
  const [status, setStatus] = useState('idle');
  const [statusMsg, setStatusMsg] = useState('');
  const [manualDU, setManualDU] = useState('1');
  const [totalDays, setTotalDays] = useState('22');

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
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
    setStatusMsg('Lendo e processando arquivo...');

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target?.result as string;
      const processed = parseStructuredCSV(text, manualDU, totalDays);

      if (!processed || processed.rawData.length === 0) {
        alert('Erro: CSV vazio ou inválido.');
        setStatus('idle');
        return;
      }

      if (!supabase) {
        alert('Supabase não inicializado.');
        setStatus('idle');
        return;
      }
      setStatusMsg('Publicando na nuvem...');
      try {
        const { error } = await supabase
          .from('dashboards')
          .upsert({ id: 'latest', content: processed, updated_at: new Date().toISOString() });
        if (error) throw error;
        onDataSaved(processed);
        setStatus('success-cloud');
        setStatusMsg('Dashboard atualizado com sucesso.');
      } catch (err) {
        console.error('Erro Supabase:', err);
        alert('Erro ao salvar: ' + (err as Error).message);
        setStatus('idle');
      }
      setTimeout(() => {
        setStatus('idle');
        setStatusMsg('');
      }, 3000);
    };
    reader.readAsText(file, 'UTF-8');
  };

  const isProcessing = status === 'processing';
  const isSuccess = status === 'success-cloud';

  return (
    <div className="mx-auto max-w-xl px-4 pb-20 pt-12">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-ocl-primary shadow-lg shadow-blue-100">
          <CloudLightning size={32} className="text-white" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-800">Importar Dashboard</h1>
        <p className="mt-1.5 text-sm text-slate-400">
          Carregue um arquivo CSV para atualizar os indicadores do painel.
        </p>
      </div>

      {/* Step 1 — Parâmetros de DUs */}
      <div className="mb-4 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50 px-5 py-3.5">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ocl-primary text-xs font-bold text-white">
            1
          </span>
          <div className="flex items-center gap-2">
            <Settings size={15} className="text-ocl-primary" />
            <span className="text-sm font-semibold text-slate-700">Parâmetros do Mês Corrente</span>
          </div>
        </div>

        <div className="p-5">
          <p className="mb-4 text-xs text-slate-400">
            Confirme os dias úteis antes de importar. Estes valores são usados para projeção mensal.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="manual-du"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400"
              >
                D.U. Atual
              </label>
              <input
                id="manual-du"
                type="number"
                min="1"
                max="31"
                value={manualDU}
                onChange={(e) => setManualDU(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-center text-lg font-extrabold text-ocl-primary focus:border-ocl-primary focus:outline-none focus:ring-2 focus:ring-ocl-primary/10"
              />
              <p className="mt-1 text-center text-xs text-slate-400">dia útil de hoje</p>
            </div>
            <div>
              <label
                htmlFor="total-days"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400"
              >
                D.U. Total do Mês
              </label>
              <input
                id="total-days"
                type="number"
                min="1"
                max="31"
                value={totalDays}
                onChange={(e) => setTotalDays(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-center text-lg font-extrabold text-ocl-primary focus:border-ocl-primary focus:outline-none focus:ring-2 focus:ring-ocl-primary/10"
              />
              <p className="mt-1 text-center text-xs text-slate-400">dias úteis no mês</p>
            </div>
          </div>
        </div>
      </div>

      {/* Step 2 — Upload */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50 px-5 py-3.5">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ocl-primary text-xs font-bold text-white">
            2
          </span>
          <div className="flex items-center gap-2">
            <Cloud size={15} className="text-ocl-primary" />
            <span className="text-sm font-semibold text-slate-700">Publicar Arquivo CSV</span>
          </div>
        </div>

        <div className="p-5">
          <p className="mb-4 text-xs text-slate-400">
            Selecione o arquivo exportado do sistema. Os dados serão processados e publicados diretamente na base de
            dados.
          </p>

          <label
            className={`group flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition-all ${isProcessing ? 'border-blue-300 bg-blue-50' : isSuccess ? 'border-green-300 bg-green-50' : 'border-slate-200 bg-slate-50 hover:border-ocl-primary hover:bg-blue-50/40'}`}
          >
            {isProcessing ? (
              <>
                <Loader2 size={28} className="animate-spin text-ocl-primary" />
                <span className="text-sm font-semibold text-ocl-primary">{statusMsg}</span>
              </>
            ) : isSuccess ? (
              <>
                <CheckCircle2 size={28} className="text-green-500" />
                <span className="text-sm font-semibold text-green-600">{statusMsg}</span>
              </>
            ) : (
              <>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-ocl-primary/10 transition group-hover:bg-ocl-primary/20">
                  <Cloud size={24} className="text-ocl-primary" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-700">Clique para selecionar o arquivo</p>
                  <p className="mt-0.5 text-xs text-slate-400">Formato aceito: .csv</p>
                </div>
              </>
            )}
            <input type="file" className="hidden" accept=".csv" onChange={handleFile} disabled={isProcessing} />
          </label>
        </div>
      </div>
    </div>
  );
};
