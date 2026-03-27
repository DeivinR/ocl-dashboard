import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  LogOut,
  UploadCloud,
  Menu,
  X,
  FileUp,
  Calendar,
  Database as DatabaseIcon,
  Target,
} from 'lucide-react';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../config/database.types';
import type { DashboardData } from '../services';
import { FileUploader } from '../components/FileUploader';
import { GCAUploader } from '../components/GCAUploader';
import { CalendarUploader } from '../components/CalendarUploader';
import { PhotoBaseUploader } from '../components/PhotoBaseUploader';
import { SantanderGoalsUploader } from '../components/SantanderGoalsUploader';
import { OCLGoalsUploader } from '../components/OCLGoalsUploader';
import { useIsMobile } from '../hooks/useIsMobile';
import type { GetToken } from '../api/client';

type SettingsSectionId = 'uploads';
type UploadTypeId =
  | 'upload'
  | 'gca_upload'
  | 'calendar_upload'
  | 'photo_base_upload'
  | 'santander_goals_upload'
  | 'ocl_goals_upload';

interface SettingsItem {
  id: SettingsSectionId;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

interface UploadType {
  id: UploadTypeId;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const OCLIcon = ({ size = 24, className = '' }: { size?: number; className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="5.5" cy="12" r="3.5" />
    <path d="M15.97 8.97A3.5 3.5 0 1 0 15.97 15.03" />
    <polyline points="17.97,8.5 17.97,15.5 21.5,15.5" />
  </svg>
);

const SETTINGS_ITEMS: SettingsItem[] = [
  {
    id: 'uploads',
    label: 'Upload de Arquivos',
    icon: UploadCloud,
  },
];

const UPLOAD_TYPES: UploadType[] = [
  {
    id: 'upload',
    label: 'Base tratada',
    icon: UploadCloud,
  },
  {
    id: 'gca_upload',
    label: 'GCA',
    icon: FileUp,
  },
  {
    id: 'calendar_upload',
    label: 'Calendário',
    icon: Calendar,
  },
  {
    id: 'photo_base_upload',
    label: 'Foto da Base',
    icon: DatabaseIcon,
  },
  {
    id: 'santander_goals_upload',
    label: 'Metas Santander',
    icon: Target,
  },
  {
    id: 'ocl_goals_upload',
    label: 'Metas OCL',
    icon: OCLIcon,
  },
];

interface SettingsPageProps {
  supabase: SupabaseClient<Database> | null;
  onDataSaved: (data: DashboardData) => void;
  onBack: () => void;
  onLogout: () => void;
}

export const SettingsPage = ({ supabase, onDataSaved, onBack, onLogout }: Readonly<SettingsPageProps>) => {
  const [activeSection, setActiveSection] = useState<SettingsSectionId>('uploads');
  const [selectedUpload, setSelectedUpload] = useState<UploadTypeId | null>(null);
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
    setSelectedUpload(null);
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
        <div className="relative flex h-24 items-center gap-3 border-b border-slate-100 px-6">
          <div className="flex flex-1 items-center justify-center">
            {sidebarOpen ? (
              <img src="/logo.png" alt="OCL" className="h-14 object-contain" />
            ) : (
              <img src="/logo.png" alt="OCL" className="mx-auto h-10 object-contain" />
            )}
          </div>
          {!isMobile && sidebarOpen && (
            <button
              onClick={onBack}
              title="Voltar ao Painel"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-700"
            >
              <ArrowLeft size={20} />
            </button>
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
        </div>

        {sidebarOpen && (
          <p className="px-5 pt-5 text-[10.5px] font-semibold uppercase tracking-widest text-slate-400">
            Configurações
          </p>
        )}

        <nav className="mt-2 flex-1 space-y-1 overflow-y-auto p-4">
          {SETTINGS_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSectionChange(item.id)}
                title={sidebarOpen ? undefined : item.label}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                  !sidebarOpen && 'justify-center'
                } ${
                  isActive
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
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-400 transition-colors hover:bg-red-50 hover:text-red-600 ${
              !sidebarOpen && 'justify-center'
            }`}
          >
            <LogOut size={20} />
            {sidebarOpen && <span>Sair do Sistema</span>}
          </button>
        </div>
      </aside>

      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
        <header className="flex h-16 shrink-0 items-center border-b border-slate-200 bg-white px-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100"
          >
            <Menu size={24} />
          </button>
          <div className="ml-4 flex items-center gap-3">
            <img src="/logo.png" alt="OCL" className="h-8 object-contain lg:hidden" />
            <h1 className="truncate text-sm font-bold text-ocl-primary sm:text-lg">
              {activeSection === 'uploads' && !selectedUpload && 'Upload de Arquivos'}
              {selectedUpload && UPLOAD_TYPES.find((u) => u.id === selectedUpload)?.label}
            </h1>
          </div>
          {isMobile && !sidebarOpen && (
            <button
              onClick={onBack}
              title="Voltar"
              className="ml-auto flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              <ArrowLeft size={20} />
            </button>
          )}
        </header>
        <div className="flex-1 px-4 py-6 md:px-8">
          {activeSection === 'uploads' && !selectedUpload && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {UPLOAD_TYPES.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => setSelectedUpload(type.id)}
                    className="group flex flex-col items-center justify-center gap-4 rounded-3xl border border-slate-100 bg-white p-8 transition-all hover:-translate-y-1 hover:border-ocl-primary/30 hover:shadow-xl hover:shadow-ocl-primary/5"
                  >
                    <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-ocl-primary/10 text-ocl-primary transition-all group-hover:bg-ocl-primary group-hover:text-white group-hover:shadow-lg group-hover:shadow-ocl-primary/30">
                      <Icon size={40} />
                    </div>
                    <div className="text-center">
                      <h3 className="text-base font-bold text-slate-700 group-hover:text-ocl-primary">{type.label}</h3>
                      <p className="mt-1 text-xs text-slate-400">Clique para abrir o painel de importação</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {selectedUpload && (
            <div className="mx-auto max-w-2xl">
              <button
                onClick={() => setSelectedUpload(null)}
                className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 transition-colors hover:text-ocl-primary"
              >
                <ArrowLeft size={14} />
                Voltar para lista de uploads
              </button>
              <div className="origin-top scale-95">
                {selectedUpload === 'upload' && <FileUploader supabase={supabase} onDataSaved={onDataSaved} />}
                {selectedUpload === 'gca_upload' && <GCAUploader getToken={getToken} />}
                {selectedUpload === 'calendar_upload' && <CalendarUploader />}
                {selectedUpload === 'photo_base_upload' && <PhotoBaseUploader getToken={getToken} />}
                {selectedUpload === 'santander_goals_upload' && <SantanderGoalsUploader getToken={getToken} />}
                {selectedUpload === 'ocl_goals_upload' && <OCLGoalsUploader />}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
