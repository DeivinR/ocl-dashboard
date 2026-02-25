import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import type { MenuItem } from './Sidebar';

interface AppShellProps {
  menu: MenuItem[];
  activeTab: string;
  isMobile: boolean;
  isSidebarOpen: boolean;
  isHomolog: boolean;
  currentDU: number | undefined;
  prevTab: MenuItem | null;
  nextTab: MenuItem | null;
  onTabChange: (id: string) => void;
  onToggleSidebar: () => void;
  onCloseSidebar: () => void;
  onLogout: () => void;
  children: ReactNode;
}

export const AppShell = ({
  menu,
  activeTab,
  isMobile,
  isSidebarOpen,
  isHomolog,
  currentDU,
  prevTab,
  nextTab,
  onTabChange,
  onToggleSidebar,
  onCloseSidebar,
  onLogout,
  children,
}: Readonly<AppShellProps>) => {
  let mainMargin = 'ml-20';
  if (isMobile) mainMargin = 'ml-0';
  else if (isSidebarOpen) mainMargin = 'ml-72';

  return (
    <div
      className="flex flex-col overflow-hidden bg-brand-bg font-sans text-slate-800 md:flex-row"
      style={{ minHeight: '100vh' }}
    >
      <Sidebar
        menu={menu}
        activeTab={activeTab}
        isOpen={isSidebarOpen}
        isMobile={isMobile}
        isHomolog={isHomolog}
        onTabChange={(id) => {
          onTabChange(id);
          if (isMobile) onCloseSidebar();
        }}
        onClose={onCloseSidebar}
        onLogout={onLogout}
      />
      <main className={`flex flex-1 flex-col transition-all duration-300 ${mainMargin}`} style={{ minHeight: '100vh' }}>
        <Header
          menu={menu}
          activeTab={activeTab}
          isMobile={isMobile}
          currentDU={currentDU}
          prevTab={prevTab}
          nextTab={nextTab}
          onToggleSidebar={onToggleSidebar}
          onTabChange={onTabChange}
          onLogout={onLogout}
        />
        <div className="relative flex-1 overflow-y-auto p-4 md:p-8">
          {isMobile && isSidebarOpen && (
            <button
              type="button"
              className="fixed inset-0 z-40 m-0 h-full w-full cursor-default appearance-none border-none bg-black/50 p-0"
              aria-label="Fechar menu"
              onClick={onCloseSidebar}
            ></button>
          )}
          {children}
        </div>
      </main>
    </div>
  );
};
