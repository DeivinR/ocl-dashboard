import { useState, type ChangeEvent } from 'react';
import { Cloud, CheckCircle2, Loader2 } from 'lucide-react';
import type { GetToken } from '../api/client';
import { uploadGCAFile } from '../api/gca';

type UploaderStatus = 'idle' | 'processing' | 'success';
const MAX_GCA_FILE_SIZE_BYTES = 2.5 * 1024 * 1024;

interface GCAUploaderProps {
  getToken: GetToken;
}

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
          <Cloud size={24} className="text-ocl-primary" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-700">Clique para selecionar o arquivo GCA</p>
          <p className="mt-0.5 text-xs text-slate-400">Ajuste o layout antes de importar. Formato aceito: .csv</p>
        </div>
      </>
    ),
  };
}

export const GCAUploader = ({ getToken }: Readonly<GCAUploaderProps>) => {
  const [status, setStatus] = useState<UploaderStatus>('idle');
  const [statusMsg, setStatusMsg] = useState('');

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const input = e.target;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      alert('Formato inválido. Envie um arquivo CSV.');
      input.value = '';
      return;
    }

    if (file.size > MAX_GCA_FILE_SIZE_BYTES) {
      alert('Arquivo excede o limite de 2.5 MB.');
      input.value = '';
      return;
    }

    const fileText = await file.text();
    const [firstLine = ''] = fileText.split(/\r?\n/, 1);
    const normalizedHeaders = firstLine
      .split(',')
      .map((header) => header.trim().toLowerCase())
      .join(',');

    if (normalizedHeaders !== 'debt_id,gca') {
      alert('Cabeçalhos inválidos. Use: debt_id,gca');
      input.value = '';
      return;
    }

    setStatus('processing');
    setStatusMsg('Processando arquivo GCA...');

    try {
      await uploadGCAFile(getToken, file);

      setStatus('success');
      setStatusMsg('Arquivo GCA enviado com sucesso.');

      setTimeout(() => {
        setStatus('idle');
        setStatusMsg('');
      }, 3000);
    } catch (error) {
      setStatus('idle');
      alert('Erro ao enviar arquivo GCA: ' + (error as Error).message);
    } finally {
      input.value = '';
    }
  };

  const isProcessing = status === 'processing';
  const { borderClass, content } = getUploaderState(status, statusMsg);

  return (
    <div className="mx-auto flex h-full max-w-xl flex-col items-center justify-center gap-4">
      <div className="w-full overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-5 py-3.5">
          <Cloud size={15} className="text-ocl-primary" />
          <span className="text-sm font-semibold text-slate-700">Upload de Arquivo GCA</span>
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
