import { X, LogOut, ArrowLeft } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const LOGO_LIGHT_URL = '/logo-white.png';

export interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  spacing?: boolean;
}

interface SidebarProps {
  menu: MenuItem[];
  activeTab: string;
  isOpen: boolean;
  isMobile: boolean;
  onTabChange: (id: string) => void;
  onClose: () => void;
  onLogout: () => void;
  onBackToSections?: () => void;
}

export const Sidebar = ({
  menu,
  activeTab,
  isOpen,
  isMobile,
  onTabChange,
  onClose,
  onLogout,
  onBackToSections,
}: Readonly<SidebarProps>) => {
  const translateClass = isMobile && !isOpen ? '-translate-x-full' : 'translate-x-0';

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex h-screen flex-col bg-gradient-to-b from-ocl-primary to-ocl-dark text-white shadow-2xl transition-all duration-300 supports-[height:100dvh]:h-[100dvh] ${isOpen ? 'w-72' : 'w-20'} ${translateClass}`}
    >
      <div className="relative flex h-24 items-center justify-center gap-3 border-b border-white/10 p-6">
        <div className="flex flex-1 items-center justify-center">
          {isOpen ? (
            <img src={LOGO_LIGHT_URL} alt="OCL" className="h-14 object-contain" />
          ) : (
            <img src={LOGO_LIGHT_URL} alt="OCL" className="h-12 object-contain" />
          )}
        </div>
        {!isMobile && isOpen && onBackToSections && (
          <button
            onClick={onBackToSections}
            title="Voltar às Seções"
            className="flex size-9 shrink-0 items-center justify-center rounded-xl text-white hover:bg-white/10"
          >
            <ArrowLeft size={18} />
          </button>
        )}
        {isMobile && (
          <button
            onClick={onClose}
            title="Fechar"
            className="absolute right-4 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {menu.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-transform ${item.spacing ? 'mt-8' : ''} ${activeTab === item.id ? 'translate-x-1 bg-white font-bold text-ocl-primary shadow-lg' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
          >
            <item.icon size={20} />
            {isOpen && <span>{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        <button
          onClick={onLogout}
          className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-white/60 hover:bg-white/5 hover:text-white ${!isOpen && 'justify-center'}`}
        >
          <LogOut size={20} />
          {isOpen && <span className="text-sm">Sair do Sistema</span>}
        </button>
      </div>
    </aside>
  );
};
