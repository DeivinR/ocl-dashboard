import { useState, type ChangeEvent } from 'react';
import { CheckCircle2, Loader2, Database } from 'lucide-react';

type UploaderStatus = 'idle' | 'processing' | 'success';

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

  if (status === 'success') {
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
          <Database size={24} className="text-ocl-primary" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-700">Clique para selecionar o arquivo de Foto Base</p>
          <p className="mt-0.5 text-xs text-slate-400">Formato aceito: .csv</p>
        </div>
      </>
    ),
  };
}

export const PhotoBaseUploader = () => {
  const [status, setStatus] = useState<UploaderStatus>('idle');
  const [statusMsg, setStatusMsg] = useState('');

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus('processing');
    setStatusMsg('Processando arquivo de Foto Base...');

    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulação

      setStatus('success');
      setStatusMsg('Arquivo de Foto Base selecionado com sucesso.');

      setTimeout(() => {
        setStatus('idle');
        setStatusMsg('');
      }, 3000);
    } catch (error) {
      setStatus('idle');
      alert('Erro ao processar arquivo de Foto Base');
    }
  };

  const isProcessing = status === 'processing';
  const { borderClass, content } = getUploaderState(status, statusMsg);

  return (
    <div className="mx-auto flex h-full max-w-xl flex-col items-center justify-center gap-4">
      <div className="w-full overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-5 py-3.5">
          <Database size={15} className="text-ocl-primary" />
          <span className="text-sm font-semibold text-slate-700">Upload de Arquivo de Foto Base</span>
        </div>

        <div className="p-5">
          <label className={`group flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition-all ${borderClass}`}>
            {content}
            <input type="file" className="hidden" accept=".csv" onChange={handleFile} disabled={isProcessing} />
          </label>
        </div>
      </div>
    </div>
  );
};
