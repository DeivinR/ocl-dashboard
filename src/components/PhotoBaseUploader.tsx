import { useEffect, useState, type ChangeEvent } from 'react';
import { CheckCircle2, Loader2, Database } from 'lucide-react';
import type { GetToken } from '../api/client';
import { useUploadPhotoBaseFile } from '../hooks/queries/usePhotoBaseUpload';

type UploaderStatus = 'idle' | 'processing' | 'success';
const MAX_PHOTO_BASE_FILE_SIZE_BYTES = 3 * 1024 * 1024;

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
          <p className="text-sm font-semibold text-slate-700">Clique para selecionar o arquivo de Foto da Base</p>
          <p className="mt-0.5 text-xs text-slate-400">Formato aceito: .xlsx</p>
        </div>
      </>
    ),
  };
}

interface PhotoBaseUploaderProps {
  getToken: GetToken;
}

export const PhotoBaseUploader = ({ getToken }: Readonly<PhotoBaseUploaderProps>) => {
  const uploadMutation = useUploadPhotoBaseFile(getToken);
  const [status, setStatus] = useState<UploaderStatus>('idle');
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    if (!uploadMutation.isPending && !uploadMutation.isSuccess) return;

    if (uploadMutation.isPending) {
      setStatus('processing');
      setStatusMsg('Processando arquivo de Foto da Base...');
      return;
    }

    setStatus('success');
    setStatusMsg('Arquivo de Foto da Base enviado com sucesso.');

    const timeout = setTimeout(() => {
      uploadMutation.reset();
      setStatus('idle');
      setStatusMsg('');
    }, 3000);

    return () => clearTimeout(timeout);
  }, [uploadMutation]);

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const input = e.target;

    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      alert('Formato inválido. Envie um arquivo XLSX.');
      input.value = '';
      return;
    }

    if (file.size > MAX_PHOTO_BASE_FILE_SIZE_BYTES) {
      alert('Arquivo excede o limite de 2.5 MB.');
      input.value = '';
      return;
    }

    try {
      await uploadMutation.mutateAsync(file);
    } catch (error) {
      uploadMutation.reset();
      setStatus('idle');
      setStatusMsg('');
      alert('Erro ao enviar arquivo de Foto da Base: ' + (error as Error).message);
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
          <Database size={15} className="text-ocl-primary" />
          <span className="text-sm font-semibold text-slate-700">Upload de Arquivo de Foto da Base</span>
        </div>

        <div className="p-5">
          <label
            className={`group flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition-all ${borderClass}`}
          >
            {content}
            <input type="file" className="hidden" accept=".xlsx" onChange={handleFile} disabled={isProcessing} />
          </label>
        </div>
      </div>
    </div>
  );
};
