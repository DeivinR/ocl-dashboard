import { Menu, Calendar, ArrowLeft } from 'lucide-react';
import type { MenuItem } from './Sidebar';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  menu: MenuItem[];
  activeTab: string;
  isMobile: boolean;
  currentDU: number | undefined;
  onToggleSidebar: () => void;
  onBackToSections?: () => void;
}

export const Header = ({
  menu,
  activeTab,
  isMobile,
  currentDU,
  onToggleSidebar,
  onBackToSections,
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


        {currentDU !== undefined && (
          <div className="flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-bold text-ocl-primary">
            <Calendar size={14} /> {currentDU}º Dia Útil
          </div>
        )}

        {isMobile && onBackToSections && (
          <button
            onClick={onBackToSections}
            title="Voltar às Seções"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <ArrowLeft size={20} />
          </button>
        )}
      </div>
    </header>
  );
};
