import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import type { MenuItem } from './Sidebar';

export interface AppShellTabs {
  menu: MenuItem[];
  activeTab: string;
  prevTab: MenuItem | null;
  nextTab: MenuItem | null;
  onTabChange: (id: string) => void;
}

export interface AppShellSidebar {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

interface AppShellProps {
  tabs: AppShellTabs;
  sidebar: AppShellSidebar;
  isMobile: boolean;
  currentDU: number | undefined;
  onLogout: () => void;
  onBackToSections?: () => void;
  children: ReactNode;
}

export const AppShell = ({
  tabs,
  sidebar,
  isMobile,
  currentDU,
  onLogout,
  onBackToSections,
  children,
}: Readonly<AppShellProps>) => {
  let mainMargin = 'ml-20';
  if (isMobile) mainMargin = 'ml-0';
  else if (sidebar.isOpen) mainMargin = 'ml-72';

  return (
    <div
      className="flex flex-col overflow-hidden bg-brand-bg font-sans text-slate-800 md:flex-row"
      style={{ minHeight: '100vh' }}
    >
      <Sidebar
        menu={tabs.menu}
        activeTab={tabs.activeTab}
        isOpen={sidebar.isOpen}
        isMobile={isMobile}
        onTabChange={(id) => {
          tabs.onTabChange(id);
          if (isMobile) sidebar.onClose();
        }}
        onClose={sidebar.onClose}
        onLogout={onLogout}
        onBackToSections={onBackToSections}
      />
      <main className={`flex flex-1 flex-col transition-all duration-300 ${mainMargin}`} style={{ minHeight: '100vh' }}>
        <Header
          menu={tabs.menu}
          activeTab={tabs.activeTab}
          isMobile={isMobile}
          currentDU={currentDU}
          prevTab={tabs.prevTab}
          nextTab={tabs.nextTab}
          onToggleSidebar={sidebar.onToggle}
          onTabChange={tabs.onTabChange}
          onLogout={onLogout}
        />
        <div className="relative flex-1 overflow-y-auto p-4 md:p-8">
          {isMobile && sidebar.isOpen && (
            <button
              type="button"
              className="fixed inset-0 z-40 m-0 h-full w-full cursor-default appearance-none border-none bg-black/50 p-0"
              aria-label="Fechar menu"
              onClick={sidebar.onClose}
            />
          )}
          {children}
        </div>
      </main>
    </div>
  );
};
