import { ArrowLeft, LogOut } from 'lucide-react';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../lib/database.types';
import type { DashboardData } from '../lib/data';
import { FileUploader } from './FileUploader';

interface DataUploadPageProps {
  supabase: SupabaseClient<Database> | null;
  isHomolog: boolean;
  onDataSaved: (data: DashboardData) => void;
  onBack: () => void;
  onLogout: () => void;
}

export const DataUploadPage = ({
  supabase,
  isHomolog,
  onDataSaved,
  onBack,
  onLogout,
}: Readonly<DataUploadPageProps>) => {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-4 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
          >
            <ArrowLeft size={18} />
            <span>Voltar</span>
          </button>
          <img src="/logo.png" alt="OCL" className="h-9 object-contain" />
        </div>

        <button
          onClick={onLogout}
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-red-600"
        >
          <LogOut size={18} />
          <span>Sair</span>
        </button>
      </header>

      <main className="flex-1 px-6">
        <FileUploader supabase={supabase} onDataSaved={onDataSaved} isHomolog={isHomolog} />
      </main>
    </div>
  );
};
