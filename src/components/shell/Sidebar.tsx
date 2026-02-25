import { X, LogOut } from 'lucide-react';
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
  isHomolog: boolean;
  onTabChange: (id: string) => void;
  onClose: () => void;
  onLogout: () => void;
}

export const Sidebar = ({
  menu,
  activeTab,
  isOpen,
  isMobile,
  isHomolog,
  onTabChange,
  onClose,
  onLogout,
}: Readonly<SidebarProps>) => {
  const translateClass = isMobile && !isOpen ? '-translate-x-full' : 'translate-x-0';

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-gradient-to-b from-ocl-primary to-ocl-dark text-white shadow-2xl transition-all duration-300 ${isOpen ? 'w-72' : 'w-20'} ${translateClass}`}
    >
      <div className="relative flex h-24 items-center justify-center border-b border-white/10 p-6">
        {isOpen ? (
          <img src={LOGO_LIGHT_URL} alt="OCL" className="h-10 object-contain" />
        ) : (
          <img src={LOGO_LIGHT_URL} className="h-8" alt="OCL" />
        )}
        {isMobile && (
          <button onClick={onClose} className="absolute right-4 top-8 text-white/50">
            <X />
          </button>
        )}
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {menu.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${item.spacing ? 'mt-8' : ''} ${activeTab === item.id ? 'translate-x-1 bg-white font-bold text-ocl-primary shadow-lg' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
          >
            <item.icon size={20} /> {isOpen && <span>{item.label}</span>}
          </button>
        ))}
      </nav>
      <div className="border-t border-white/10 p-4">
        <button
          onClick={onLogout}
          className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-white/60 transition-colors hover:bg-white/5 hover:text-white ${!isOpen && 'justify-center'}`}
        >
          <LogOut size={20} />
          {isOpen && <span className="text-sm">Sair do Sistema</span>}
        </button>
        {isOpen && isHomolog && (
          <div className="mt-2 text-center font-mono text-[10px] text-amber-400">AMBIENTE DE TESTE</div>
        )}
      </div>
    </aside>
  );
};
