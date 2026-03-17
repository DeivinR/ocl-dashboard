import { useState } from 'react';
import { ArrowLeft, LogOut, UploadCloud } from 'lucide-react';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../lib/database.types';
import type { DashboardData } from '../lib/data';
import { FileUploader } from './FileUploader';

type SettingsSectionId = 'upload';

interface SettingsItem {
  id: SettingsSectionId;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const SETTINGS_ITEMS: SettingsItem[] = [
  {
    id: 'upload',
    label: 'Upload de Dados',
    icon: UploadCloud,
  },
];

interface SettingsPageProps {
  supabase: SupabaseClient<Database> | null;
  onDataSaved: (data: DashboardData) => void;
  onBack: () => void;
  onLogout: () => void;
}

export const SettingsPage = ({ supabase, onDataSaved, onBack, onLogout }: Readonly<SettingsPageProps>) => {
  const [activeSection, setActiveSection] = useState<SettingsSectionId>('upload');

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <aside className="flex w-72 shrink-0 flex-col border-r border-slate-200 bg-white">
        <div className="relative flex h-24 items-center border-b border-slate-100 px-6">
          <img src="/logo.png" alt="OCL" className="h-14 object-contain" />
          <button
            onClick={onBack}
            title="Voltar"
            className="absolute right-4 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <ArrowLeft size={16} />
          </button>
        </div>

        <p className="px-5 pt-5 text-[10.5px] font-semibold uppercase tracking-widest text-slate-400">Configurações</p>

        <nav className="mt-2 flex-1 space-y-1 overflow-y-auto p-4">
          {SETTINGS_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                  isActive
                    ? 'translate-x-1 bg-ocl-primary font-bold text-white shadow-lg shadow-ocl-primary/20'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="border-t border-slate-100 p-4">
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-400 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={20} />
            <span>Sair do Sistema</span>
          </button>
        </div>
      </aside>

      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
        <div className="flex-1 px-8 py-6">
          {activeSection === 'upload' && <FileUploader supabase={supabase} onDataSaved={onDataSaved} />}
        </div>
      </main>
    </div>
  );
};
