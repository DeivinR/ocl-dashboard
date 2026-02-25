import { useState } from 'react';
import {
  LayoutDashboard,
  Wallet,
  Handshake,
  Car,
  Gavel,
  FileText,
  Loader2,
  ShieldAlert,
  Database as DatabaseIcon,
} from 'lucide-react';
import { useIsMobile } from './hooks/useIsMobile';
import { useAuth } from './contexts/AuthContext';
import { AppShell } from './components/shell/AppShell';
import type { MenuItem } from './components/shell/Sidebar';
import { ProductDashboard } from './components/ProductDashboard';
import { FileUploader } from './components/FileUploader';
import { LoginScreen } from './components/LoginScreen';

const MENU: MenuItem[] = [
  { id: 'CONSOLIDADO', label: 'Visão Geral', icon: LayoutDashboard },
  { id: 'CASH', label: 'Cash (Recuperação)', icon: Wallet },
  { id: 'RENEGOCIAÇÃO', label: 'Renegociação', icon: Handshake },
  { id: 'ENTREGA AMIGÁVEL', label: 'Entrega Amigável', icon: Car },
  { id: 'APREENSÃO', label: 'Apreensão', icon: Gavel },
  { id: 'RETOMADAS', label: 'Retomadas', icon: FileText },
  { id: 'CONTENÇÃO', label: 'Contenção de Rolagem', icon: ShieldAlert, spacing: true },
  { id: 'gestao', label: 'Gestão de Dados', icon: DatabaseIcon, spacing: true },
];

const App = () => {
  const { user, data, setData, loading, isHomolog, isConfigured, supabase, logout, enterHomolog } = useAuth();
  const [activeTab, setActiveTab] = useState('CONSOLIDADO');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const isMobile = useIsMobile();

  const currentIndex = MENU.findIndex((m) => m.id === activeTab);
  const nextTab =
    currentIndex < MENU.length - 1 && MENU[currentIndex + 1]?.id !== 'gestao' ? (MENU[currentIndex + 1] ?? null) : null;
  const prevTab = currentIndex > 0 ? (MENU[currentIndex - 1] ?? null) : null;

  if (loading)
    return (
      <div className="flex items-center justify-center bg-brand-bg" style={{ minHeight: '100vh' }}>
        <Loader2 size={40} className="animate-spin text-ocl-primary" />
      </div>
    );
  if (!user && !isHomolog)
    return <LoginScreen supabase={supabase} onLogin={() => {}} onHomolog={enterHomolog} configError={!isConfigured} />;

  const dataContent = data ? (
    <ProductDashboard
      category={activeTab}
      data={data}
      isMobile={isMobile}
      onNext={() => {
        if (nextTab) {
          setActiveTab(nextTab.id);
          window.scrollTo(0, 0);
        }
      }}
      nextName={nextTab?.label}
    />
  ) : (
    <div className="flex h-full flex-col items-center justify-center text-slate-400">
      <DatabaseIcon size={64} className="mb-4 opacity-20" />
      <p>Nenhum dado carregado.</p>
      <button onClick={() => setActiveTab('gestao')} className="mt-4 font-bold text-ocl-primary hover:underline">
        Ir para Gestão de Dados
      </button>
    </div>
  );

  return (
    <AppShell
      menu={MENU}
      activeTab={activeTab}
      isMobile={isMobile}
      isSidebarOpen={isSidebarOpen}
      isHomolog={isHomolog}
      currentDU={data?.currentDU}
      prevTab={prevTab}
      nextTab={nextTab}
      onTabChange={setActiveTab}
      onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
      onCloseSidebar={() => setSidebarOpen(false)}
      onLogout={logout}
    >
      {activeTab === 'gestao' ? (
        <FileUploader supabase={supabase} onDataSaved={setData} isMobile={isMobile} isHomolog={isHomolog} />
      ) : (
        dataContent
      )}
    </AppShell>
  );
};

export default App;
