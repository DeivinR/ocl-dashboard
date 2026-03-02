import { Menu, LogOut, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import type { MenuItem } from './Sidebar';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  menu: MenuItem[];
  activeTab: string;
  isMobile: boolean;
  currentDU: number | undefined;
  prevTab: MenuItem | null;
  nextTab: MenuItem | null;
  onToggleSidebar: () => void;
  onTabChange: (id: string) => void;
  onLogout: () => void;
}

export const Header = ({
  menu,
  activeTab,
  isMobile,
  currentDU,
  prevTab,
  nextTab,
  onToggleSidebar,
  onTabChange,
  onLogout,
}: Readonly<HeaderProps>) => {
  const { profile } = useAuth();

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-4">
        <button onClick={onToggleSidebar} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100">
          <Menu size={20} />
        </button>
        <h2 className="hidden text-lg font-bold text-ocl-primary md:block">
          {menu.find((m) => m.id === activeTab)?.label}
        </h2>
      </div>

      <div className="flex items-center gap-3">
        {profile?.fullName && (
          <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 md:flex">
            <span>{profile.fullName}</span>
            {profile.role && <span className="text-slate-500">({profile.role})</span>}
          </div>
        )}

        {isMobile && (
          <div className="flex gap-1">
            <button onClick={onLogout} className="mr-2 rounded-lg bg-red-50 p-2 text-red-600" title="Sair">
              <LogOut size={16} />
            </button>
            <button
              onClick={() => {
                if (prevTab) onTabChange(prevTab.id);
              }}
              disabled={!prevTab}
              className="rounded-lg bg-slate-100 p-2 disabled:opacity-30"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => {
                if (nextTab) onTabChange(nextTab.id);
              }}
              disabled={!nextTab}
              className="rounded-lg bg-slate-100 p-2 disabled:opacity-30"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {currentDU !== undefined && (
          <div className="flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-bold text-ocl-primary">
            <Calendar size={14} /> {currentDU}º Dia Útil
          </div>
        )}
      </div>
    </header>
  );
};
