import { useMemo, useState } from 'react';
import { ArrowLeft, LogOut, UploadCloud, Menu, X, FileUp } from 'lucide-react';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../config/database.types';
import type { DashboardData } from '../services';
import { FileUploader } from '../components/FileUploader';
import { GCAUploader } from '../components/GCAUploader';
import { useIsMobile } from '../hooks/useIsMobile';
import type { GetToken } from '../api/client';

type SettingsSectionId = 'upload' | 'gca_upload';

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
  {
    id: 'gca_upload',
    label: 'Upload de GCA',
    icon: FileUp,
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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isMobile = useIsMobile();
  const getToken = useMemo<GetToken>(
    () => async () => {
      if (!supabase) return null;
      const { data } = await supabase.auth.getSession();
      return data.session?.access_token ?? null;
    },
    [supabase],
  );

  const handleSectionChange = (id: SettingsSectionId) => {
    setActiveSection(id);
    if (isMobile) setSidebarOpen(false);
  };

  const translateClass = isMobile && !sidebarOpen ? '-translate-x-full' : 'translate-x-0';
  const sidebarWidth = sidebarOpen ? 'w-72' : 'w-20';

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {isMobile && sidebarOpen && (
        <button
          type="button"
          aria-label="Fechar menu"
          className="fixed inset-0 z-40 cursor-default bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex shrink-0 flex-col border-r border-slate-200 bg-white transition-all duration-300 lg:relative ${sidebarWidth} ${translateClass}`}
      >
        <div className="relative flex h-24 items-center border-b border-slate-100 px-6">
          {sidebarOpen ? (
            <img src="/logo.png" alt="OCL" className="h-14 object-contain" />
          ) : (
            <img src="/logo.png" alt="OCL" className="mx-auto h-10 object-contain" />
          )}
          {isMobile && sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(false)}
              title="Fechar"
              className="absolute right-4 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              <X size={16} />
            </button>
          )}
          {sidebarOpen && !isMobile && (
            <button
              onClick={onBack}
              title="Voltar"
              className="absolute right-4 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              <ArrowLeft size={16} />
            </button>
          )}
        </div>

        {sidebarOpen && (
          <p className="px-5 pt-5 text-[10.5px] font-semibold uppercase tracking-widest text-slate-400">
            Configurações
          </p>
        )}

        <nav className="mt-2 flex-1 space-y-1 overflow-y-auto p-4">
          {!isMobile && !sidebarOpen && (
            <button
              onClick={onBack}
              title="Voltar"
              className="mb-4 flex w-full items-center justify-center rounded-xl border border-slate-200 px-4 py-3 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          {SETTINGS_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSectionChange(item.id)}
                title={sidebarOpen ? undefined : item.label}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${!sidebarOpen && 'justify-center'
                  } ${isActive
                    ? 'translate-x-1 bg-ocl-primary font-bold text-white shadow-lg shadow-ocl-primary/20'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
              >
                <Icon size={20} />
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-slate-100 p-4">
          <button
            onClick={onLogout}
            title={sidebarOpen ? undefined : 'Sair do Sistema'}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-400 transition-colors hover:bg-red-50 hover:text-red-600 ${!sidebarOpen && 'justify-center'
              }`}
          >
            <LogOut size={20} />
            {sidebarOpen && <span>Sair do Sistema</span>}
          </button>
        </div>
      </aside>

      <main className={`flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto ${!isMobile && !sidebarOpen && 'ml-20'}`}>
        {isMobile && (
          <header className="flex h-16 shrink-0 items-center gap-4 border-b border-slate-200 bg-white px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100"
            >
              <Menu size={24} />
            </button>
            <img src="/logo.png" alt="OCL" className="h-8 object-contain" />
            <button
              onClick={onBack}
              title="Voltar"
              className="ml-auto flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              <ArrowLeft size={20} />
            </button>
          </header>
        )}
        <div className="flex-1 px-4 py-6 md:px-8">
          {activeSection === 'upload' && <FileUploader supabase={supabase} onDataSaved={onDataSaved} />}
          {activeSection === 'gca_upload' && <GCAUploader getToken={getToken} />}
        </div>
      </main>
    </div>
  );
};
