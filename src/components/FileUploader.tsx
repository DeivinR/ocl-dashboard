import { useState, type ChangeEvent } from 'react';
import { Cloud, Settings, CheckCircle2, Loader2 } from 'lucide-react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { parseStructuredCSV } from '../lib/data';
import type { DashboardData } from '../lib/data';
import type { Database } from '../lib/database.types';

interface FileUploaderProps {
  supabase: SupabaseClient<Database> | null;
  onDataSaved: (data: DashboardData) => void;
}

type UploaderStatus = 'idle' | 'processing' | 'success-cloud';

interface UploaderState {
  borderClass: string;
  content: React.ReactNode;
}

function getUploaderState(status: UploaderStatus, statusMsg: string): UploaderState {
  if (status === 'processing') {
    return {
      borderClass: 'border-blue-300 bg-blue-50',
      content: (
        <>
          <Loader2 size={28} className="animate-spin text-ocl-primary" />
          <span className="text-sm font-semibold text-ocl-primary">{statusMsg}</span>
        </>
      ),
    };
  }

  if (status === 'success-cloud') {
    return {
      borderClass: 'border-green-300 bg-green-50',
      content: (
        <>
          <CheckCircle2 size={28} className="text-green-500" />
          <span className="text-sm font-semibold text-green-600">{statusMsg}</span>
        </>
      ),
    };
  }

  return {
    borderClass: 'border-slate-200 bg-slate-50 hover:border-ocl-primary hover:bg-blue-50/40',
    content: (
      <>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-ocl-primary/10 transition group-hover:bg-ocl-primary/20">
          <Cloud size={24} className="text-ocl-primary" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-700">Clique para selecionar o arquivo</p>
          <p className="mt-0.5 text-xs text-slate-400">Formato aceito: .csv</p>
        </div>
      </>
    ),
  };
}

export const FileUploader = ({ supabase, onDataSaved }: Readonly<FileUploaderProps>) => {
  const [status, setStatus] = useState<UploaderStatus>('idle');
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
  const { borderClass, content } = getUploaderState(status, statusMsg);

  return (
    <div className="mx-auto flex h-full max-w-xl flex-col items-center justify-center gap-4">
      <div className="w-full overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-5 py-3.5">
          <Settings size={15} className="text-ocl-primary" />
          <span className="text-sm font-semibold text-slate-700">Parâmetros do Mês Corrente</span>
        </div>

        <div className="grid grid-cols-2 gap-4 p-5">
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
          </div>
        </div>
      </div>

      <div className="w-full overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-5 py-3.5">
          <Cloud size={15} className="text-ocl-primary" />
          <span className="text-sm font-semibold text-slate-700">Publicar Arquivo CSV</span>
        </div>

        <div className="p-5">
          <label
            className={`group flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition-all ${borderClass}`}
          >
            {content}
            <input type="file" className="hidden" accept=".csv" onChange={handleFile} disabled={isProcessing} />
          </label>
        </div>
      </div>
    </div>
  );
};
